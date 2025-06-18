import { useState, useEffect, useCallback } from 'react';
import { RetryQueue, RetryRequest, RetryPriority } from '../utils/RetryQueue';

interface UseRetryQueueOptions {
  onQueued?: (queueSize: number) => void;
  onDequeued?: (queueSize: number) => void;
  onRetry?: (attempt: number, queueSize: number) => void;
}

interface QueueStats {
  total: number;
  byPriority: Record<RetryPriority, number>;
  processing: number;
}

export function useRetryQueue(options: UseRetryQueueOptions = {}) {
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
    processing: 0
  });

  const retryQueue = RetryQueue.getInstance();

  useEffect(() => {
    const unsubscribeQueued = retryQueue.subscribe('queued', (data) => {
      setStats(retryQueue.getStats());
      options.onQueued?.(data.queueSize);
    });

    const unsubscribeDequeued = retryQueue.subscribe('dequeued', (data) => {
      setStats(retryQueue.getStats());
      options.onDequeued?.(data.queueSize);
    });

    const unsubscribeRetry = retryQueue.subscribe('retry', (data) => {
      setStats(retryQueue.getStats());
      if (data.attempt) {
        options.onRetry?.(data.attempt, data.queueSize);
      }
    });

    return () => {
      unsubscribeQueued();
      unsubscribeDequeued();
      unsubscribeRetry();
    };
  }, [options.onQueued, options.onDequeued, options.onRetry]);

  const enqueue = useCallback(<T>(
    operation: () => Promise<T>,
    {
      id,
      priority = 'medium',
      maxRetries = 3,
      delay,
      dependencies,
      onSuccess,
      onError,
      onRetry
    }: Omit<RetryRequest<T>, 'operation'>
  ) => {
    return retryQueue.enqueue({
      id,
      operation,
      priority,
      maxRetries,
      delay,
      dependencies,
      onSuccess,
      onError,
      onRetry
    });
  }, []);

  const dequeue = useCallback((id: string) => {
    return retryQueue.dequeue(id);
  }, []);

  return {
    enqueue,
    dequeue,
    stats
  };
} 
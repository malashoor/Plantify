import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useRetryQueue } from '../useRetryQueue';
import { RetryQueue } from '../../utils/RetryQueue';

// Mock RetryQueue
jest.mock('../../utils/RetryQueue', () => {
  const mockQueue = {
    enqueue: jest.fn(),
    dequeue: jest.fn(),
    getStats: jest.fn(() => ({
      total: 0,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
      processing: 0
    })),
    subscribe: jest.fn((event, callback) => () => {}),
  };

  return {
    RetryQueue: {
      getInstance: jest.fn(() => mockQueue)
    }
  };
});

describe('useRetryQueue', () => {
  let retryQueue: jest.Mocked<RetryQueue>;
  let mockSubscriptions: Record<string, (data: any) => void> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    retryQueue = RetryQueue.getInstance() as jest.Mocked<RetryQueue>;
    mockSubscriptions = {};

    // Setup mock subscribe implementation
    (retryQueue.subscribe as jest.Mock).mockImplementation((event, callback) => {
      mockSubscriptions[event] = callback;
      return () => { delete mockSubscriptions[event]; };
    });
  });

  it('should provide queue stats initially', () => {
    const { result } = renderHook(() => useRetryQueue());
    
    expect(result.current.stats).toEqual({
      total: 0,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
      processing: 0
    });
  });

  it('should provide stable enqueue and dequeue functions', () => {
    const { result, rerender } = renderHook(() => useRetryQueue());
    
    const firstEnqueue = result.current.enqueue;
    const firstDequeue = result.current.dequeue;
    
    rerender();
    
    expect(result.current.enqueue).toBe(firstEnqueue);
    expect(result.current.dequeue).toBe(firstDequeue);
  });

  it('should update stats when queue changes', () => {
    (retryQueue.getStats as jest.Mock).mockReturnValue({
      total: 1,
      byPriority: { critical: 0, high: 1, medium: 0, low: 0 },
      processing: 1
    });

    const { result } = renderHook(() => useRetryQueue());
    
    act(() => {
      mockSubscriptions.queued?.({ id: 'test', priority: 'high', queueSize: 1 });
    });
    
    expect(result.current.stats.total).toBe(1);
    expect(result.current.stats.byPriority.high).toBe(1);
    expect(result.current.stats.processing).toBe(1);
  });

  it('should call onQueued callback when task is queued', () => {
    const onQueued = jest.fn();
    renderHook(() => useRetryQueue({ onQueued }));
    
    act(() => {
      mockSubscriptions.queued?.({ id: 'test', queueSize: 1 });
    });
    
    expect(onQueued).toHaveBeenCalledWith(1);
  });

  it('should call onDequeued callback when task is dequeued', () => {
    const onDequeued = jest.fn();
    renderHook(() => useRetryQueue({ onDequeued }));
    
    act(() => {
      mockSubscriptions.dequeued?.({ id: 'test', queueSize: 0 });
    });
    
    expect(onDequeued).toHaveBeenCalledWith(0);
  });

  it('should call onRetry callback when task is retried', () => {
    const onRetry = jest.fn();
    renderHook(() => useRetryQueue({ onRetry }));
    
    act(() => {
      mockSubscriptions.retry?.({ id: 'test', attempt: 2, queueSize: 1 });
    });
    
    expect(onRetry).toHaveBeenCalledWith(2, 1);
  });

  it('should cleanup subscriptions on unmount', () => {
    const { unmount } = renderHook(() => useRetryQueue());
    
    unmount();
    
    expect(mockSubscriptions).toEqual({});
  });

  it('should handle enqueue operation correctly', async () => {
    (retryQueue.enqueue as jest.Mock).mockReturnValue('test-id');
    
    const { result } = renderHook(() => useRetryQueue());
    const operation = jest.fn().mockResolvedValue('success');
    
    const id = result.current.enqueue(operation, {
      id: 'test',
      priority: 'high'
    });
    
    expect(id).toBe('test-id');
    expect(retryQueue.enqueue).toHaveBeenCalledWith({
      id: 'test',
      operation,
      priority: 'high'
    });
  });

  it('should handle dequeue operation correctly', () => {
    (retryQueue.dequeue as jest.Mock).mockReturnValue(true);
    
    const { result } = renderHook(() => useRetryQueue());
    
    const success = result.current.dequeue('test-id');
    
    expect(success).toBe(true);
    expect(retryQueue.dequeue).toHaveBeenCalledWith('test-id');
  });

  it('should handle multiple callbacks for the same event', () => {
    const onQueued1 = jest.fn();
    const onQueued2 = jest.fn();
    
    const { rerender } = renderHook(
      (props) => useRetryQueue(props),
      { initialProps: { onQueued: onQueued1 } }
    );
    
    act(() => {
      mockSubscriptions.queued?.({ id: 'test', queueSize: 1 });
    });
    
    expect(onQueued1).toHaveBeenCalledWith(1);
    
    rerender({ onQueued: onQueued2 });
    
    act(() => {
      mockSubscriptions.queued?.({ id: 'test', queueSize: 2 });
    });
    
    expect(onQueued2).toHaveBeenCalledWith(2);
    expect(onQueued1).toHaveBeenCalledTimes(1);
  });
}); 
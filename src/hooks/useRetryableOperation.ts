import { useState, useCallback, useRef, useEffect } from 'react';
import { RetryQueue } from '../utils/RetryQueue';
import { RetryOperationKey, RetryOperationKeys, generateOperationId, createOperationData } from '../services/RetryOperations';
import { useToast } from './useToast';
import { useVoiceAnnouncement } from '../components/utils/VoiceAnnouncement';
import { haptics } from '../utils/haptics';

interface RetryableOperationOptions {
  priority?: 'critical' | 'high' | 'medium' | 'low';
  maxRetries?: number;
  showFeedback?: boolean;
  isVolatile?: boolean;
  dependencies?: string[];
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onRetry?: (attempt: number) => void;
}

interface RetryState {
  isQueued: boolean;
  isProcessing: boolean;
  attempt: number;
  error: Error | null;
  nextRetry: number | null;
}

export function useRetryableOperation(
  operationKey: RetryOperationKey,
  uniqueId: string,
  options: RetryableOperationOptions = {}
) {
  const {
    priority = 'medium',
    maxRetries = 3,
    showFeedback = true,
    isVolatile = false,
    dependencies,
    onSuccess,
    onError,
    onRetry
  } = options;

  const [state, setState] = useState<RetryState>({
    isQueued: false,
    isProcessing: false,
    attempt: 0,
    error: null,
    nextRetry: null
  });

  const retryQueue = RetryQueue.getInstance();
  const toast = useToast();
  const { announceQueue } = useVoiceAnnouncement();
  const operationId = useRef<string | null>(null);
  const retryTimeout = useRef<NodeJS.Timeout>();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, []);

  const handleSuccess = useCallback((result: any) => {
    setState(prev => ({
      ...prev,
      isQueued: false,
      isProcessing: false,
      error: null,
      nextRetry: null
    }));

    if (showFeedback) {
      toast.success('Operation completed successfully');
      haptics.success();
    }

    onSuccess?.(result);
  }, [showFeedback, onSuccess]);

  const handleError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      isProcessing: false,
      error,
      nextRetry: null
    }));

    if (showFeedback) {
      toast.error('Operation failed');
      haptics.error();
      announceQueue([
        'Operation failed.',
        'Please check your connection and try again.'
      ]);
    }

    onError?.(error);
  }, [showFeedback, onError]);

  const handleRetry = useCallback((attempt: number) => {
    const delay = 1000 * Math.pow(2, attempt - 1);
    
    setState(prev => ({
      ...prev,
      isProcessing: true,
      attempt,
      nextRetry: Date.now() + delay
    }));

    if (showFeedback) {
      toast.info(`Retrying... (${attempt}/${maxRetries})`);
      haptics.warning();
      announceQueue([`Retrying operation. Attempt ${attempt} of ${maxRetries}`]);
    }

    retryTimeout.current = setTimeout(() => {
      setState(prev => ({ ...prev, nextRetry: null }));
    }, delay);

    onRetry?.(attempt);
  }, [maxRetries, showFeedback, onRetry]);

  const execute = useCallback(async (...args: any[]) => {
    if (operationId.current) {
      // Operation already in progress
      return;
    }

    const id = generateOperationId(operationKey, uniqueId);
    operationId.current = id;

    setState({
      isQueued: true,
      isProcessing: true,
      attempt: 0,
      error: null,
      nextRetry: null
    });

    if (showFeedback) {
      toast.info('Operation queued');
      haptics.light();
    }

    retryQueue.enqueue({
      id,
      operationKey,
      operationData: createOperationData(args),
      priority,
      maxRetries,
      isVolatile,
      dependencies,
      onSuccess: (result) => {
        operationId.current = null;
        handleSuccess(result);
      },
      onError: (error) => {
        operationId.current = null;
        handleError(error);
      },
      onRetry: handleRetry
    });
  }, [
    operationKey,
    uniqueId,
    priority,
    maxRetries,
    isVolatile,
    dependencies,
    handleSuccess,
    handleError,
    handleRetry
  ]);

  const cancel = useCallback(() => {
    if (operationId.current) {
      retryQueue.dequeue(operationId.current);
      operationId.current = null;

      setState({
        isQueued: false,
        isProcessing: false,
        attempt: 0,
        error: null,
        nextRetry: null
      });

      if (showFeedback) {
        toast.info('Operation cancelled');
        haptics.light();
      }
    }
  }, [showFeedback]);

  return {
    execute,
    cancel,
    ...state,
    remainingRetries: maxRetries - state.attempt
  };
} 
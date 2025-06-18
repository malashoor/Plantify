import { useState, useEffect, useCallback, useRef } from 'react';
import { RetryController, RetryConfig, RetryState } from '../utils/retryUtils';

export interface UseRetryOptions extends Partial<RetryConfig> {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseRetryResult<T> {
  execute: () => Promise<T>;
  retryNow: () => void;
  cancel: () => void;
  isLoading: boolean;
  error: Error | null;
  attempt: number;
  nextRetryMs: number;
  isRetrying: boolean;
  isOffline: boolean;
  timeRemaining: number | null;
}

export function useRetry<T>(
  operation: () => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryResult<T> {
  const [state, setState] = useState<RetryState>({
    attempt: 0,
    nextRetryMs: 0,
    error: null,
    isRetrying: false,
    isOffline: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const retryControllerRef = useRef<RetryController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function for the countdown timer
  const clearCountdownTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Update countdown timer
  useEffect(() => {
    clearCountdownTimer();

    if (state.isRetrying && state.nextRetryMs > 0) {
      const startTime = Date.now();
      setTimeRemaining(state.nextRetryMs);

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, state.nextRetryMs - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0) {
          clearCountdownTimer();
        }
      }, 100);
    } else {
      setTimeRemaining(null);
    }

    return clearCountdownTimer;
  }, [state.isRetrying, state.nextRetryMs, clearCountdownTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCountdownTimer();
      retryControllerRef.current?.destroy();
    };
  }, [clearCountdownTimer]);

  const handleStateChange = useCallback((newState: RetryState) => {
    setState(newState);
  }, []);

  const executeWithRetry = useCallback(async () => {
    setIsLoading(true);
    setState(prev => ({ ...prev, error: null }));

    try {
      if (!retryControllerRef.current) {
        retryControllerRef.current = new RetryController(options, handleStateChange);
      }

      const result = await retryControllerRef.current.execute(operation, options);
      options.onSuccess?.();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        setState(prev => ({ ...prev, error }));
        options.onError?.(error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [operation, options, handleStateChange]);

  const retryNow = useCallback(() => {
    retryControllerRef.current?.retryNow();
  }, []);

  const cancel = useCallback(() => {
    retryControllerRef.current?.cancel();
    clearCountdownTimer();
  }, [clearCountdownTimer]);

  return {
    execute: executeWithRetry,
    retryNow,
    cancel,
    isLoading,
    error: state.error,
    attempt: state.attempt,
    nextRetryMs: state.nextRetryMs,
    isRetrying: state.isRetrying,
    isOffline: state.isOffline,
    timeRemaining,
  };
}

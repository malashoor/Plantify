import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useRetryableOperation } from '../useRetryableOperation';
import { RetryOperationKeys } from '../../services/RetryOperations';
import {
  NetworkSimulator,
  StorageSimulator,
  QueueEventTracker,
  TestRetryQueue,
  waitForQueueEvent,
} from '../../utils/__tests__/testUtils';

describe('useRetryableOperation', () => {
  beforeEach(async () => {
    // Reset all simulators
    NetworkSimulator.reset();
    await StorageSimulator.clearStorage();
    QueueEventTracker.reset();
    TestRetryQueue.getInstance();
  });

  it('should execute operation successfully', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useRetryableOperation(RetryOperationKeys.SAVE_PLANT, 'test-id', {
        onSuccess,
        showFeedback: false,
      })
    );

    // Execute operation
    await act(async () => {
      await result.current.execute({ name: 'Test Plant' });
    });

    // Wait for success event
    await waitForQueueEvent('success');

    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle operation failure and retry', async () => {
    const onError = jest.fn();
    const onRetry = jest.fn();

    // Set 50% failure rate
    NetworkSimulator.setFailureRate(0.5);

    const { result } = renderHook(() =>
      useRetryableOperation(RetryOperationKeys.SAVE_PLANT, 'test-id', {
        maxRetries: 3,
        onError,
        onRetry,
        showFeedback: false,
      })
    );

    // Execute operation
    await act(async () => {
      await result.current.execute({ name: 'Test Plant' });
    });

    // Wait for retry events
    await waitForQueueEvent('retry');

    expect(onRetry).toHaveBeenCalled();
    expect(result.current.attempt).toBeGreaterThan(0);
  });

  it('should respect maxRetries limit', async () => {
    const onError = jest.fn();

    // Force all requests to fail
    NetworkSimulator.setFailureRate(1);

    const { result } = renderHook(() =>
      useRetryableOperation(RetryOperationKeys.SAVE_PLANT, 'test-id', {
        maxRetries: 2,
        onError,
        showFeedback: false,
      })
    );

    // Execute operation
    await act(async () => {
      await result.current.execute({ name: 'Test Plant' });
    });

    // Wait for error event
    await waitForQueueEvent('error');

    expect(onError).toHaveBeenCalled();
    expect(result.current.attempt).toBe(2);
    expect(result.current.error).toBeTruthy();
  });

  it('should handle operation cancellation', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useRetryableOperation(RetryOperationKeys.SAVE_PLANT, 'test-id', {
        onSuccess,
        showFeedback: false,
      })
    );

    // Execute and immediately cancel
    await act(async () => {
      await result.current.execute({ name: 'Test Plant' });
      result.current.cancel();
    });

    expect(result.current.isProcessing).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should handle volatile operations', async () => {
    const { result } = renderHook(() =>
      useRetryableOperation(RetryOperationKeys.UPDATE_WEATHER_CACHE, 'test-id', {
        isVolatile: true,
        showFeedback: false,
      })
    );

    // Execute volatile operation
    await act(async () => {
      await result.current.execute({ temperature: 25 });
    });

    // Check storage
    const state = await StorageSimulator.getQueueState();
    expect(state?.volatileOperations).toBeTruthy();
  });

  it('should handle operation dependencies', async () => {
    const { result } = renderHook(() =>
      useRetryableOperation(RetryOperationKeys.LOG_PLANT_MOOD, 'test-id', {
        dependencies: ['save-plant'],
        showFeedback: false,
      })
    );

    // Execute dependent operation
    await act(async () => {
      await result.current.execute(1, 5);
    });

    const events = QueueEventTracker.getEvents();
    const enqueueEvent = events.find(e => e.type === 'enqueue');
    expect(enqueueEvent?.data.dependencies).toContain('save-plant');
  });

  it('should update state correctly during operation lifecycle', async () => {
    const { result } = renderHook(() =>
      useRetryableOperation(RetryOperationKeys.SAVE_PLANT, 'test-id', {
        showFeedback: false,
      })
    );

    // Initial state
    expect(result.current.isQueued).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.error).toBeNull();

    // Execute operation
    await act(async () => {
      await result.current.execute({ name: 'Test Plant' });
    });

    // Processing state
    expect(result.current.isQueued).toBe(true);
    expect(result.current.isProcessing).toBe(true);

    // Wait for completion
    await waitForQueueEvent('success');

    // Final state
    expect(result.current.isQueued).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should prevent multiple concurrent executions', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useRetryableOperation(RetryOperationKeys.SAVE_PLANT, 'test-id', {
        onSuccess,
        showFeedback: false,
      })
    );

    // Try to execute multiple times
    await act(async () => {
      await result.current.execute({ name: 'Test Plant 1' });
      await result.current.execute({ name: 'Test Plant 2' });
      await result.current.execute({ name: 'Test Plant 3' });
    });

    await waitForQueueEvent('success');

    // Only one operation should have been processed
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('should cleanup on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useRetryableOperation(RetryOperationKeys.SAVE_PLANT, 'test-id', {
        showFeedback: false,
      })
    );

    // Execute operation
    await act(async () => {
      await result.current.execute({ name: 'Test Plant' });
    });

    // Unmount during processing
    unmount();

    // Operation should be cancelled
    expect(result.current.isProcessing).toBe(false);
  });
});

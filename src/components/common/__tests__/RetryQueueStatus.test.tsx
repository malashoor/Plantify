import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { RetryQueueStatus } from '../RetryQueueStatus';
import { TestRetryQueue, renderWithQueue } from '../../../utils/__tests__/testUtils';
import { RetryOperationKeys } from '../../../services/RetryOperations';

describe('RetryQueueStatus', () => {
  beforeEach(() => {
    // Reset queue instance before each test
    TestRetryQueue.getInstance();
  });

  it('should not be visible when queue is empty', () => {
    const { queryByText } = render(<RetryQueueStatus />);
    expect(queryByText('Retry Queue Status')).toBeNull();
  });

  it('should show queue size when operations are added', async () => {
    const { getByText } = renderWithQueue(<RetryQueueStatus />);
    const queue = TestRetryQueue.getInstance();

    await act(async () => {
      await queue.enqueue({
        id: 'test-1',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Test Plant' }])
      });
    });

    expect(getByText('1')).toBeTruthy();
  });

  it('should show operation details in development mode', async () => {
    const { getByText } = renderWithQueue(<RetryQueueStatus showDetails={true} />);
    const queue = TestRetryQueue.getInstance();

    await act(async () => {
      await queue.enqueue({
        id: 'test-1',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Test Plant' }])
      });
    });

    expect(getByText(RetryOperationKeys.SAVE_PLANT)).toBeTruthy();
    expect(getByText('Queued')).toBeTruthy();
  });

  it('should update status when operation starts processing', async () => {
    const { getByText } = renderWithQueue(<RetryQueueStatus showDetails={true} />);
    const queue = TestRetryQueue.getInstance();

    await act(async () => {
      const operation = await queue.enqueue({
        id: 'test-1',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Test Plant' }])
      });

      // Simulate processing start
      operation.isProcessing = true;
      queue.notifySubscribers();
    });

    expect(getByText('Processing')).toBeTruthy();
  });

  it('should show retry attempts', async () => {
    const { getByText } = renderWithQueue(<RetryQueueStatus showDetails={true} />);
    const queue = TestRetryQueue.getInstance();

    await act(async () => {
      const operation = await queue.enqueue({
        id: 'test-1',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Test Plant' }]),
        maxRetries: 3
      });

      // Simulate retry
      operation.attempt = 2;
      operation.isProcessing = true;
      queue.notifySubscribers();
    });

    expect(getByText('Processing (2/3)')).toBeTruthy();
  });

  it('should be accessible', async () => {
    const { getByRole } = renderWithQueue(<RetryQueueStatus showDetails={true} />);
    const queue = TestRetryQueue.getInstance();

    await act(async () => {
      await queue.enqueue({
        id: 'test-1',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Test Plant' }])
      });
    });

    const status = getByRole('alert');
    expect(status).toBeTruthy();
    expect(status.props.accessibilityLiveRegion).toBe('polite');
  });

  it('should have accessible operation items', async () => {
    const { getAllByRole } = renderWithQueue(<RetryQueueStatus showDetails={true} />);
    const queue = TestRetryQueue.getInstance();

    await act(async () => {
      await queue.enqueue({
        id: 'test-1',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Test Plant' }]),
        maxRetries: 3,
        attempt: 1
      });
    });

    const items = getAllByRole('text');
    expect(items[0].props.accessibilityLabel).toContain('savePlant operation');
    expect(items[0].props.accessibilityLabel).toContain('attempt 1 of 3');
  });

  it('should animate when queue state changes', async () => {
    const { getByTestId, rerender } = renderWithQueue(<RetryQueueStatus />);
    const queue = TestRetryQueue.getInstance();

    // Add operation
    await act(async () => {
      await queue.enqueue({
        id: 'test-1',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Test Plant' }])
      });
      rerender(<RetryQueueStatus />);
    });

    const container = getByTestId('retry-queue-status');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        opacity: expect.any(Object), // Animated.Value
        transform: expect.arrayContaining([
          expect.objectContaining({
            translateY: expect.any(Object) // Animated.Value
          })
        ])
      })
    );
  });

  it('should handle multiple operations', async () => {
    const { getByText } = renderWithQueue(<RetryQueueStatus showDetails={true} />);
    const queue = TestRetryQueue.getInstance();

    await act(async () => {
      // Add multiple operations
      await queue.enqueue({
        id: 'test-1',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Plant 1' }])
      });

      await queue.enqueue({
        id: 'test-2',
        operationKey: RetryOperationKeys.UPDATE_WEATHER_CACHE,
        operationData: JSON.stringify([{ temperature: 25 }])
      });

      await queue.enqueue({
        id: 'test-3',
        operationKey: RetryOperationKeys.LOG_PLANT_MOOD,
        operationData: JSON.stringify([1, 5])
      });
    });

    expect(getByText('3')).toBeTruthy();
    expect(getByText(RetryOperationKeys.SAVE_PLANT)).toBeTruthy();
    expect(getByText(RetryOperationKeys.UPDATE_WEATHER_CACHE)).toBeTruthy();
    expect(getByText(RetryOperationKeys.LOG_PLANT_MOOD)).toBeTruthy();
  });
}); 
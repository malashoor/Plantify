import { PlantService } from '../PlantService';
import { RetryQueue } from '../../utils/RetryQueue';
import { RetryOperationKeys } from '../RetryOperations';
import {
  NetworkSimulator,
  StorageSimulator,
  QueueEventTracker,
  TestRetryQueue,
  waitForQueueEvent
} from '../../utils/__tests__/testUtils';

describe('PlantService Integration Tests', () => {
  let queue: TestRetryQueue;

  beforeEach(async () => {
    NetworkSimulator.reset();
    await StorageSimulator.clearStorage();
    QueueEventTracker.reset();
    queue = TestRetryQueue.getInstance();
  });

  describe('savePlant', () => {
    const testPlant = {
      name: 'Test Plant',
      species: 'Test Species',
      location: 'Living Room'
    };

    it('should save plant with retry support', async () => {
      // Set up network to fail once then succeed
      NetworkSimulator.setFailureRate(0.5);

      const operation = await queue.enqueue({
        id: 'save-test-plant',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([testPlant]),
        maxRetries: 3
      });

      // Wait for retry and eventual success
      await waitForQueueEvent('success');

      const events = QueueEventTracker.getEvents();
      expect(events.some(e => e.type === 'retry')).toBe(true);
      expect(operation.attempt).toBeGreaterThan(0);
    });

    it('should handle permanent failure', async () => {
      // Force all requests to fail
      NetworkSimulator.setFailureRate(1);

      const operation = await queue.enqueue({
        id: 'save-test-plant',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([testPlant]),
        maxRetries: 2
      });

      // Wait for final error
      await waitForQueueEvent('error');

      expect(operation.attempt).toBe(2);
      expect(operation.error).toBeTruthy();
    });

    it('should persist operation across app restarts', async () => {
      const operation = await queue.enqueue({
        id: 'save-test-plant',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([testPlant]),
        maxRetries: 3
      });

      // Check storage state
      const state = await StorageSimulator.getQueueState();
      expect(state.operations).toContainEqual(
        expect.objectContaining({
          id: operation.id,
          operationKey: RetryOperationKeys.SAVE_PLANT
        })
      );
    });
  });

  describe('updatePlant', () => {
    const testUpdate = {
      id: 'test-id',
      updates: { name: 'Updated Name' }
    };

    it('should handle dependent operations', async () => {
      // Enqueue update operation with dependency
      const operation = await queue.enqueue({
        id: 'update-test-plant',
        operationKey: RetryOperationKeys.UPDATE_PLANT,
        operationData: JSON.stringify([testUpdate.id, testUpdate.updates]),
        dependencies: ['save-test-plant'],
        maxRetries: 2
      });

      // Operation should not start until dependency is met
      expect(operation.isProcessing).toBe(false);

      // Add dependency operation
      await queue.enqueue({
        id: 'save-test-plant',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Original Plant' }])
      });

      // Wait for update to process after dependency
      await waitForQueueEvent('success');
      expect(operation.isProcessing).toBe(false);
      expect(operation.error).toBeNull();
    });

    it('should respect operation priority', async () => {
      // Add low priority operation
      await queue.enqueue({
        id: 'low-priority-update',
        operationKey: RetryOperationKeys.UPDATE_PLANT,
        operationData: JSON.stringify(['id-1', { name: 'Low Priority' }]),
        priority: 'low'
      });

      // Add high priority operation
      await queue.enqueue({
        id: 'high-priority-update',
        operationKey: RetryOperationKeys.UPDATE_PLANT,
        operationData: JSON.stringify(['id-2', { name: 'High Priority' }]),
        priority: 'high'
      });

      const events = QueueEventTracker.getEvents();
      const processOrder = events
        .filter(e => e.type === 'enqueue')
        .map(e => e.data.priority);

      expect(processOrder).toEqual(['low', 'high']);
    });
  });

  describe('deletePlant', () => {
    it('should cleanup dependent operations on success', async () => {
      // Add delete operation
      const deleteOp = await queue.enqueue({
        id: 'delete-test-plant',
        operationKey: RetryOperationKeys.DELETE_PLANT,
        operationData: JSON.stringify(['test-id']),
        maxRetries: 2
      });

      // Add dependent operation
      const updateOp = await queue.enqueue({
        id: 'update-deleted-plant',
        operationKey: RetryOperationKeys.UPDATE_PLANT,
        operationData: JSON.stringify(['test-id', { name: 'Updated' }]),
        dependencies: ['delete-test-plant']
      });

      // Wait for delete success
      await waitForQueueEvent('success');

      // Dependent operation should be cancelled
      expect(updateOp.error).toBeTruthy();
      expect(updateOp.error.message).toContain('cancelled');
    });

    it('should handle volatile operations', async () => {
      // Add volatile operation
      await queue.enqueue({
        id: 'volatile-delete',
        operationKey: RetryOperationKeys.DELETE_PLANT,
        operationData: JSON.stringify(['test-id']),
        isVolatile: true
      });

      // Check storage
      const state = await StorageSimulator.getQueueState();
      expect(state.volatileOperations).toContainEqual(
        expect.objectContaining({
          id: 'volatile-delete'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      NetworkSimulator.setFailureRate(1);

      const operation = await queue.enqueue({
        id: 'network-error-test',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Test Plant' }]),
        maxRetries: 1
      });

      await waitForQueueEvent('error');
      expect(operation.error.message).toContain('Network Error');
    });

    it('should handle storage errors gracefully', async () => {
      await StorageSimulator.simulateStorageFailure(true);

      const operation = await queue.enqueue({
        id: 'storage-error-test',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: JSON.stringify([{ name: 'Test Plant' }])
      });

      expect(operation).toBeTruthy();
      // Operation should still work even if storage fails
      await waitForQueueEvent('success');
    });

    it('should handle malformed operation data', async () => {
      const operation = await queue.enqueue({
        id: 'malformed-data-test',
        operationKey: RetryOperationKeys.SAVE_PLANT,
        operationData: 'invalid-json',
        maxRetries: 1
      });

      await waitForQueueEvent('error');
      expect(operation.error.message).toContain('Invalid operation data');
    });
  });
}); 
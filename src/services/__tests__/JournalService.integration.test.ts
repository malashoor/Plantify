import { JournalService } from '../JournalService';
import { RetryQueue } from '../../utils/RetryQueue';
import { RetryOperationKeys } from '../RetryOperations';
import {
  NetworkSimulator,
  StorageSimulator,
  QueueEventTracker,
  TestRetryQueue,
  waitForQueueEvent,
} from '../../utils/__tests__/testUtils';

describe('JournalService Integration Tests', () => {
  let queue: TestRetryQueue;

  beforeEach(async () => {
    NetworkSimulator.reset();
    await StorageSimulator.clearStorage();
    QueueEventTracker.reset();
    queue = TestRetryQueue.getInstance();
  });

  describe('addJournalEntry', () => {
    const testEntry = {
      mood: 4,
      note: 'Test journal entry',
      plantId: 'test-plant-id',
      images: [],
    };

    it('should add entry with retry support', async () => {
      // Set up network to fail once then succeed
      NetworkSimulator.setFailureRate(0.5);

      const operation = await queue.enqueue({
        id: 'add-journal-entry',
        operationKey: RetryOperationKeys.ADD_JOURNAL_ENTRY,
        operationData: JSON.stringify([testEntry]),
        maxRetries: 3,
      });

      // Wait for retry and eventual success
      await waitForQueueEvent('success');

      const events = QueueEventTracker.getEvents();
      expect(events.some(e => e.type === 'retry')).toBe(true);
      expect(operation.attempt).toBeGreaterThan(0);
    });

    it('should trigger plant mood update after entry', async () => {
      const operation = await queue.enqueue({
        id: 'add-entry-with-mood',
        operationKey: RetryOperationKeys.ADD_JOURNAL_ENTRY,
        operationData: JSON.stringify([testEntry]),
      });

      // Wait for entry to be added
      await waitForQueueEvent('success');

      // Check that mood update was triggered
      const events = QueueEventTracker.getEvents();
      const moodUpdate = events.find(
        e => e.type === 'enqueue' && e.data.operationKey === RetryOperationKeys.LOG_PLANT_MOOD
      );

      expect(moodUpdate).toBeTruthy();
      expect(moodUpdate.data.dependencies).toContain(operation.id);
    });
  });

  describe('updateJournalEntry', () => {
    const testUpdate = {
      id: 'test-entry-id',
      updates: {
        mood: 5,
        note: 'Updated note',
      },
    };

    it('should handle entry updates with dependencies', async () => {
      // Add update operation with dependency
      const updateOp = await queue.enqueue({
        id: 'update-entry',
        operationKey: RetryOperationKeys.UPDATE_JOURNAL_ENTRY,
        operationData: JSON.stringify([testUpdate.id, testUpdate.updates]),
        dependencies: ['add-entry'],
      });

      // Operation should wait for dependency
      expect(updateOp.isProcessing).toBe(false);

      // Add dependency operation
      await queue.enqueue({
        id: 'add-entry',
        operationKey: RetryOperationKeys.ADD_JOURNAL_ENTRY,
        operationData: JSON.stringify([
          {
            mood: 3,
            note: 'Original note',
          },
        ]),
      });

      // Wait for update to complete
      await waitForQueueEvent('success');
      expect(updateOp.error).toBeNull();
    });

    it('should update plant mood only if mood changed', async () => {
      // Update without mood change
      await queue.enqueue({
        id: 'update-no-mood-change',
        operationKey: RetryOperationKeys.UPDATE_JOURNAL_ENTRY,
        operationData: JSON.stringify([testUpdate.id, { note: 'Just a note update' }]),
      });

      await waitForQueueEvent('success');

      // Check that no mood update was triggered
      const events = QueueEventTracker.getEvents();
      const moodUpdate = events.find(
        e => e.type === 'enqueue' && e.data.operationKey === RetryOperationKeys.LOG_PLANT_MOOD
      );

      expect(moodUpdate).toBeUndefined();
    });
  });

  describe('logPlantMood', () => {
    it('should handle mood logging with retry', async () => {
      NetworkSimulator.setFailureRate(0.5);

      const operation = await queue.enqueue({
        id: 'log-mood',
        operationKey: RetryOperationKeys.LOG_PLANT_MOOD,
        operationData: JSON.stringify(['test-plant-id', 4, 'Feeling good!']),
        maxRetries: 2,
      });

      await waitForQueueEvent('success');
      expect(operation.attempt).toBeGreaterThan(0);
    });

    it('should validate mood values', async () => {
      const operation = await queue.enqueue({
        id: 'invalid-mood',
        operationKey: RetryOperationKeys.LOG_PLANT_MOOD,
        operationData: JSON.stringify(['test-plant-id', 10, 'Invalid mood']),
        maxRetries: 1,
      });

      await waitForQueueEvent('error');
      expect(operation.error.message).toContain('Invalid mood value');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle entry creation with images', async () => {
      const entryWithImages = {
        mood: 4,
        note: 'Entry with images',
        images: ['image1.jpg', 'image2.jpg'],
      };

      // Add entry operation
      const operation = await queue.enqueue({
        id: 'entry-with-images',
        operationKey: RetryOperationKeys.ADD_JOURNAL_ENTRY,
        operationData: JSON.stringify([entryWithImages]),
        maxRetries: 3,
      });

      await waitForQueueEvent('success');

      // Check that images were processed
      const events = QueueEventTracker.getEvents();
      const imageUploads = events.filter(e => e.type === 'image-upload');
      expect(imageUploads.length).toBe(2);
    });

    it('should handle batch mood updates', async () => {
      // Add multiple mood updates for same plant
      await Promise.all([
        queue.enqueue({
          id: 'mood-1',
          operationKey: RetryOperationKeys.LOG_PLANT_MOOD,
          operationData: JSON.stringify(['test-plant-id', 3, 'First mood']),
        }),
        queue.enqueue({
          id: 'mood-2',
          operationKey: RetryOperationKeys.LOG_PLANT_MOOD,
          operationData: JSON.stringify(['test-plant-id', 4, 'Second mood']),
        }),
        queue.enqueue({
          id: 'mood-3',
          operationKey: RetryOperationKeys.LOG_PLANT_MOOD,
          operationData: JSON.stringify(['test-plant-id', 5, 'Third mood']),
        }),
      ]);

      // Should batch updates
      const events = QueueEventTracker.getEvents();
      const moodUpdates = events.filter(
        e => e.type === 'enqueue' && e.data.operationKey === RetryOperationKeys.LOG_PLANT_MOOD
      );

      expect(moodUpdates.length).toBe(1);
    });

    it('should handle concurrent entry updates', async () => {
      const entryId = 'test-entry-id';

      // Try to update same entry multiple times
      await Promise.all([
        queue.enqueue({
          id: 'update-1',
          operationKey: RetryOperationKeys.UPDATE_JOURNAL_ENTRY,
          operationData: JSON.stringify([entryId, { note: 'Update 1' }]),
        }),
        queue.enqueue({
          id: 'update-2',
          operationKey: RetryOperationKeys.UPDATE_JOURNAL_ENTRY,
          operationData: JSON.stringify([entryId, { note: 'Update 2' }]),
        }),
      ]);

      // Should process updates sequentially
      const events = QueueEventTracker.getEvents();
      const updateEvents = events.filter(
        e => e.type === 'enqueue' && e.data.operationKey === RetryOperationKeys.UPDATE_JOURNAL_ENTRY
      );

      expect(updateEvents[0].data.dependencies).toBeUndefined();
      expect(updateEvents[1].data.dependencies).toContain(updateEvents[0].data.id);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from network partition', async () => {
      // Start with network failure
      NetworkSimulator.setFailureRate(1);

      const operation = await queue.enqueue({
        id: 'network-partition',
        operationKey: RetryOperationKeys.ADD_JOURNAL_ENTRY,
        operationData: JSON.stringify([
          {
            mood: 4,
            note: 'Test recovery',
          },
        ]),
        maxRetries: 3,
      });

      // Wait for first failure
      await waitForQueueEvent('retry');

      // Restore network
      NetworkSimulator.setFailureRate(0);

      // Should recover and complete
      await waitForQueueEvent('success');
      expect(operation.error).toBeNull();
    });

    it('should handle partial entry saves', async () => {
      // Simulate partial save (images failed but entry saved)
      const operation = await queue.enqueue({
        id: 'partial-save',
        operationKey: RetryOperationKeys.ADD_JOURNAL_ENTRY,
        operationData: JSON.stringify([
          {
            mood: 4,
            note: 'Test partial save',
            images: ['failed-image.jpg'],
          },
        ]),
      });

      // Entry should save but mark images as failed
      await waitForQueueEvent('success');
      expect(operation.result.images).toEqual([]);
      expect(operation.result.failedImages).toEqual(['failed-image.jpg']);
    });
  });
});

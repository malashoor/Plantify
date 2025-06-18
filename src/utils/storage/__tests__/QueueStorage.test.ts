import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueStorage, StoredRetryRequest } from '../QueueStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('QueueStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Operation Registry', () => {
    it('should register and retrieve operations', () => {
      const operation = jest.fn();
      QueueStorage.registerOperation('test-op', operation);

      const retrieved = QueueStorage.getOperation('test-op');
      expect(retrieved).toBe(operation);
    });

    it('should return undefined for unknown operations', () => {
      const operation = QueueStorage.getOperation('unknown-op');
      expect(operation).toBeUndefined();
    });
  });

  describe('Queue Persistence', () => {
    it('should save queue entries to AsyncStorage', async () => {
      const entries: StoredRetryRequest[] = [
        {
          id: 'test-1',
          priority: 'high',
          attempts: 0,
          lastAttempt: Date.now(),
          maxRetries: 3,
          operationKey: 'test-op',
          createdAt: Date.now(),
        },
      ];

      await QueueStorage.saveQueue(entries);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@greensai:retry_queue',
        JSON.stringify(entries)
      );
    });

    it('should load and filter expired entries', async () => {
      const now = Date.now();
      const oneDayAgo = now - 25 * 60 * 60 * 1000;

      const entries: StoredRetryRequest[] = [
        {
          id: 'valid',
          priority: 'high',
          attempts: 0,
          lastAttempt: now,
          maxRetries: 3,
          operationKey: 'test-op',
          createdAt: now,
        },
        {
          id: 'expired',
          priority: 'low',
          attempts: 0,
          lastAttempt: oneDayAgo,
          maxRetries: 3,
          operationKey: 'test-op',
          createdAt: oneDayAgo,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(entries));
      QueueStorage.registerOperation('test-op', jest.fn());

      const loaded = await QueueStorage.loadQueue();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('valid');
    });

    it('should filter out entries with unknown operations', async () => {
      const entries: StoredRetryRequest[] = [
        {
          id: 'valid',
          priority: 'high',
          attempts: 0,
          lastAttempt: Date.now(),
          maxRetries: 3,
          operationKey: 'known-op',
          createdAt: Date.now(),
        },
        {
          id: 'invalid',
          priority: 'high',
          attempts: 0,
          lastAttempt: Date.now(),
          maxRetries: 3,
          operationKey: 'unknown-op',
          createdAt: Date.now(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(entries));
      QueueStorage.registerOperation('known-op', jest.fn());

      const loaded = await QueueStorage.loadQueue();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('valid');
    });

    it('should handle empty storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const loaded = await QueueStorage.loadQueue();
      expect(loaded).toEqual([]);
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const loaded = await QueueStorage.loadQueue();
      expect(loaded).toEqual([]);
    });
  });

  describe('Entry Management', () => {
    it('should remove specific entries', async () => {
      const entries: StoredRetryRequest[] = [
        {
          id: 'keep',
          priority: 'high',
          attempts: 0,
          lastAttempt: Date.now(),
          maxRetries: 3,
          operationKey: 'test-op',
          createdAt: Date.now(),
        },
        {
          id: 'remove',
          priority: 'low',
          attempts: 0,
          lastAttempt: Date.now(),
          maxRetries: 3,
          operationKey: 'test-op',
          createdAt: Date.now(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(entries));

      await QueueStorage.removeEntries(['remove']);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@greensai:retry_queue',
        expect.stringContaining('keep')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@greensai:retry_queue',
        expect.not.stringContaining('remove')
      );
    });

    it('should update specific entries', async () => {
      const entries: StoredRetryRequest[] = [
        {
          id: 'test-1',
          priority: 'high',
          attempts: 0,
          lastAttempt: Date.now(),
          maxRetries: 3,
          operationKey: 'test-op',
          createdAt: Date.now(),
        },
      ];

      const update: StoredRetryRequest = {
        ...entries[0],
        attempts: 1,
        lastAttempt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(entries));

      await QueueStorage.updateEntries([update]);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@greensai:retry_queue',
        expect.stringContaining('"attempts":1')
      );
    });

    it('should clear all entries', async () => {
      await QueueStorage.clearQueue();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@greensai:retry_queue');
    });
  });
});

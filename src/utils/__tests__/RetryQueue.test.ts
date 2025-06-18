import { RetryQueue } from '../RetryQueue';
import { NetworkManager } from '../network';
import { QueueStorage } from '../storage/QueueStorage';

// Mock NetworkManager
jest.mock('../network', () => ({
  NetworkManager: {
    getInstance: jest.fn(() => ({
      isOnline: jest.fn(() => true)
    }))
  }
}));

// Mock QueueStorage
jest.mock('../storage/QueueStorage', () => ({
  QueueStorage: {
    loadQueue: jest.fn().mockResolvedValue([]),
    saveQueue: jest.fn(),
    removeEntries: jest.fn(),
    updateEntries: jest.fn(),
    registerOperation: jest.fn(),
    getOperation: jest.fn()
  }
}));

describe('RetryQueue', () => {
  let retryQueue: RetryQueue;
  let networkManager: jest.Mocked<NetworkManager>;

  beforeEach(() => {
    jest.useFakeTimers();
    // Reset the singleton instance
    (RetryQueue as any).instance = undefined;
    retryQueue = RetryQueue.getInstance();
    networkManager = NetworkManager.getInstance() as jest.Mocked<NetworkManager>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Enqueue Logic', () => {
    it('should add new tasks with correct priority', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const id = retryQueue.enqueue({
        id: 'test-1',
        operation,
        priority: 'high'
      });

      expect(id).toBe('test-1');
      expect(retryQueue.getStats().total).toBe(1);
      expect(retryQueue.getStats().byPriority.high).toBe(1);
    });

    it('should prevent duplicate operations', () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const id1 = retryQueue.enqueue({
        id: 'test-1',
        operation,
        priority: 'high'
      });

      const id2 = retryQueue.enqueue({
        id: 'test-2',
        operation,
        priority: 'medium'
      });

      expect(id1).toBe('test-1');
      expect(id2).toBe('test-1'); // Returns existing ID for duplicate operation
      expect(retryQueue.getStats().total).toBe(1);
    });

    it('should maintain priority order', async () => {
      const operations: string[] = [];
      const createOperation = (name: string) => () => {
        operations.push(name);
        return Promise.resolve();
      };

      retryQueue.enqueue({
        id: 'low',
        operation: createOperation('low'),
        priority: 'low'
      });

      retryQueue.enqueue({
        id: 'high',
        operation: createOperation('high'),
        priority: 'high'
      });

      retryQueue.enqueue({
        id: 'critical',
        operation: createOperation('critical'),
        priority: 'critical'
      });

      // Let queue process
      await jest.runAllTimersAsync();

      expect(operations).toEqual(['critical', 'high', 'low']);
    });
  });

  describe('Retry Execution', () => {
    it('should retry failed operations with exponential backoff', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const onRetry = jest.fn();
      const onSuccess = jest.fn();
      const onError = jest.fn();

      retryQueue.enqueue({
        id: 'test-retry',
        operation,
        maxRetries: 3,
        delay: 1000,
        onRetry,
        onSuccess,
        onError
      });

      // First attempt
      await jest.advanceTimersByTimeAsync(0);
      expect(operation).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1);

      // Second attempt (after 1000ms)
      await jest.advanceTimersByTimeAsync(1000);
      expect(operation).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(2);

      // Third attempt (after 2000ms)
      await jest.advanceTimersByTimeAsync(2000);
      expect(operation).toHaveBeenCalledTimes(3);
      expect(onSuccess).toHaveBeenCalledWith('success');
      expect(onError).not.toHaveBeenCalled();
    });

    it('should respect maxRetries limit', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('fail'));
      const onError = jest.fn();

      retryQueue.enqueue({
        id: 'test-max-retries',
        operation,
        maxRetries: 2,
        delay: 1000,
        onError
      });

      // Run through all retries
      await jest.runAllTimersAsync();

      expect(operation).toHaveBeenCalledTimes(2);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(retryQueue.getStats().total).toBe(0);
    });
  });

  describe('Dependency Resolution', () => {
    it('should wait for dependencies to complete', async () => {
      const operations: string[] = [];
      const dep1 = retryQueue.enqueue({
        id: 'dep-1',
        operation: () => {
          operations.push('dep-1');
          return Promise.resolve();
        },
        priority: 'high'
      });

      retryQueue.enqueue({
        id: 'dependent',
        operation: () => {
          operations.push('dependent');
          return Promise.resolve();
        },
        priority: 'critical',
        dependencies: [dep1]
      });

      await jest.runAllTimersAsync();
      expect(operations).toEqual(['dep-1', 'dependent']);
    });

    it('should not execute if dependency fails', async () => {
      const operations: string[] = [];
      const dep1 = retryQueue.enqueue({
        id: 'dep-1',
        operation: () => Promise.reject(new Error('fail')),
        maxRetries: 1
      });

      const dependent = retryQueue.enqueue({
        id: 'dependent',
        operation: () => {
          operations.push('dependent');
          return Promise.resolve();
        },
        dependencies: [dep1]
      });

      await jest.runAllTimersAsync();
      expect(operations).toEqual([]);
    });
  });

  describe('Network Awareness', () => {
    it('should pause retries when offline', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('fail'));
      networkManager.isOnline.mockReturnValue(false);

      retryQueue.enqueue({
        id: 'test-offline',
        operation,
        maxRetries: 3
      });

      await jest.advanceTimersByTimeAsync(5000);
      expect(operation).not.toHaveBeenCalled();

      // Come back online
      networkManager.isOnline.mockReturnValue(true);
      await jest.advanceTimersByTimeAsync(0);
      expect(operation).toHaveBeenCalled();
    });
  });

  describe('Queue Statistics', () => {
    it('should track queue statistics accurately', async () => {
      const successOp = jest.fn().mockResolvedValue('success');
      const failOp = jest.fn().mockRejectedValue(new Error('fail'));

      retryQueue.enqueue({
        id: 'success-1',
        operation: successOp,
        priority: 'high'
      });

      retryQueue.enqueue({
        id: 'fail-1',
        operation: failOp,
        priority: 'low',
        maxRetries: 1
      });

      const stats = retryQueue.getStats();
      expect(stats.total).toBe(2);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.low).toBe(1);

      await jest.runAllTimersAsync();

      const finalStats = retryQueue.getStats();
      expect(finalStats.total).toBe(0);
      expect(finalStats.processing).toBe(0);
    });

    it('should emit events correctly', () => {
      const onQueued = jest.fn();
      const onDequeued = jest.fn();
      const onRetry = jest.fn();

      const unsubscribeQueued = retryQueue.subscribe('queued', onQueued);
      const unsubscribeDequeued = retryQueue.subscribe('dequeued', onDequeued);
      const unsubscribeRetry = retryQueue.subscribe('retry', onRetry);

      const operation = jest.fn().mockResolvedValue('success');
      const id = retryQueue.enqueue({
        id: 'test-events',
        operation
      });

      expect(onQueued).toHaveBeenCalledWith(expect.objectContaining({
        id: 'test-events',
        queueSize: 1
      }));

      unsubscribeQueued();
      unsubscribeDequeued();
      unsubscribeRetry();
    });
  });

  describe('Persistence', () => {
    it('should restore persisted entries on initialization', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      const now = Date.now();

      (QueueStorage.loadQueue as jest.Mock).mockResolvedValueOnce([{
        id: 'persisted-1',
        priority: 'high',
        attempts: 1,
        lastAttempt: now,
        maxRetries: 3,
        operationKey: 'test-op',
        operationData: JSON.stringify(['arg1', 'arg2']),
        createdAt: now
      }]);

      (QueueStorage.getOperation as jest.Mock).mockReturnValue(mockOperation);

      // Reset singleton to trigger initialization
      (RetryQueue as any).instance = undefined;
      retryQueue = RetryQueue.getInstance();

      // Wait for initialization
      await jest.runAllTimersAsync();

      expect(retryQueue.getStats().total).toBe(1);
      expect(retryQueue.getStats().byPriority.high).toBe(1);
    });

    it('should persist non-volatile operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      retryQueue.registerOperation('test-op', operation);
      
      retryQueue.enqueue({
        id: 'test-1',
        operation,
        priority: 'high',
        operationKey: 'test-op',
        operationData: JSON.stringify(['arg1'])
      });

      expect(QueueStorage.saveQueue).toHaveBeenCalled();
    });

    it('should not persist volatile operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      retryQueue.enqueue({
        id: 'test-1',
        operation,
        priority: 'high',
        isVolatile: true
      });

      expect(QueueStorage.saveQueue).not.toHaveBeenCalled();
    });

    it('should update persistence on retry attempts', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      retryQueue.enqueue({
        id: 'test-1',
        operation,
        priority: 'high',
        operationKey: 'test-op',
        maxRetries: 2
      });

      await jest.runAllTimersAsync();

      expect(QueueStorage.updateEntries).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'test-1',
            attempts: 1
          })
        ])
      );
    });

    it('should remove entries from persistence when dequeued', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      retryQueue.enqueue({
        id: 'test-1',
        operation,
        priority: 'high',
        operationKey: 'test-op'
      });

      retryQueue.dequeue('test-1');

      expect(QueueStorage.removeEntries).toHaveBeenCalledWith(['test-1']);
    });

    it('should handle persistence errors gracefully', async () => {
      (QueueStorage.saveQueue as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const operation = jest.fn().mockResolvedValue('success');
      
      // Should not throw
      expect(() => retryQueue.enqueue({
        id: 'test-1',
        operation,
        priority: 'high',
        operationKey: 'test-op'
      })).not.toThrow();
    });

    it('should register and use persisted operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      retryQueue.registerOperation('test-op', operation);

      expect(QueueStorage.registerOperation).toHaveBeenCalledWith('test-op', operation);
    });

    it('should handle initialization failures gracefully', async () => {
      (QueueStorage.loadQueue as jest.Mock).mockRejectedValue(new Error('Load error'));

      // Reset singleton to trigger initialization
      (RetryQueue as any).instance = undefined;
      
      // Should not throw
      expect(() => RetryQueue.getInstance()).not.toThrow();
    });
  });
}); 
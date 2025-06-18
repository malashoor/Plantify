import { RetryQueue } from '../RetryQueue';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Network simulation utilities
 */
export class NetworkSimulator {
  private static failureCount = 0;
  private static failureRate = 0;

  static reset() {
    this.failureCount = 0;
    this.failureRate = 0;
  }

  static setFailureRate(rate: number) {
    this.failureRate = Math.max(0, Math.min(1, rate));
  }

  static async simulateRequest<T>(
    handler: () => Promise<T>,
    options: {
      failureMessage?: string;
      delay?: number;
    } = {}
  ): Promise<T> {
    const { failureMessage = 'Network Error', delay = 100 } = options;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate failure based on rate
    if (Math.random() < this.failureRate) {
      this.failureCount++;
      throw new Error(failureMessage);
    }

    return handler();
  }

  static getFailureCount() {
    return this.failureCount;
  }
}

/**
 * Storage simulation utilities
 */
export class StorageSimulator {
  static async clearStorage() {
    await AsyncStorage.clear();
  }

  static async getQueueState() {
    const data = await AsyncStorage.getItem('retry-queue');
    return data ? JSON.parse(data) : null;
  }

  static async simulateStorageFailure(shouldFail: boolean) {
    if (shouldFail) {
      AsyncStorage.setItem = jest.fn().mockRejectedValue(new Error('Storage Error'));
      AsyncStorage.getItem = jest.fn().mockRejectedValue(new Error('Storage Error'));
    } else {
      AsyncStorage.setItem = jest.fn().mockImplementation(() => Promise.resolve());
      AsyncStorage.getItem = jest.fn().mockImplementation(() => Promise.resolve(null));
    }
  }
}

/**
 * Queue event tracking utilities
 */
export class QueueEventTracker {
  private static events: Array<{
    type: 'enqueue' | 'dequeue' | 'retry' | 'success' | 'error';
    data: any;
    timestamp: number;
  }> = [];

  static reset() {
    this.events = [];
  }

  static trackEvent(type: 'enqueue' | 'dequeue' | 'retry' | 'success' | 'error', data: any) {
    this.events.push({
      type,
      data,
      timestamp: Date.now()
    });
  }

  static getEvents() {
    return [...this.events];
  }

  static getEventCount(type: 'enqueue' | 'dequeue' | 'retry' | 'success' | 'error') {
    return this.events.filter(e => e.type === type).length;
  }

  static getLastEvent(type?: 'enqueue' | 'dequeue' | 'retry' | 'success' | 'error') {
    if (type) {
      return this.events.filter(e => e.type === type).pop();
    }
    return this.events[this.events.length - 1];
  }
}

/**
 * Test wrapper for RetryQueue
 */
export class TestRetryQueue extends RetryQueue {
  constructor() {
    super();
    this.setupEventTracking();
  }

  private setupEventTracking() {
    this.subscribe((state) => {
      QueueEventTracker.trackEvent('enqueue', {
        size: state.queuedOperations.length,
        operations: state.queuedOperations
      });
    });
  }

  static override getInstance(): TestRetryQueue {
    if (!RetryQueue.instance) {
      RetryQueue.instance = new TestRetryQueue();
    }
    return RetryQueue.instance as TestRetryQueue;
  }

  override async enqueue(options: any) {
    QueueEventTracker.trackEvent('enqueue', options);
    return super.enqueue(options);
  }

  override async dequeue(id: string) {
    QueueEventTracker.trackEvent('dequeue', { id });
    return super.dequeue(id);
  }
}

/**
 * React Testing Library helpers
 */
export const renderWithQueue = (ui: React.ReactElement) => {
  // Reset all simulators before each render
  NetworkSimulator.reset();
  StorageSimulator.clearStorage();
  QueueEventTracker.reset();

  // Replace RetryQueue instance with test version
  const queue = TestRetryQueue.getInstance();

  return {
    queue,
    ...render(ui)
  };
};

/**
 * Wait for queue events
 */
export const waitForQueueEvent = (
  type: 'enqueue' | 'dequeue' | 'retry' | 'success' | 'error',
  timeout = 5000
) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkEvent = () => {
      const event = QueueEventTracker.getLastEvent(type);
      if (event) {
        resolve(event);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for queue event: ${type}`));
      } else {
        setTimeout(checkEvent, 100);
      }
    };
    checkEvent();
  });
}; 
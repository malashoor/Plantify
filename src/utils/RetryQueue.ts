import { NetworkManager } from './network';
import { EventEmitter } from 'events';
import { QueueStorage, StoredRetryRequest, OperationRegistry } from './storage/QueueStorage';

export type RetryPriority = 'critical' | 'high' | 'medium' | 'low';

export interface RetryRequest<T = any> {
  id: string;
  operation: () => Promise<T>;
  priority: RetryPriority;
  maxRetries?: number;
  delay?: number;
  dependencies?: string[];
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  onRetry?: (attempt: number) => void;
  isVolatile?: boolean;
  operationKey?: string;
  operationData?: string;
}

interface QueuedRetry<T> extends RetryRequest<T> {
  attempts: number;
  lastAttempt: number;
  isProcessing: boolean;
  createdAt: number;
}

export class RetryQueue {
  private static instance: RetryQueue;
  private queue: Map<string, QueuedRetry<any>> = new Map();
  private processing: boolean = false;
  private networkManager: NetworkManager;
  private events: EventEmitter = new EventEmitter();
  private initialized: boolean = false;

  private constructor() {
    this.networkManager = NetworkManager.getInstance();
    this.initialize();
  }

  static getInstance(): RetryQueue {
    if (!RetryQueue.instance) {
      RetryQueue.instance = new RetryQueue();
    }
    return RetryQueue.instance;
  }

  private get priorityOrder(): RetryPriority[] {
    return ['critical', 'high', 'medium', 'low'];
  }

  /**
   * Initialize the queue and restore persisted entries
   */
  private async initialize() {
    if (this.initialized) return;

    try {
      const entries = await QueueStorage.loadQueue();
      for (const entry of entries) {
        const operation = QueueStorage.getOperation(entry.operationKey);
        if (!operation) continue;

        const queuedRetry: QueuedRetry<any> = {
          ...entry,
          operation: () => {
            const args = entry.operationData ? JSON.parse(entry.operationData) : [];
            return operation(...args);
          },
          isProcessing: false,
        };

        this.queue.set(entry.id, queuedRetry);
      }

      this.initialized = true;
      this.startProcessing();
    } catch (error) {
      console.error('Failed to initialize retry queue:', error);
      this.initialized = true;
      this.startProcessing();
    }
  }

  /**
   * Add a request to the retry queue
   */
  enqueue<T>(request: RetryRequest<T>): string {
    const existingRequest = Array.from(this.queue.values()).find(
      r => r.operation.toString() === request.operation.toString()
    );

    if (existingRequest) {
      return existingRequest.id;
    }

    const queuedRetry: QueuedRetry<T> = {
      ...request,
      attempts: 0,
      lastAttempt: 0,
      isProcessing: false,
      createdAt: Date.now(),
    };

    this.queue.set(request.id, queuedRetry);
    this.events.emit('queued', {
      id: request.id,
      priority: request.priority,
      queueSize: this.queue.size,
    });

    // Persist if not volatile
    if (!request.isVolatile) {
      this.persistQueue();
    }

    return request.id;
  }

  /**
   * Remove a request from the queue
   */
  dequeue(id: string): boolean {
    const request = this.queue.get(id);
    const removed = this.queue.delete(id);

    if (removed) {
      this.events.emit('dequeued', { id, queueSize: this.queue.size });

      // Update persistence if not volatile
      if (request && !request.isVolatile) {
        QueueStorage.removeEntries([id]);
      }
    }

    return removed;
  }

  /**
   * Get the next request to process based on priority and dependencies
   */
  private getNextRequest(): QueuedRetry<any> | null {
    for (const priority of this.priorityOrder) {
      const requests = Array.from(this.queue.values()).filter(
        r => r.priority === priority && !r.isProcessing
      );

      for (const request of requests) {
        if (!request.dependencies?.length) {
          return request;
        }

        const dependenciesComplete = request.dependencies.every(
          depId => !this.queue.has(depId) || (this.queue.get(depId)?.attempts ?? 0) > 0
        );

        if (dependenciesComplete) {
          return request;
        }
      }
    }
    return null;
  }

  /**
   * Process the retry queue
   */
  private async startProcessing() {
    if (this.processing) return;
    this.processing = true;

    while (this.processing) {
      if (!this.networkManager.isOnline()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const request = this.getNextRequest();
      if (!request) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      try {
        request.isProcessing = true;
        request.attempts++;
        request.lastAttempt = Date.now();

        // Update persistence before attempt if not volatile
        if (!request.isVolatile) {
          await this.updatePersistedEntry(request);
        }

        request.onRetry?.(request.attempts);
        this.events.emit('retry', {
          id: request.id,
          attempt: request.attempts,
          queueSize: this.queue.size,
        });

        const result = await request.operation();
        request.onSuccess?.(result);
        this.dequeue(request.id);
      } catch (error) {
        const maxRetries = request.maxRetries ?? 3;

        if (request.attempts >= maxRetries) {
          request.onError?.(error as Error);
          this.dequeue(request.id);
        } else {
          request.isProcessing = false;
          const delay = request.delay ?? 1000 * Math.pow(2, request.attempts - 1);

          // Update persistence if not volatile
          if (!request.isVolatile) {
            await this.updatePersistedEntry(request);
          }

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }

  /**
   * Subscribe to retry queue events
   */
  subscribe(
    event: 'queued' | 'dequeued' | 'retry',
    callback: (data: {
      id: string;
      priority?: RetryPriority;
      attempt?: number;
      queueSize: number;
    }) => void
  ) {
    this.events.on(event, callback);
    return () => this.events.off(event, callback);
  }

  /**
   * Get current queue statistics
   */
  getStats() {
    const stats = {
      total: this.queue.size,
      byPriority: {} as Record<RetryPriority, number>,
      processing: Array.from(this.queue.values()).filter(r => r.isProcessing).length,
    };

    this.priorityOrder.forEach(priority => {
      stats.byPriority[priority] = Array.from(this.queue.values()).filter(
        r => r.priority === priority
      ).length;
    });

    return stats;
  }

  /**
   * Register a persistable operation
   */
  registerOperation(key: string, operation: (...args: any[]) => Promise<any>) {
    QueueStorage.registerOperation(key, operation);
  }

  /**
   * Persist the current queue state
   */
  private async persistQueue() {
    const entries: StoredRetryRequest[] = Array.from(this.queue.values())
      .filter(request => !request.isVolatile)
      .map(request => ({
        id: request.id,
        priority: request.priority,
        attempts: request.attempts,
        lastAttempt: request.lastAttempt,
        maxRetries: request.maxRetries ?? 3,
        delay: request.delay,
        dependencies: request.dependencies,
        operationKey: request.operationKey!,
        operationData: request.operationData,
        createdAt: request.createdAt,
      }));

    await QueueStorage.saveQueue(entries);
  }

  /**
   * Update a single persisted entry
   */
  private async updatePersistedEntry(request: QueuedRetry<any>) {
    if (!request.operationKey) return;

    const entry: StoredRetryRequest = {
      id: request.id,
      priority: request.priority,
      attempts: request.attempts,
      lastAttempt: request.lastAttempt,
      maxRetries: request.maxRetries ?? 3,
      delay: request.delay,
      dependencies: request.dependencies,
      operationKey: request.operationKey,
      operationData: request.operationData,
      createdAt: request.createdAt,
    };

    await QueueStorage.updateEntries([entry]);
  }
}

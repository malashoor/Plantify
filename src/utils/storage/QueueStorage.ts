import AsyncStorage from '@react-native-async-storage/async-storage';
import { RetryPriority } from '../RetryQueue';

const QUEUE_STORAGE_KEY = '@greensai:retry_queue';
const QUEUE_ENTRY_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface StoredRetryRequest {
  id: string;
  priority: RetryPriority;
  attempts: number;
  lastAttempt: number;
  maxRetries: number;
  delay?: number;
  dependencies?: string[];
  isVolatile?: boolean;
  operationKey: string;
  operationData?: string;
  createdAt: number;
}

export interface OperationRegistry {
  [key: string]: (...args: any[]) => Promise<any>;
}

export class QueueStorage {
  private static operations: OperationRegistry = {};

  /**
   * Register an operation that can be persisted and restored
   */
  static registerOperation(key: string, operation: (...args: any[]) => Promise<any>) {
    this.operations[key] = operation;
  }

  /**
   * Get a registered operation by key
   */
  static getOperation(key: string) {
    return this.operations[key];
  }

  /**
   * Save retry queue entries to storage
   */
  static async saveQueue(entries: StoredRetryRequest[]): Promise<void> {
    try {
      const serialized = JSON.stringify(entries);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save retry queue:', error);
    }
  }

  /**
   * Load retry queue entries from storage
   */
  static async loadQueue(): Promise<StoredRetryRequest[]> {
    try {
      const serialized = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (!serialized) return [];

      const entries: StoredRetryRequest[] = JSON.parse(serialized);
      const now = Date.now();

      // Filter out expired entries
      return entries.filter(entry => {
        const isExpired = now - entry.createdAt > QUEUE_ENTRY_TTL;
        const hasValidOperation = this.operations[entry.operationKey] != null;
        return !isExpired && hasValidOperation;
      });
    } catch (error) {
      console.error('Failed to load retry queue:', error);
      return [];
    }
  }

  /**
   * Clear all stored retry queue entries
   */
  static async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear retry queue:', error);
    }
  }

  /**
   * Remove specific entries from storage
   */
  static async removeEntries(ids: string[]): Promise<void> {
    try {
      const entries = await this.loadQueue();
      const filtered = entries.filter(entry => !ids.includes(entry.id));
      await this.saveQueue(filtered);
    } catch (error) {
      console.error('Failed to remove retry queue entries:', error);
    }
  }

  /**
   * Update specific entries in storage
   */
  static async updateEntries(updates: StoredRetryRequest[]): Promise<void> {
    try {
      const entries = await this.loadQueue();
      const updateMap = new Map(updates.map(u => [u.id, u]));

      const updated = entries.map(entry =>
        updateMap.has(entry.id) ? updateMap.get(entry.id)! : entry
      );

      await this.saveQueue(updated);
    } catch (error) {
      console.error('Failed to update retry queue entries:', error);
    }
  }
}

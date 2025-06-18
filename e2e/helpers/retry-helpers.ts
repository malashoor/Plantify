import { device, element, by, waitFor } from 'detox';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Network control helpers
 */
export const NetworkControl = {
  async goOffline() {
    await device.setStatusBar({
      networkConnection: 'none'
    });
    // Wait for offline state to be detected
    await waitFor(element(by.id('offline-indicator')))
      .toBeVisible()
      .withTimeout(2000);
  },

  async goOnline() {
    await device.setStatusBar({
      networkConnection: 'wifi'
    });
    // Wait for online state to be detected
    await waitFor(element(by.id('offline-indicator')))
      .not.toBeVisible()
      .withTimeout(2000);
  },

  async toggleNetworkRandomly(duration: number = 5000) {
    const interval = setInterval(async () => {
      if (Math.random() > 0.5) {
        await this.goOffline();
      } else {
        await this.goOnline();
      }
    }, 1000);

    await new Promise(resolve => setTimeout(resolve, duration));
    clearInterval(interval);
    await this.goOnline(); // Ensure we end in online state
  }
};

/**
 * Queue state inspection helpers
 */
export const QueueInspector = {
  async getQueueState() {
    const data = await AsyncStorage.getItem('retry-queue');
    return data ? JSON.parse(data) : null;
  },

  async waitForQueueSize(expectedSize: number, timeout: number = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const state = await this.getQueueState();
      if (state?.queuedOperations.length === expectedSize) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Queue size did not reach ${expectedSize} within ${timeout}ms`);
  },

  async waitForOperationSuccess(operationKey: string, timeout: number = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const state = await this.getQueueState();
      const operation = state?.queuedOperations.find(op => op.operationKey === operationKey);
      if (!operation) {
        return true; // Operation completed and removed from queue
      }
      if (operation.error) {
        throw new Error(`Operation failed: ${operation.error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Operation ${operationKey} did not complete within ${timeout}ms`);
  }
};

/**
 * UI interaction helpers
 */
export const RetryUI = {
  async waitForRetryStatus() {
    return await waitFor(element(by.id('retry-queue-status')))
      .toBeVisible()
      .withTimeout(2000);
  },

  async getQueuedOperationsCount() {
    const badge = await element(by.id('retry-queue-badge'));
    const text = await badge.getAttributes();
    return parseInt(text.text, 10);
  },

  async expandRetryDetails() {
    await element(by.id('retry-queue-status')).tap();
    await waitFor(element(by.id('retry-queue-details')))
      .toBeVisible()
      .withTimeout(1000);
  },

  async waitForOperationState(operationKey: string, state: 'queued' | 'processing' | 'completed') {
    const matcher = state === 'completed' 
      ? not.toBeVisible()
      : toHaveText(state);

    await waitFor(element(by.id(`operation-${operationKey}-status`)))
      [matcher]()
      .withTimeout(5000);
  }
};

/**
 * App state control helpers
 */
export const AppControl = {
  async restartApp() {
    await device.reloadReactNative();
    // Wait for app to be ready
    await waitFor(element(by.id('app-root')))
      .toBeVisible()
      .withTimeout(5000);
  },

  async clearAppData() {
    await AsyncStorage.clear();
    await device.clearKeychain();
  },

  async seedTestData() {
    // Add any test data seeding here
    await AsyncStorage.setItem('test-plants', JSON.stringify([
      { id: 'test-plant-1', name: 'Test Plant 1' },
      { id: 'test-plant-2', name: 'Test Plant 2' }
    ]));
  }
};

/**
 * Mock server control helpers
 */
export const MockServer = {
  async configureEndpoint(endpoint: string, options: {
    failureRate?: number;
    delay?: number;
    errorMessage?: string;
  }) {
    await device.executeScript(`
      window.mockServerConfig = {
        ...window.mockServerConfig,
        ${endpoint}: ${JSON.stringify(options)}
      }
    `, 'setting mock server config');
  },

  async resetMockServer() {
    await device.executeScript(`
      window.mockServerConfig = {}
    `, 'resetting mock server');
  }
}; 
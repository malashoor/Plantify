import AsyncStorage from '@react-native-async-storage/async-storage';


import { identifyPlant, type PlantIdentification } from '@/utils/ai';
import { getHydroponicData } from '@/utils/hydroponic';
import { getWeatherBasedRecommendations } from '@/utils/weather';
import { Platform } from 'react-native';

// Types for stress testing
interface StressTestResult {
  success: boolean;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  failedRequests: number;
  totalRequests: number;
}

interface PerformanceMetrics {
  responseTime: number[];
  memoryUsage: number[];
  errorCount: number;
  successCount: number;
}

// Configure test parameters
const TEST_CONFIG = {
  maxConcurrentRequests: 100,
  requestDelay: 100, // ms between requests
  testDuration: 60000, // 1 minute
  lowBandwidthThreshold: 500000, // 500 Kbps
  timeoutThreshold: 10000, // 10 seconds
};

// Stress testing class
export class AIStressTester {
  private static metrics: PerformanceMetrics = {
    responseTime: [],
    memoryUsage: [],
    errorCount: 0,
    successCount: 0,
  };

  // Run high-volume query test
  static async runHighVolumeTest(
    testImages: string[],
    concurrentRequests = TEST_CONFIG.maxConcurrentRequests,
  ): Promise<StressTestResult> {
    console.log('Starting high-volume test...');
    this.resetMetrics();

    const startTime = Date.now();
    const requests = [];

    // Create batch of concurrent requests
    for (let i = 0; i < concurrentRequests; i++) {
      const imageUrl = testImages[i % testImages.length];
      requests.push(this.measureRequest(() => identifyPlant(imageUrl)));
    }

    try {
      await Promise.all(requests);
    } catch (error) {
      console.error('High-volume test error:', error);
    }

    return this.calculateResults(startTime);
  }

  // Test low-bandwidth conditions
  static async testLowBandwidth(
    testImages: string[],
  ): Promise<StressTestResult> {
    console.log('Starting low-bandwidth test...');
    this.resetMetrics();

    const startTime = Date.now();
    const requests = [];

    // Simulate low bandwidth by adding delays
    for (const imageUrl of testImages) {
      requests.push(
        this.measureRequest(async () => {
          await this.simulateLowBandwidth();
          return identifyPlant(imageUrl);
        }),
      );
    }

    try {
      await Promise.all(requests);
    } catch (error) {
      console.error('Low-bandwidth test error:', error);
    }

    return this.calculateResults(startTime);
  }

  // Test multi-user interactions
  static async testMultiUserLoad(
    userCount: number,
    actionsPerUser: number,
  ): Promise<StressTestResult> {
    console.log('Starting multi-user test...');
    this.resetMetrics();

    const startTime = Date.now();
    const userSessions = [];

    // Simulate multiple users performing actions
    for (let i = 0; i < userCount; i++) {
      userSessions.push(this.simulateUserSession(actionsPerUser));
    }

    try {
      await Promise.all(userSessions);
    } catch (error) {
      console.error('Multi-user test error:', error);
    }

    return this.calculateResults(startTime);
  }

  // Helper methods
  private static async measureRequest<T>(
    request: () => Promise<T>,
  ): Promise<void> {
    const startTime = performance.now();

    try {
      await Promise.race([
        request(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout')),
            TEST_CONFIG.timeoutThreshold,
          ),
        ),
      ]);

      this.metrics.successCount++;
      this.metrics.responseTime.push(performance.now() - startTime);
    } catch (error) {
      this.metrics.errorCount++;
      console.error('Request failed:', error);
    }

    // Track memory usage
    if (Platform.OS === 'web') {
      const memory = (performance as any).memory;
      if (memory) {
        this.metrics.memoryUsage.push(memory.usedJSHeapSize);
      }
    }
  }

  private static async simulateLowBandwidth(): Promise<void> {
    const delay = Math.random() * 1000; // 0-1 second delay
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private static async simulateUserSession(
    actionsCount: number,
  ): Promise<void> {
    const actions = [
      () => identifyPlant('test-image-url'),
      () => getHydroponicData('test-system-id'),
      () => getWeatherBasedRecommendations('test-location'),
    ];

    for (let i = 0; i < actionsCount; i++) {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      await this.measureRequest(randomAction);
      await new Promise((resolve) =>
        setTimeout(resolve, TEST_CONFIG.requestDelay),
      );
    }
  }

  private static resetMetrics(): void {
    this.metrics = {
      responseTime: [],
      memoryUsage: [],
      errorCount: 0,
      successCount: 0,
    };
  }

  private static calculateResults(startTime: number): StressTestResult {
    const totalRequests = this.metrics.successCount + this.metrics.errorCount;
    const averageResponseTime =
      this.metrics.responseTime.length > 0
        ? this.metrics.responseTime.reduce((a, b) => a + b) /
          this.metrics.responseTime.length
        : 0;
    const averageMemoryUsage =
      this.metrics.memoryUsage.length > 0
        ? this.metrics.memoryUsage.reduce((a, b) => a + b) /
          this.metrics.memoryUsage.length
        : 0;

    return {
      success: this.metrics.errorCount === 0,
      averageResponseTime,
      errorRate: this.metrics.errorCount / totalRequests,
      memoryUsage: averageMemoryUsage,
      failedRequests: this.metrics.errorCount,
      totalRequests,
    };
  }
}

// Cache optimization for better performance
export class AICache {
  private static cache = new Map<
    string,
    {
      data: any;
      timestamp: number;
    }
  >();

  static async get(key: string): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) {
      // 5 minutes
      return cached.data;
    }
    return null;
  }

  static async set(key: string, data: any): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Persist to AsyncStorage for offline access
    try {
      await AsyncStorage.setItem(
        `ai_cache_${key}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  static async clear(): Promise<void> {
    this.cache.clear();

    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith('ai_cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Performance monitoring
export const monitorAIPerformance = async (
  operation: () => Promise<any>,
): Promise<{ duration: number; success: boolean }> => {
  const start = performance.now();
  try {
    await operation();
    return {
      duration: performance.now() - start,
      success: true,
    };
  } catch (error) {
    console.error('AI operation failed:', error);
    return {
      duration: performance.now() - start,
      success: false,
    };
  }
};

// Export test runner function
export const runAIStressTests = async (
  testImages: string[],
  userCount: number = 100,
  actionsPerUser: number = 10,
): Promise<void> => {
  console.log('Starting AI system stress tests...');

  // Run high-volume test
  const highVolumeResult = await AIStressTester.runHighVolumeTest(testImages);
  console.log('High-volume test results:', highVolumeResult);

  // Run low-bandwidth test
  const lowBandwidthResult = await AIStressTester.testLowBandwidth(testImages);
  console.log('Low-bandwidth test results:', lowBandwidthResult);

  // Run multi-user test
  const multiUserResult = await AIStressTester.testMultiUserLoad(
    userCount,
    actionsPerUser,
  );
  console.log('Multi-user test results:', multiUserResult);

  // Clear cache after tests
  await AICache.clear();
};

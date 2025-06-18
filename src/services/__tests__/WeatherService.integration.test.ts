import { WeatherService } from '../WeatherService';
import { RetryQueue } from '../../utils/RetryQueue';
import { RetryOperationKeys } from '../RetryOperations';
import {
  NetworkSimulator,
  StorageSimulator,
  QueueEventTracker,
  TestRetryQueue,
  waitForQueueEvent,
} from '../../utils/__tests__/testUtils';

describe('WeatherService Integration Tests', () => {
  let queue: TestRetryQueue;

  beforeEach(async () => {
    NetworkSimulator.reset();
    await StorageSimulator.clearStorage();
    QueueEventTracker.reset();
    queue = TestRetryQueue.getInstance();
  });

  describe('fetchForecast', () => {
    const testLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
    };

    it('should fetch forecast with retry support', async () => {
      // Set up network to fail once then succeed
      NetworkSimulator.setFailureRate(0.5);

      const operation = await queue.enqueue({
        id: 'fetch-forecast',
        operationKey: RetryOperationKeys.FETCH_FORECAST,
        operationData: JSON.stringify([testLocation.latitude, testLocation.longitude]),
        maxRetries: 3,
        priority: 'high',
      });

      // Wait for retry and eventual success
      await waitForQueueEvent('success');

      const events = QueueEventTracker.getEvents();
      expect(events.some(e => e.type === 'retry')).toBe(true);
      expect(operation.attempt).toBeGreaterThan(0);
    });

    it('should update cache after successful fetch', async () => {
      // Add fetch operation
      const fetchOp = await queue.enqueue({
        id: 'fetch-forecast',
        operationKey: RetryOperationKeys.FETCH_FORECAST,
        operationData: JSON.stringify([testLocation.latitude, testLocation.longitude]),
      });

      // Wait for fetch success
      await waitForQueueEvent('success');

      // Check that cache update was triggered
      const events = QueueEventTracker.getEvents();
      const cacheUpdate = events.find(
        e => e.type === 'enqueue' && e.data.operationKey === RetryOperationKeys.UPDATE_WEATHER_CACHE
      );

      expect(cacheUpdate).toBeTruthy();
      expect(cacheUpdate.data.isVolatile).toBe(true);
    });

    it('should handle location-based failures', async () => {
      // Invalid location coordinates
      const operation = await queue.enqueue({
        id: 'fetch-invalid-location',
        operationKey: RetryOperationKeys.FETCH_FORECAST,
        operationData: JSON.stringify([999, 999]),
        maxRetries: 2,
      });

      await waitForQueueEvent('error');
      expect(operation.error.message).toContain('Invalid location');
    });
  });

  describe('updateWeatherCache', () => {
    const testWeatherData = {
      temperature: 25,
      humidity: 65,
      conditions: 'Sunny',
      timestamp: Date.now(),
    };

    it('should handle volatile cache updates', async () => {
      const operation = await queue.enqueue({
        id: 'update-cache',
        operationKey: RetryOperationKeys.UPDATE_WEATHER_CACHE,
        operationData: JSON.stringify([testWeatherData]),
        isVolatile: true,
        priority: 'low',
      });

      await waitForQueueEvent('success');

      // Check that operation was marked volatile
      const state = await StorageSimulator.getQueueState();
      expect(state.volatileOperations).toContainEqual(
        expect.objectContaining({
          id: operation.id,
        })
      );
    });

    it('should handle cache invalidation', async () => {
      // Add stale data
      const staleData = {
        ...testWeatherData,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours old
      };

      await queue.enqueue({
        id: 'update-stale-cache',
        operationKey: RetryOperationKeys.UPDATE_WEATHER_CACHE,
        operationData: JSON.stringify([staleData]),
      });

      // Should trigger a new fetch due to stale data
      const events = QueueEventTracker.getEvents();
      const newFetch = events.find(
        e => e.type === 'enqueue' && e.data.operationKey === RetryOperationKeys.FETCH_FORECAST
      );

      expect(newFetch).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle API rate limits', async () => {
      // Simulate rate limit error
      NetworkSimulator.setFailureRate(1);
      const operation = await queue.enqueue({
        id: 'rate-limited-fetch',
        operationKey: RetryOperationKeys.FETCH_FORECAST,
        operationData: JSON.stringify([37.7749, -122.4194]),
        maxRetries: 3,
      });

      await waitForQueueEvent('error');
      expect(operation.error.message).toContain('Rate limit exceeded');
      expect(operation.attempt).toBe(3);
    });

    it('should handle partial cache updates', async () => {
      const partialData = {
        temperature: 25,
        // Missing other required fields
      };

      const operation = await queue.enqueue({
        id: 'partial-cache-update',
        operationKey: RetryOperationKeys.UPDATE_WEATHER_CACHE,
        operationData: JSON.stringify([partialData]),
        maxRetries: 1,
      });

      await waitForQueueEvent('error');
      expect(operation.error.message).toContain('Invalid weather data');
    });

    it('should handle concurrent fetch requests', async () => {
      // Try to fetch for same location multiple times
      const location = [37.7749, -122.4194];

      await Promise.all([
        queue.enqueue({
          id: 'fetch-1',
          operationKey: RetryOperationKeys.FETCH_FORECAST,
          operationData: JSON.stringify(location),
        }),
        queue.enqueue({
          id: 'fetch-2',
          operationKey: RetryOperationKeys.FETCH_FORECAST,
          operationData: JSON.stringify(location),
        }),
      ]);

      // Should deduplicate requests
      const events = QueueEventTracker.getEvents();
      const fetchEvents = events.filter(
        e => e.type === 'enqueue' && e.data.operationKey === RetryOperationKeys.FETCH_FORECAST
      );

      expect(fetchEvents.length).toBe(1);
    });
  });

  describe('Network Conditions', () => {
    it('should handle slow network connections', async () => {
      const operation = await queue.enqueue({
        id: 'slow-fetch',
        operationKey: RetryOperationKeys.FETCH_FORECAST,
        operationData: JSON.stringify([37.7749, -122.4194]),
      });

      // Simulate slow network
      await NetworkSimulator.simulateRequest(() => Promise.resolve(), { delay: 5000 });

      expect(operation.isProcessing).toBe(true);
      await waitForQueueEvent('success');
    });

    it('should handle offline mode', async () => {
      // Force offline mode
      NetworkSimulator.setFailureRate(1);

      const operation = await queue.enqueue({
        id: 'offline-fetch',
        operationKey: RetryOperationKeys.FETCH_FORECAST,
        operationData: JSON.stringify([37.7749, -122.4194]),
        maxRetries: 2,
      });

      await waitForQueueEvent('error');
      expect(operation.error.message).toContain('Network Error');

      // Should fall back to cache
      const events = QueueEventTracker.getEvents();
      const cacheRead = events.find(e => e.type === 'cache-read');
      expect(cacheRead).toBeTruthy();
    });
  });
});

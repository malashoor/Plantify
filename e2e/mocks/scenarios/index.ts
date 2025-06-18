import { mockServerState } from '../state';
import { plantScenarios } from './plantScenarios';
import { weatherScenarios } from './weatherScenarios';
import { journalScenarios } from './journalScenarios';

export { plantScenarios, weatherScenarios, journalScenarios };

/**
 * Helper class to manage test scenarios
 */
export class ScenarioManager {
  private static instance: ScenarioManager;

  private constructor() {
    // Reset all scenarios when mock server state is reset
    mockServerState.events.on('reset', () => {
      this.resetAll();
    });
  }

  static getInstance(): ScenarioManager {
    if (!ScenarioManager.instance) {
      ScenarioManager.instance = new ScenarioManager();
    }
    return ScenarioManager.instance;
  }

  /**
   * Reset all scenarios to their default state
   */
  resetAll() {
    plantScenarios.reset();
    weatherScenarios.reset();
    journalScenarios.reset();
  }

  /**
   * Configure a complex retry scenario with multiple services
   */
  setupRetryScenario() {
    // Configure plant service to fail after 2 saves
    plantScenarios.failAfterMultipleSaves(2);

    // Configure weather service with quota limit
    weatherScenarios.simulateQuotaExceeded();

    // Configure journal with dependency on plant
    journalScenarios.simulatePlantDependency('test-plant-1');
  }

  /**
   * Configure a scenario with network instability
   */
  setupNetworkInstability() {
    // Configure weather updates to be flaky
    weatherScenarios.simulateFlakyUpdates(0.3, 5000);

    // Configure plant service with eventual success
    plantScenarios.eventualUpdateSuccess(3, 'test-plant-1');

    // Configure journal with save delay
    journalScenarios.simulateSaveDelay(2000);
  }

  /**
   * Configure a scenario with mixed success/failure
   */
  setupMixedSuccessScenario() {
    // Configure plant photo upload to fail
    plantScenarios.partialPhotoUploadFailure();

    // Configure weather with gradual changes
    weatherScenarios.simulateGradualChange(10000, 1000);

    // Configure journal batch operations
    journalScenarios.simulateBatchPartialSuccess([
      { note: 'Test 1', mood: 'happy' },
      { note: 'Test 2', mood: 'sad' },
      { note: 'Test 3', mood: 'neutral' }
    ], 0.3);
  }

  /**
   * Configure a scenario with permanent failures
   */
  setupPermanentFailureScenario() {
    // Configure plant service to fail permanently after max retries
    plantScenarios.permanentFailure(3);

    // Configure weather with timeout
    weatherScenarios.simulateTimeoutThenRecover(30000);

    // Configure journal to fail on sad mood
    journalScenarios.simulateFailOnSadMood();
  }

  /**
   * Configure a scenario with large data handling
   */
  setupLargeDataScenario() {
    // Configure journal with large payload
    journalScenarios.simulateLargePayload(100);

    // Configure weather with multiple condition changes
    weatherScenarios.setWeatherCondition('hot');
    setTimeout(() => weatherScenarios.setWeatherCondition('rainy'), 5000);
    setTimeout(() => weatherScenarios.setWeatherCondition('normal'), 10000);
  }
}

export const scenarioManager = ScenarioManager.getInstance(); 
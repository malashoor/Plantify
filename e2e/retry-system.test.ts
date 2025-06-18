import { device, element, by, waitFor } from 'detox';
import { 
  NetworkControl,
  QueueInspector,
  RetryUI,
  AppControl,
  MockServer
} from './helpers/retry-helpers';
import { RetryOperationKeys } from '../src/services/RetryOperations';

describe('Retry System E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { location: 'always' }
    });
  });

  beforeEach(async () => {
    await AppControl.clearAppData();
    await AppControl.seedTestData();
    await MockServer.resetMockServer();
    await NetworkControl.goOnline();
  });

  describe('Retry Persistence', () => {
    it('should persist and resume failed operations after app restart', async () => {
      // Configure endpoint to fail
      await MockServer.configureEndpoint('/api/plants', {
        failureRate: 1,
        errorMessage: 'Network Error'
      });

      // Navigate to add plant screen
      await element(by.id('add-plant-button')).tap();

      // Fill plant details
      await element(by.id('plant-name-input')).typeText('Persistent Plant');
      await element(by.id('plant-species-input')).typeText('Test Species');
      await element(by.id('save-plant-button')).tap();

      // Wait for operation to be queued
      await RetryUI.waitForRetryStatus();
      await RetryUI.waitForOperationState(RetryOperationKeys.SAVE_PLANT, 'queued');

      // Restart app
      await AppControl.restartApp();

      // Configure endpoint to succeed
      await MockServer.configureEndpoint('/api/plants', {
        failureRate: 0
      });

      // Operation should resume and complete
      await RetryUI.waitForOperationState(RetryOperationKeys.SAVE_PLANT, 'completed');

      // Verify plant was saved
      await element(by.text('Persistent Plant')).tap();
      await expect(element(by.text('Test Species'))).toBeVisible();
    });
  });

  describe('Offline Recovery', () => {
    it('should queue operations when offline and retry when online', async () => {
      // Go offline
      await NetworkControl.goOffline();

      // Try to update plant
      await element(by.id('test-plant-1')).tap();
      await element(by.id('edit-plant-button')).tap();
      await element(by.id('plant-name-input')).clearText();
      await element(by.id('plant-name-input')).typeText('Updated Plant');
      await element(by.id('save-plant-button')).tap();

      // Verify operation is queued
      await RetryUI.waitForRetryStatus();
      await RetryUI.waitForOperationState(RetryOperationKeys.UPDATE_PLANT, 'queued');

      // Go online
      await NetworkControl.goOnline();

      // Operation should complete
      await RetryUI.waitForOperationState(RetryOperationKeys.UPDATE_PLANT, 'completed');

      // Verify update was applied
      await expect(element(by.text('Updated Plant'))).toBeVisible();
    });

    it('should handle intermittent connectivity', async () => {
      // Start updating plant
      await element(by.id('test-plant-1')).tap();
      await element(by.id('edit-plant-button')).tap();
      await element(by.id('plant-name-input')).clearText();
      await element(by.id('plant-name-input')).typeText('Flaky Connection Plant');
      await element(by.id('save-plant-button')).tap();

      // Toggle network randomly
      await NetworkControl.toggleNetworkRandomly(5000);

      // Operation should eventually complete
      await RetryUI.waitForOperationState(RetryOperationKeys.UPDATE_PLANT, 'completed');
    });
  });

  describe('Dependency Flow', () => {
    it('should handle dependent operations in order', async () => {
      // Configure endpoints
      await MockServer.configureEndpoint('/api/plants', {
        failureRate: 0.5,
        delay: 1000
      });
      await MockServer.configureEndpoint('/api/journal', {
        failureRate: 0.5,
        delay: 500
      });

      // Add new plant and immediately add journal entry
      await element(by.id('add-plant-button')).tap();
      await element(by.id('plant-name-input')).typeText('Dependent Plant');
      await element(by.id('save-plant-button')).tap();

      await element(by.id('add-journal-button')).tap();
      await element(by.id('journal-note-input')).typeText('Test note');
      await element(by.id('save-journal-button')).tap();

      // Verify operations are queued
      await RetryUI.waitForRetryStatus();
      await RetryUI.expandRetryDetails();

      // Journal operation should wait for plant save
      const queueState = await QueueInspector.getQueueState();
      const journalOp = queueState.queuedOperations.find(
        op => op.operationKey === RetryOperationKeys.ADD_JOURNAL_ENTRY
      );
      expect(journalOp.dependencies).toContain('save-plant');

      // Wait for all operations to complete
      await RetryUI.waitForOperationState(RetryOperationKeys.SAVE_PLANT, 'completed');
      await RetryUI.waitForOperationState(RetryOperationKeys.ADD_JOURNAL_ENTRY, 'completed');
    });
  });

  describe('Priority Handling', () => {
    it('should process operations in priority order', async () => {
      // Configure slow responses
      await MockServer.configureEndpoint('/api/plants', {
        delay: 1000
      });
      await MockServer.configureEndpoint('/api/weather', {
        delay: 1000
      });

      // Queue low priority weather update
      await element(by.id('refresh-weather-button')).tap();

      // Queue high priority plant save
      await element(by.id('add-plant-button')).tap();
      await element(by.id('plant-name-input')).typeText('Priority Plant');
      await element(by.id('save-plant-button')).tap();

      // Expand retry details
      await RetryUI.waitForRetryStatus();
      await RetryUI.expandRetryDetails();

      // Plant save should process first
      await waitFor(element(by.id(`operation-${RetryOperationKeys.SAVE_PLANT}-status`)))
        .toHaveText('processing')
        .withTimeout(2000);

      await waitFor(element(by.id(`operation-${RetryOperationKeys.UPDATE_WEATHER_CACHE}-status`)))
        .toHaveText('queued')
        .withTimeout(2000);
    });
  });

  describe('Cancel and Retry', () => {
    it('should handle manual retry after cancellation', async () => {
      // Configure endpoint to fail
      await MockServer.configureEndpoint('/api/plants', {
        failureRate: 1
      });

      // Start plant save
      await element(by.id('add-plant-button')).tap();
      await element(by.id('plant-name-input')).typeText('Cancelled Plant');
      await element(by.id('save-plant-button')).tap();

      // Wait for retry UI and cancel
      await RetryUI.waitForRetryStatus();
      await RetryUI.expandRetryDetails();
      await element(by.id('cancel-retry-button')).tap();

      // Configure endpoint to succeed
      await MockServer.configureEndpoint('/api/plants', {
        failureRate: 0
      });

      // Retry manually
      await element(by.id('retry-operation-button')).tap();

      // Operation should complete
      await RetryUI.waitForOperationState(RetryOperationKeys.SAVE_PLANT, 'completed');
    });
  });

  describe('UI Feedback', () => {
    it('should show correct visual feedback and be accessible', async () => {
      // Configure endpoint to fail multiple times
      await MockServer.configureEndpoint('/api/plants', {
        failureRate: 0.8,
        delay: 500
      });

      // Start operation
      await element(by.id('add-plant-button')).tap();
      await element(by.id('plant-name-input')).typeText('UI Test Plant');
      await element(by.id('save-plant-button')).tap();

      // Verify retry UI appears
      await RetryUI.waitForRetryStatus();
      
      // Check accessibility
      await expect(element(by.id('retry-queue-status'))).toHaveLabel();
      await expect(element(by.id('retry-queue-badge'))).toHaveLabel();

      // Expand details
      await RetryUI.expandRetryDetails();

      // Verify attempt counter updates
      await waitFor(element(by.id('retry-attempt-counter')))
        .toHaveText('Attempt 1 of 3')
        .withTimeout(5000);

      // Wait for completion
      await RetryUI.waitForOperationState(RetryOperationKeys.SAVE_PLANT, 'completed');
    });
  });

  describe('Data Accuracy', () => {
    it('should reflect completed operations accurately in UI', async () => {
      // Add plant with specific details
      await element(by.id('add-plant-button')).tap();
      await element(by.id('plant-name-input')).typeText('Accuracy Test Plant');
      await element(by.id('plant-species-input')).typeText('Test Species');
      await element(by.id('plant-location-input')).typeText('Test Location');
      await element(by.id('save-plant-button')).tap();

      // Force some retries
      await MockServer.configureEndpoint('/api/plants', {
        failureRate: 0.5,
        delay: 500
      });

      // Wait for operation to complete
      await RetryUI.waitForOperationState(RetryOperationKeys.SAVE_PLANT, 'completed');

      // Verify all details are correct
      await element(by.text('Accuracy Test Plant')).tap();
      await expect(element(by.text('Test Species'))).toBeVisible();
      await expect(element(by.text('Test Location'))).toBeVisible();

      // Check journal entry was created
      await element(by.id('view-journal-button')).tap();
      await expect(element(by.text('Plant added'))).toBeVisible();
    });
  });
}); 
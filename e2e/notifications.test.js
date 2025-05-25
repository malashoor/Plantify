describe('Notifications', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should request notification permissions', async () => {
    // Navigate to settings
    await element(by.id('settings-tab')).tap();
    await element(by.id('notifications-settings')).tap();

    // Check initial state
    await expect(element(by.id('notification-status'))).toBeVisible();
    
    // Request permissions
    await element(by.id('request-permissions')).tap();
    
    // Verify permission granted
    await expect(element(by.id('permission-granted'))).toBeVisible();
  });

  it('should schedule and receive a notification', async () => {
    // Navigate to reminders
    await element(by.id('reminders-tab')).tap();
    
    // Create new reminder
    await element(by.id('add-reminder')).tap();
    
    // Fill reminder details
    await element(by.id('reminder-title')).typeText('Test Reminder');
    await element(by.id('reminder-time')).tap();
    await element(by.id('time-picker')).setDatePickerDate('2024-03-20', '10:00', 'AM');
    
    // Save reminder
    await element(by.id('save-reminder')).tap();
    
    // Verify reminder created
    await expect(element(by.text('Test Reminder'))).toBeVisible();
  });

  it('should handle notification actions', async () => {
    // Schedule a notification
    await element(by.id('reminders-tab')).tap();
    await element(by.id('add-reminder')).tap();
    await element(by.id('reminder-title')).typeText('Action Test');
    await element(by.id('reminder-time')).tap();
    await element(by.id('time-picker')).setDatePickerDate('2024-03-20', '10:00', 'AM');
    await element(by.id('save-reminder')).tap();

    // Simulate notification tap
    await device.sendToHome();
    await device.launchApp({ newInstance: false });

    // Verify deep linking
    await expect(element(by.id('reminder-details'))).toBeVisible();
    await expect(element(by.text('Action Test'))).toBeVisible();
  });

  it('should handle background notifications', async () => {
    // Schedule a notification
    await element(by.id('reminders-tab')).tap();
    await element(by.id('add-reminder')).tap();
    await element(by.id('reminder-title')).typeText('Background Test');
    await element(by.id('reminder-time')).tap();
    await element(by.id('time-picker')).setDatePickerDate('2024-03-20', '10:00', 'AM');
    await element(by.id('save-reminder')).tap();

    // Send app to background
    await device.sendToHome();

    // Simulate background notification
    await device.launchApp({ newInstance: false });

    // Verify notification received
    await expect(element(by.id('notification-received'))).toBeVisible();
  });

  it('should handle notification persistence', async () => {
    // Create a reminder
    await element(by.id('reminders-tab')).tap();
    await element(by.id('add-reminder')).tap();
    await element(by.id('reminder-title')).typeText('Persistence Test');
    await element(by.id('reminder-time')).tap();
    await element(by.id('time-picker')).setDatePickerDate('2024-03-20', '10:00', 'AM');
    await element(by.id('save-reminder')).tap();

    // Force close app
    await device.terminateApp();
    await device.launchApp();

    // Verify reminder persists
    await element(by.id('reminders-tab')).tap();
    await expect(element(by.text('Persistence Test'))).toBeVisible();
  });
}); 
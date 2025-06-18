import { by, device, element, expect } from 'detox';

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { location: 'never' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete the onboarding flow successfully', async () => {
    // Welcome screen
    await expect(element(by.text('onboarding.welcome.title'))).toBeVisible();
    await element(by.text('common.next')).tap();

    // Role selection
    await expect(element(by.text('onboarding.roles.title'))).toBeVisible();
    await element(by.text('onboarding.roles.grower.label')).tap();
    await element(by.text('common.next')).tap();

    // Environment selection
    await expect(element(by.text('onboarding.environment.title'))).toBeVisible();
    await element(by.text('onboarding.environment.indoor.label')).tap();
    await element(by.text('common.next')).tap();

    // Plant interests
    await expect(element(by.text('onboarding.interests.title'))).toBeVisible();
    await element(by.text('onboarding.interests.vegetables')).tap();
    await element(by.text('onboarding.interests.herbs')).tap();
    await element(by.text('common.next')).tap();

    // Location permission
    await expect(element(by.text('onboarding.location.title'))).toBeVisible();
    await element(by.text('onboarding.location.allow')).tap();
    await element(by.text('common.next')).tap();

    // Summary screen
    await expect(element(by.text('onboarding.summary.title'))).toBeVisible();
    await expect(element(by.text('onboarding.roles.grower.label'))).toBeVisible();
    await expect(element(by.text('onboarding.environment.indoor.label'))).toBeVisible();
    await element(by.text('common.getStarted')).tap();

    // Should navigate to main app
    await expect(element(by.id('MainTabNavigator'))).toBeVisible();
  });

  it('should handle validation errors', async () => {
    // Try to proceed without selecting role
    await expect(element(by.text('onboarding.roles.title'))).toBeVisible();
    await element(by.text('common.next')).tap();
    await expect(element(by.text('onboarding.errors.roleRequired'))).toBeVisible();

    // Try to proceed without selecting environment
    await element(by.text('onboarding.roles.grower.label')).tap();
    await element(by.text('common.next')).tap();
    await expect(element(by.text('onboarding.environment.title'))).toBeVisible();
    await element(by.text('common.next')).tap();
    await expect(element(by.text('onboarding.errors.environmentRequired'))).toBeVisible();
  });

  it('should persist onboarding state', async () => {
    // Complete onboarding
    await element(by.text('onboarding.roles.grower.label')).tap();
    await element(by.text('common.next')).tap();
    await element(by.text('onboarding.environment.indoor.label')).tap();
    await element(by.text('common.next')).tap();
    await element(by.text('onboarding.interests.vegetables')).tap();
    await element(by.text('common.next')).tap();
    await element(by.text('onboarding.location.allow')).tap();
    await element(by.text('common.next')).tap();
    await element(by.text('common.getStarted')).tap();

    // Restart app
    await device.reloadReactNative();

    // Should go directly to main app
    await expect(element(by.id('MainTabNavigator'))).toBeVisible();
  });

  it('should support RTL layout', async () => {
    // Switch to Arabic
    await element(by.id('languageSelector')).tap();
    await element(by.text('العربية')).tap();

    // Verify Arabic text is displayed
    await expect(element(by.text('مرحباً بك'))).toBeVisible();
    await expect(element(by.text('اختر دورك'))).toBeVisible();
  });
});

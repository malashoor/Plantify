const { device, element, by, waitFor } = require('detox');

// Test users with different roles
const adminUser = {
  email: 'admin@plantai.com',
  password: 'adminPassword123', 
};

const growerUser = {
  email: 'grower@plantai.com',
  password: 'growerPassword123',
};

const childUser = {
  email: 'child@plantai.com',
  password: 'childPassword123',
};

// Helper to login with a specific user
async function loginWithUser(user) {
  await element(by.id('email-input')).typeText(user.email);
  await element(by.id('password-input')).typeText(user.password);
  await element(by.id('login-button')).tap();
  
  // Wait for home screen to appear
  await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(2000);
}

// Helper to navigate to a specific tab
async function navigateToTab(tabName) {
  await element(by.text(tabName)).tap();
}

describe('Role-based access control', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Admin user', () => {
    beforeEach(async () => {
      await loginWithUser(adminUser);
    });

    it('should have access to all tabs', async () => {
      // Check all tabs are visible
      await expect(element(by.text('Home'))).toBeVisible();
      await expect(element(by.text('Plants'))).toBeVisible();
      await expect(element(by.text('Tasks'))).toBeVisible();
      await expect(element(by.text('Insights'))).toBeVisible();
      await expect(element(by.text('Settings'))).toBeVisible();
      await expect(element(by.text('Sensor Rules'))).toBeVisible();
    });

    it('can create a sensor rule', async () => {
      await navigateToTab('Sensor Rules');
      
      // Tap the add button
      await element(by.id('add-sensor-rule-button')).tap();
      
      // Verify the modal appears
      await expect(element(by.id('new-sensor-rule-modal'))).toBeVisible();
      
      // Verify the create button is enabled
      await expect(element(by.id('save-rule-button'))).toBeEnabled();
      
      // Close the modal
      await element(by.text('Cancel')).tap();
    });
  });

  describe('Grower user', () => {
    beforeEach(async () => {
      await loginWithUser(growerUser);
    });

    it('should have access to all tabs except admin-only ones', async () => {
      // Check accessible tabs are visible
      await expect(element(by.text('Home'))).toBeVisible();
      await expect(element(by.text('Plants'))).toBeVisible();
      await expect(element(by.text('Tasks'))).toBeVisible();
      await expect(element(by.text('Insights'))).toBeVisible();
      await expect(element(by.text('Settings'))).toBeVisible();
      await expect(element(by.text('Sensor Rules'))).toBeVisible();
    });

    it('can create and edit plants', async () => {
      await navigateToTab('Plants');
      
      // Verify add plant button is visible
      await expect(element(by.id('add-plant-button'))).toBeVisible();
    });
  });

  describe('Child user', () => {
    beforeEach(async () => {
      await loginWithUser(childUser);
    });

    it('should only have access to limited tabs', async () => {
      // Check accessible tabs are visible
      await expect(element(by.text('Home'))).toBeVisible();
      await expect(element(by.text('Plants'))).toBeVisible();
      await expect(element(by.text('Insights'))).toBeVisible();
      
      // Check restricted tabs are not visible
      await expect(element(by.text('Tasks'))).not.toBeVisible();
      await expect(element(by.text('Settings'))).not.toBeVisible();
      await expect(element(by.text('Sensor Rules'))).not.toBeVisible();
    });

    it('should see view-only banner on Plants screen', async () => {
      await navigateToTab('Plants');
      
      // Verify the view-only banner is visible
      await expect(element(by.text('View only mode - You can view but not modify content'))).toBeVisible();
      
      // Verify add plant button is not visible
      await expect(element(by.id('add-plant-button'))).not.toBeVisible();
    });

    it('should be able to view plant details but not edit', async () => {
      await navigateToTab('Plants');
      
      // Tap on the first plant (if any)
      await element(by.id('plant-item-0')).atIndex(0).tap();
      
      // Verify plant details screen is visible
      await expect(element(by.id('plant-details-screen'))).toBeVisible();
      
      // Verify edit button is not visible
      await expect(element(by.id('edit-plant-button'))).not.toBeVisible();
      
      // Verify delete button is not visible
      await expect(element(by.id('delete-plant-button'))).not.toBeVisible();
    });

    it('should be able to view insights without creating/editing', async () => {
      await navigateToTab('Insights');
      
      // Verify insights screen is visible
      await expect(element(by.id('insights-screen'))).toBeVisible();
      
      // Verify view-only banner is visible
      await expect(element(by.text('View only mode - You can view but not modify content'))).toBeVisible();
    });
  });
}); 
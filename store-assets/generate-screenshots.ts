import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import { AppRegistry } from 'react-native';
import { renderToString } from 'react-native-web';

import MockupGenerator from './mockup-generator';

// Screen configurations
const screens = [
  { name: 'home', title: 'Welcome to Plantify' },
  { name: 'growth', title: 'Growth Timeline' },
  { name: 'health', title: 'Health Analysis' },
  { name: 'journal', title: 'New Journal Entry' },
  { name: 'reminders', title: 'Care Reminders' },
  { name: 'analytics', title: 'Analytics Dashboard' },
];

// Device configurations
const devices = [
  {
    name: 'ios',
    width: 1242,
    height: 2688,
    deviceFrame: 'iphone-x',
  },
  {
    name: 'android',
    width: 1080,
    height: 1920,
    deviceFrame: 'pixel-6',
  },
];

// Register the app
AppRegistry.registerComponent('PlantifyMockup', () => MockupGenerator);

// Generate screenshots
async function generateScreenshots() {
  // Create directories if they don't exist
  devices.forEach(device => {
    mkdirSync(join(__dirname, 'screenshots', device.name), { recursive: true });
  });

  // Generate screenshots for each screen and device
  for (const screen of screens) {
    for (const device of devices) {
      const outputPath = join(__dirname, 'screenshots', device.name, `${screen.name}.png`);
      
      // Render the mockup
      const { element, getStyleElement } = AppRegistry.getApplication('PlantifyMockup', {
        initialProps: {
          screen: screen.name,
          device: device.name,
          width: device.width,
          height: device.height,
        },
      });

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${getStyleElement()}
          </head>
          <body>
            <div id="root">${renderToString(element)}</div>
          </body>
        </html>
      `;

      // Save the screenshot
      writeFileSync(outputPath, html);
      console.log(`Generated ${outputPath}`);
    }
  }
}

// Run the generator
generateScreenshots().catch(console.error); 
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to clear
const paths = ['.expo', 'node_modules/.cache', 'ios/build', 'android/build', 'android/app/build'];

// Clear Metro bundler cache
try {
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (error) {
  console.error('Error clearing Metro cache:', error);
}

// Clear TypeScript cache
try {
  execSync('rm -rf tsconfig.tsbuildinfo', { stdio: 'inherit' });
} catch (error) {
  console.error('Error clearing TypeScript cache:', error);
}

// Clear watchman watches
try {
  execSync('watchman watch-del-all', { stdio: 'inherit' });
} catch (error) {
  console.error('Error clearing Watchman watches:', error);
}

// Delete cache directories
paths.forEach(cachePath => {
  const fullPath = path.join(__dirname, '..', cachePath);
  try {
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`Cleared cache: ${cachePath}`);
    }
  } catch (error) {
    console.error(`Error clearing ${cachePath}:`, error);
  }
});

/**
 * Clean cache script for React Native & Expo projects
 * 
 * This script cleans various caches that can cause issues with Metro bundler
 * and React Native development in general.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to clean
const cachesToClean = [
  // Metro bundler cache
  path.join(os.tmpdir(), 'metro-cache'),
  path.join(os.tmpdir(), 'haste-map-metro-*'),
  
  // Babel cache 
  path.join(os.homedir(), '.babel.json'),
  
  // Watchman state
  path.join(os.homedir(), '.watchman-cookie-*'),
  
  // Yarn cache (if used)
  path.join(os.homedir(), '.yarn-cache'),
  
  // Project-specific caches
  path.join(__dirname, '..', 'node_modules', '.cache'),
  path.join(__dirname, '..', '.expo'),
];

// Functions for cleaning
function deletePath(pathPattern) {
  try {
    if (pathPattern.includes('*')) {
      // For glob patterns, use find command (Unix/macOS only)
      // This won't work on Windows but that's ok for this project
      execSync(`find ${path.dirname(pathPattern)} -name "${path.basename(pathPattern)}" -type d -exec rm -rf {} \\; 2>/dev/null || true`);
      console.log(`✓ Cleaned: ${pathPattern}`);
    } else if (fs.existsSync(pathPattern)) {
      if (fs.lstatSync(pathPattern).isDirectory()) {
        fs.rmSync(pathPattern, { recursive: true, force: true });
      } else {
        fs.unlinkSync(pathPattern);
      }
      console.log(`✓ Cleaned: ${pathPattern}`);
    }
  } catch (error) {
    console.log(`✗ Failed to clean: ${pathPattern}`);
  }
}

// Main cleaning function
function cleanCaches() {
  console.log('🧹 Cleaning React Native & Expo caches...');
  
  // Clean each path
  cachesToClean.forEach(deletePath);
  
  // Reset watchman if installed
  try {
    execSync('watchman watch-del-all 2>/dev/null || true', { stdio: 'inherit' });
    console.log('✓ Reset Watchman');
  } catch (error) {
    // Ignore - watchman might not be installed
  }
  
  // Clear npm/yarn caches if needed
  try {
    execSync('yarn cache clean || npm cache clean --force', { stdio: 'inherit' });
    console.log('✓ Cleaned package manager caches');
  } catch (error) {
    console.log('✗ Failed to clean package manager caches');
  }
  
  // Clean the build caches
  try {
    if (fs.existsSync(path.join(__dirname, '..', 'ios'))) {
      execSync('cd ios && xcodebuild clean || true', { stdio: 'inherit' });
      console.log('✓ Cleaned iOS build');
    }
    
    if (fs.existsSync(path.join(__dirname, '..', 'android'))) {
      execSync('cd android && ./gradlew clean || true', { stdio: 'inherit' });
      console.log('✓ Cleaned Android build');
    }
  } catch (error) {
    console.log('✗ Failed to clean native builds');
  }
  
  console.log('✅ All caches cleaned successfully!');
  console.log('🚀 Now restart your Expo server with: npx expo start --clear');
}

// Run the cleaning
cleanCaches();

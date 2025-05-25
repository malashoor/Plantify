import React, { ReactNode } from 'react';
import { Platform } from 'react-native';

// Polyfills for web
if (Platform.OS === 'web') {
  // This helps with React Native Web compatibility
  // Add any web-specific polyfills here
  require('react-native-url-polyfill/auto');
  
  // Fix for requestAnimationFrame which might be missing in some browsers
  if (typeof global.requestAnimationFrame !== 'function') {
    global.requestAnimationFrame = callback => {
      const id = setTimeout(() => {
        callback(Date.now());
      }, 0);
      return id;
    };
  }
}

interface WebCompatibilityWrapperProps {
  children: ReactNode;
}

/**
 * A wrapper component that provides compatibility fixes for web platform
 * This is useful when running the app in web mode
 */
export function WebCompatibilityWrapper({ children }: WebCompatibilityWrapperProps) {
  return <>{children}</>;
}

/**
 * Helper function to clear metro caches
 * Useful when you're experiencing bundling issues
 */
export function clearCache() {
  if (__DEV__) {
    console.log('Clearing cache...');
    // You would implement actual cache clearing logic here
    // For example, you could expose this as a dev menu option
  }
}

export default WebCompatibilityWrapper; 
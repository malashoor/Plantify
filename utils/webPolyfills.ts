// Web platform polyfills for React Native
import { Platform } from 'react-native';
import 'raf/polyfill'; // Request animation frame polyfill
import 'react-native-url-polyfill/auto'; // URL polyfill

// Only apply these polyfills in web environment
if (Platform.OS === 'web') {
  // Polyfill for requestAnimationFrame
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = callback => {
      return setTimeout(callback, 0);
    };
  }

  // Polyfill for cancelAnimationFrame
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = id => {
      clearTimeout(id);
    };
  }

  // Warn about any missing native modules
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Filter out non-critical errors related to missing native modules on web
    const errorMsg = args[0]?.toString?.() || '';
    if (
      errorMsg.includes('Native module cannot be null') ||
      errorMsg.includes('NativeModule') ||
      errorMsg.includes('Native method not implemented') ||
      errorMsg.includes('is not a function')
    ) {
      console.warn('Web compatibility warning:', ...args);
      return;
    }

    originalConsoleError(...args);
  };
}

export default function ensureWebPolyfills() {
  // This function can be imported to ensure polyfills are loaded
  // even if the file content isn't used directly
}

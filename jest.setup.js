// Import Jest's expect function first
import { expect } from '@jest/globals';
import '@testing-library/jest-native';
import '@testing-library/jest-native/extend-expect';
import React from 'react';

// Set up environment variables for testing
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-key';
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Mock NativeSettingsManager
jest.mock('react-native/Libraries/Settings/Settings', () => ({
  Settings: {
    get: jest.fn(() => ({})),
    set: jest.fn(),
  },
}));

// Define a more stable window mock
const windowMock = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  document: {
    createElement: jest.fn(),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    },
  },
  location: {
    href: '',
    search: '',
    pathname: '',
  },
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  navigator: {
    userAgent: 'node',
  },
};

// Delete existing window if it exists to prevent conflicts
delete global.window;

// Define window as non-configurable and non-writable
Object.defineProperty(global, 'window', {
  value: windowMock,
  writable: false,
  configurable: false,
});

// Mock React Native components and modules
jest.mock('react-native', () => {
  const mockComponent = (name) => {
    const component = (props) => {
      return React.createElement(name, props, props.children);
    };
    component.displayName = name;
    return component;
  };

  const RN = jest.requireActual('react-native');
  
  const createListComponent = (name) => {
    const Component = (props) => {
      const {
        data,
        renderItem,
        keyExtractor,
        ListHeaderComponent,
        ListFooterComponent,
        ListEmptyComponent,
        onEndReached,
        onRefresh,
        refreshing,
        ...rest
      } = props;

      const content = [];
      
      if (ListHeaderComponent) {
        content.push(
          React.createElement('div', { key: 'header' }, 
            React.isValidElement(ListHeaderComponent) 
              ? ListHeaderComponent 
              : React.createElement(ListHeaderComponent)
          )
        );
      }

      if (data && data.length > 0) {
        content.push(
          ...data.map((item, index) => {
            const key = keyExtractor ? keyExtractor(item, index) : index.toString();
            return React.createElement('div', { key }, renderItem({ item, index }));
          })
        );
      } else if (ListEmptyComponent) {
        content.push(
          React.createElement('div', { key: 'empty' },
            React.isValidElement(ListEmptyComponent)
              ? ListEmptyComponent
              : React.createElement(ListEmptyComponent)
          )
        );
      }

      if (ListFooterComponent) {
        content.push(
          React.createElement('div', { key: 'footer' },
            React.isValidElement(ListFooterComponent)
              ? ListFooterComponent
              : React.createElement(ListFooterComponent)
          )
        );
      }

      return React.createElement(name, { ...rest }, content);
    };
    Component.displayName = name;
    return Component;
  };

  return {
    ...RN,
    FlatList: createListComponent('FlatList'),
    SectionList: createListComponent('SectionList'),
    VirtualizedList: createListComponent('VirtualizedList'),
    VirtualizedSectionList: createListComponent('VirtualizedSectionList'),
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    Dimensions: {
      ...RN.Dimensions,
      get: jest.fn(() => ({ width: 375, height: 812 })),
    },
    PixelRatio: {
      ...RN.PixelRatio,
      get: jest.fn(() => 2),
      getFontScale: jest.fn(() => 1),
      getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
      roundToNearestPixel: jest.fn((size) => size),
    },
    StyleSheet: {
      ...RN.StyleSheet,
      create: jest.fn((styles) => styles),
      flatten: jest.fn((styles) => styles),
    },
    NativeModules: {
      ...RN.NativeModules,
      SettingsManager: {
        settings: {
          AppleLocale: 'en_US',
          AppleLanguages: ['en'],
        },
        getConstants: () => ({
          settings: {
            AppleLocale: 'en_US',
            AppleLanguages: ['en'],
          },
        }),
      },
      StatusBarManager: {
        getHeight: jest.fn(),
        setStyle: jest.fn(),
        setHidden: jest.fn(),
      },
      AccessibilityManager: {
        getMultiplier: jest.fn(() => Promise.resolve(1)),
        setAccessibilityContentSizeMultipliers: jest.fn(),
        announceForAccessibility: jest.fn(),
        isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
        isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
      },
    },
  };
});

// Mock expo modules
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-key',
    },
  },
}));

// Mock React Native's AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {},
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  usePathname: () => '/',
  Link: 'Link',
  Stack: 'Stack',
  Tabs: 'Tabs',
}));

// Mock Expo Secure Store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve()),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock Expo Network
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock Expo Device
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone',
  modelId: 'iPhone12,1',
  designName: null,
  productName: 'iPhone',
  deviceYearClass: 2019,
  totalMemory: 2048,
  supportedCpuArchitectures: ['arm64'],
  osName: 'iOS',
  osVersion: '14.0',
  osBuildId: '18A373',
  osInternalBuildId: '18A373',
  osBuildFingerprint: 'Apple/iPhone/iPhone:14.0/18A373',
  platformApiLevel: 14,
  deviceName: 'iPhone',
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      data: null,
      error: null,
    })),
  })),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Mock network module
jest.mock('./src/utils/network', () => ({
  NetworkManager: {
    isConnected: jest.fn(() => true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  },
}));

// Mock Mixpanel
jest.mock('mixpanel-react-native', () => ({
  Mixpanel: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    identify: jest.fn().mockResolvedValue(undefined),
    track: jest.fn().mockResolvedValue(undefined),
    optOutTracking: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock react-native-iap
jest.mock('react-native-iap', () => ({
  initConnection: jest.fn().mockResolvedValue(undefined),
  endConnection: jest.fn().mockResolvedValue(undefined),
  getProducts: jest.fn().mockResolvedValue([]),
  requestPurchase: jest.fn().mockResolvedValue({}),
  finishTransaction: jest.fn().mockResolvedValue(undefined),
  flushFailedPurchasesCachedAsPendingAndroid: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({ uri: 'test-uri' }),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  documentDirectory: 'file://test/',
}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getUniqueIdSync: jest.fn(() => 'test-device-id'),
}));

// Setup fetch mock
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Silence React Native warnings
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(obj => obj.ios),
}));

// Mock timers
jest.useFakeTimers(); 
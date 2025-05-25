import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

import { Database } from '@/types/supabase';
import { Alert, Platform } from 'react-native';


// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Log environment variables for debugging (only in development)
if (__DEV__) {
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Not set');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or anon key is missing. Please check your environment variables.',
  );
  if (Platform.OS !== 'web') {
    Alert.alert(
      'Configuration Error',
      'Supabase URL or anon key is missing. Please check your environment variables.',
    );
  }
}

// Secure storage implementation with fallback for web
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      // Add timeout settings
      fetch: (url, options) => {
        const timeout = 60000; // Increase timeout to 60 seconds for mobile
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        return fetch(url, {
          ...options,
          signal: controller.signal,
          // Add cache control headers to prevent caching issues
          headers: {
            ...options?.headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }).finally(() => clearTimeout(timeoutId));
      },
    },
    realtime: {
      timeout: 60000,
    },
  }
);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Helper function to test the Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection with URL:', supabaseUrl);

    // First, check if we can connect to Supabase at all
    const { error: pingError } = await supabase
      .from('plants')
      .select('count')
      .limit(1)
      .maybeSingle();

    if (pingError) {
      console.error('Supabase connection test failed:', pingError);

      // Check if it's a table not found error (which is okay for a new project)
      if (pingError.code === '42P01') {
        // Table doesn't exist yet, but connection is working
        console.log('Table does not exist yet, but connection is working');
        return {
          success: true,
          message: 'Connected, but tables not yet created',
        };
      }

      return {
        success: false,
        error: pingError.message,
        details: `Code: ${pingError.code}, Hint: ${pingError.hint || 'None'}`,
      };
    }

    return { success: true, message: 'Successfully connected to Supabase' };
  } catch (error: any) {
    console.error('Unexpected error during Supabase connection test:', error);

    // Check if it's a timeout error
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return {
        success: false,
        error: 'Connection timed out',
        details:
          'The request to Supabase took too long to complete. This might be due to network issues or Supabase service availability.',
      };
    }

    return {
      success: false,
      error: String(error),
      details: 'Unexpected error occurred during connection test',
    };
  }
};

// Helper function to retry a Supabase operation with exponential backoff
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(
        `Operation failed (attempt ${attempt + 1}/${maxRetries}):`,
        error,
      );

      // Don't wait after the last attempt
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// Helper function to create a lightweight offline-first cache
export const createOfflineCache = (key: string) => {
  return {
    async get<T>(): Promise<T | null> {
      try {
        const data = await ExpoSecureStoreAdapter.getItem(`offline_cache_${key}`);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error(`Error getting offline cache for ${key}:`, error);
        return null;
      }
    },

    async set<T>(data: T): Promise<void> {
      try {
        await ExpoSecureStoreAdapter.setItem(
          `offline_cache_${key}`,
          JSON.stringify(data),
        );
      } catch (error) {
        console.error(`Error setting offline cache for ${key}:`, error);
      }
    },

    async clear(): Promise<void> {
      try {
        await ExpoSecureStoreAdapter.removeItem(`offline_cache_${key}`);
      } catch (error) {
        console.error(`Error clearing offline cache for ${key}:`, error);
      }
    },
  };
};

// Utility to clear all Supabase-related caches
export const clearSupabaseCaches = async () => {
  try {
    // Get all keys from AsyncStorage
    const keys = await ExpoSecureStoreAdapter.getAllKeys();

    // Filter for Supabase-related keys
    const supabaseKeys = keys.filter(
      (key) =>
        key.startsWith('supabase.') ||
        key.startsWith('sb-') ||
        key.startsWith('offline_cache_'),
    );

    // Remove all Supabase-related items
    if (supabaseKeys.length > 0) {
      await ExpoSecureStoreAdapter.multiRemove(supabaseKeys);
      console.log('Cleared Supabase caches:', supabaseKeys.length, 'items');
    }

    return true;
  } catch (error) {
    console.error('Failed to clear Supabase caches:', error);
    return false;
  }
};

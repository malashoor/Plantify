import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Get Supabase credentials with multiple fallback sources
const getSupabaseUrl = () => {
  return (
    SUPABASE_URL ||
    Constants.expoConfig?.extra?.supabaseUrl ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    'https://olgxhameijbqxjafrvxz.supabase.co'
  );
};

const getSupabaseAnonKey = () => {
  return (
    SUPABASE_ANON_KEY ||
    Constants.expoConfig?.extra?.supabaseAnonKey ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ3hoYW1laWpicXhqYWZydnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzQzOTgsImV4cCI6MjA1NjQxMDM5OH0.ldF_a9ccd8odjpBtrACmo85RqMpJaoeXVLaVuBKVhkE'
  );
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });
  throw new Error('supabaseUrl and supabaseAnonKey are required');
}

console.log('Supabase configuration loaded:', {
  url: supabaseUrl.substring(0, 30) + '...',
  hasKey: !!supabaseAnonKey,
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-my-custom-header': 'PlantAI-v1.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

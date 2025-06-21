#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

const ESSENTIAL_VARS = [
  // Core Authentication
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',

  // Core Features
  'EXPO_PUBLIC_PLANT_ID_API_KEY',
  'EXPO_PUBLIC_OPENWEATHER_API_KEY',

  // IAP Configuration
  'IAP_SANDBOX',
  'APPLE_SHARED_SECRET',
  'GOOGLE_CLIENT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
] as const;

const OPTIONAL_VARS = [
  // Authentication (Optional Methods)
  'EXPO_PUBLIC_GOOGLE_CLIENT_ID',
  'EXPO_PUBLIC_APPLE_CLIENT_ID',

  // Storage (For Later)
  'EXPO_PUBLIC_STORAGE_URL',
  'EXPO_PUBLIC_STORAGE_BUCKET',

  // Additional Features (Phase 2)
  'EXPO_PUBLIC_GOOGLE_CLOUD_VISION_KEY',
  'EXPO_PUBLIC_SENSORPUSH_API_KEY',
  'EXPO_PUBLIC_NETATMO_CLIENT_ID',
  'EXPO_PUBLIC_NETATMO_CLIENT_SECRET',
  'EXPO_PUBLIC_ONESIGNAL_APP_ID',

  // Monetization (Phase 2)
  'EXPO_PUBLIC_ADMOB_IOS_BANNER_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID',
  'EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID',

  // Feature Flags
  'EXPO_PUBLIC_ENABLE_VOICE_COMMANDS',
  'EXPO_PUBLIC_ENABLE_DARK_MODE',
  'EXPO_PUBLIC_ENABLE_OFFLINE_MODE',
] as const;

const missing = ESSENTIAL_VARS.filter(k => !process.env[k]);
const missingOptional = OPTIONAL_VARS.filter(k => !process.env[k]);

const isCI = process.env.CI === 'true';
const isDev = process.env.NODE_ENV === 'development';

console.log('\n🔍 Environment Variable Check\n');

if (missing.length) {
  if (isCI) {
    console.error('❌ CI Environment: Missing essential variables:');
    missing.forEach(v => console.error(`   ${v}`));
    process.exit(1);
  } else if (isDev) {
    console.warn('⚠️  Development Environment: Missing essential variables (warning only):');
    missing.forEach(v => console.warn(`   ${v}`));
  } else {
    console.error('❌ Production Environment: Missing essential variables:');
    missing.forEach(v => console.error(`   ${v}`));
    process.exit(1);
  }
} else {
  console.log('✅ All essential variables are set!\n');
}

if (missingOptional.length) {
  console.log('ℹ️  Optional variables not set (OK):');
  missingOptional.forEach(v => console.log(`   ${v}`));
}

console.log('\n💡 Environment mode:', process.env.NODE_ENV || 'not set');
console.log('   CI mode:', isCI ? 'yes' : 'no');

if (process.env.IAP_SANDBOX === 'true') {
  console.log('   ⚠️  IAP: Running in SANDBOX mode');
} else if (process.env.IAP_SANDBOX === 'false') {
  console.log('   🚨 IAP: Running in PRODUCTION mode');
} else {
  console.log('   ❓ IAP: Mode not set');
}

// Only exit with error in CI if essential vars are missing
process.exit(isCI && missing.length ? 1 : 0); 
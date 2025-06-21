/* eslint-disable no-undef */
import 'dotenv/config';

const getEnvWithWarning = (key, defaultValue = null) => {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ Warning: ${key} is not set in environment`);
  }
  return value || defaultValue;
};

export default {
  name: "GreensAI",
  slug: "greensai",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.greensai.app",
    buildNumber: "1",
    deploymentTarget: "13.4",
    infoPlist: {
      NSCameraUsageDescription: "We need access to your camera to identify plants and capture plant photos.",
      NSPhotoLibraryUsageDescription: "We need access to your photo library to save and load plant photos.",
      NSLocationWhenInUseUsageDescription: "We need your location to provide accurate plant care recommendations based on your local weather conditions.",
      NSLocationAlwaysUsageDescription: "We need your location to provide accurate plant care recommendations based on your local weather conditions.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "We need your location to provide accurate plant care recommendations based on your local weather conditions.",
      UIBackgroundModes: ["location", "fetch"],
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/android-foreground.png",
      backgroundColor: "#ffffff"
    },
    package: "com.greensai.app",
    versionCode: 1,
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION"
    ]
  },
  plugins: [
    "expo-router",
    "expo-build-properties",
    "expo-updates",
    "react-native-iap",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static"
        }
      }
    ]
  ],
  scheme: "greensai",
  experiments: {
    typedRoutes: true
  },
  owner: "cchatllc",
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "4152c585-915a-44e2-8a02-5b64c2e4f022"
    },
    supabaseUrl: getEnvWithWarning('EXPO_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: getEnvWithWarning('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
    plantIdApiKey: getEnvWithWarning('EXPO_PUBLIC_PLANT_ID_API_KEY'),
    openWeatherApiKey: getEnvWithWarning('EXPO_PUBLIC_OPENWEATHER_API_KEY'),
    mixpanelToken: getEnvWithWarning('EXPO_PUBLIC_MIXPANEL_TOKEN'),
    googleClientId: getEnvWithWarning('EXPO_PUBLIC_GOOGLE_CLIENT_ID'),
    appleClientId: getEnvWithWarning('EXPO_PUBLIC_APPLE_CLIENT_ID'),
    storageUrl: getEnvWithWarning('EXPO_PUBLIC_STORAGE_URL'),
    storageBucket: getEnvWithWarning('EXPO_PUBLIC_STORAGE_BUCKET'),
    googleCloudVisionKey: getEnvWithWarning('EXPO_PUBLIC_GOOGLE_CLOUD_VISION_KEY'),
    sensorPushApiKey: getEnvWithWarning('EXPO_PUBLIC_SENSORPUSH_API_KEY'),
    netatmoClientId: getEnvWithWarning('EXPO_PUBLIC_NETATMO_CLIENT_ID'),
    netatmoClientSecret: getEnvWithWarning('EXPO_PUBLIC_NETATMO_CLIENT_SECRET'),
    oneSignalAppId: getEnvWithWarning('EXPO_PUBLIC_ONESIGNAL_APP_ID'),
    admobConfig: {
      ios: {
        bannerId: getEnvWithWarning('EXPO_PUBLIC_ADMOB_IOS_BANNER_ID'),
        interstitialId: getEnvWithWarning('EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID'),
      },
      android: {
        bannerId: getEnvWithWarning('EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID'),
        interstitialId: getEnvWithWarning('EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID'),
      }
    },
    featureFlags: {
      enableVoiceCommands: getEnvWithWarning('EXPO_PUBLIC_ENABLE_VOICE_COMMANDS', 'true') !== 'false',
      enableDarkMode: getEnvWithWarning('EXPO_PUBLIC_ENABLE_DARK_MODE', 'true') !== 'false',
      enableOfflineMode: getEnvWithWarning('EXPO_PUBLIC_ENABLE_OFFLINE_MODE', 'true') !== 'false'
    }
  }
};

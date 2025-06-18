import 'dotenv/config';

/* global module */
const config = {
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
    "expo-dev-client",
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
    }
  }
};

export default config;

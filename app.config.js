import 'dotenv/config';

/* global module */
export default {
  name: "GreensAI",
  slug: "greensai",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    bundleIdentifier: "com.greensai.app",
    buildNumber: "1",
    supportsTablet: true,
    deploymentTarget: '15.1',
    infoPlist: {
      NSCameraUsageDescription: "This app uses the camera to identify plants and diagnose plant health issues.",
      NSPhotoLibraryUsageDescription: "This app accesses your photos to help you identify plants and diagnose plant health issues.",
      NSLocationWhenInUseUsageDescription: "This app uses your location to provide local weather data and plant care recommendations.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "This app uses your location to provide local weather data and plant care recommendations.",
      NSLocationAlwaysUsageDescription: "This app uses your location to provide local weather data and plant care recommendations.",
      NSMotionUsageDescription: "This app uses motion sensors to optimize plant monitoring.",
      NSBluetoothAlwaysUsageDescription: "This app uses Bluetooth to connect to plant sensors.",
      NSBluetoothPeripheralUsageDescription: "This app uses Bluetooth to connect to plant sensors.",
      UIBackgroundModes: ["remote-notification", "bluetooth-central"]
    }
  },
  android: {
    package: "com.greensai.app",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "BLUETOOTH",
      "BLUETOOTH_ADMIN",
      "BLUETOOTH_SCAN",
      "BLUETOOTH_CONNECT",
      "ACCESS_BACKGROUND_LOCATION",
      "HIGH_SAMPLING_RATE_SENSORS"
    ]
  },
  plugins: [
    "expo-dev-client",
    "react-native-iap",
    "expo-localization",
    "expo-notifications",
    "expo-camera",
    "expo-image-picker",
    "expo-location",
    "expo-file-system",
    "expo-media-library",
    [
      "expo-build-properties",
      {
        "ios": {
          "deploymentTarget": "15.1",
          "useFrameworks": "static"
        },
        "android": {
          "compileSdkVersion": 33,
          "targetSdkVersion": 33,
          "buildToolsVersion": "33.0.0"
        }
      }
    ]
  ],
  extra: {
    eas: {
      projectId: "your-project-id"
    }
  },
  owner: 'm_ashoor',
  runtimeVersion: {
    policy: "sdkVersion"
  },
  updates: {
    url: "https://u.expo.dev/bf2e612b-23cd-4ac0-be30-d9ad9602656b"
  }
};

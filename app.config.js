import 'dotenv/config';

/* global module */
module.exports = {
  expo: {
    name: 'PlantAI',
    slug: 'plantai',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icons/plantify_icon_1024x1024.png',
    scheme: 'plantai',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/icons/plantify_icon_1024x1024.png',
      resizeMode: 'contain',
      backgroundColor: '#2E7D32',
      // Dark mode variant
      dark: {
        image: './assets/icons/plantify_icon_1024x1024.png',
        backgroundColor: '#121212',
      },
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.plantai.app',
      buildNumber: '1',
      // App Store icon (1024x1024 px, no rounded corners)
      appStoreIcon: './assets/icons/plantify_icon_1024x1024.png',
      // In-app icon (180x180 px)
      icon: './assets/icons/plantify_icon_1024x1024.png',
      infoPlist: {
        NSCameraUsageDescription:
          'We need access to your camera to identify plants',
        NSPhotoLibraryUsageDescription:
          'We need access to your photos to identify plants from your gallery',
        NSLocationWhenInUseUsageDescription:
          'We use your location to provide weather-based plant care recommendations',
        UIBackgroundModes: ['remote-notification'],
      },
      config: {
        usesNonExemptEncryption: false,
      },
      // Enable Hermes JavaScript engine for iOS
      jsEngine: 'hermes',
    },
    android: {
      package: 'com.plantai.app',
      versionCode: 1,
      adaptiveIcon: {
        // Foreground icon (108x108 px with 25% padding, transparent background)
        foregroundImage: './assets/icons/plantify_icon_512x512.png',
        backgroundColor: '#2E7D32',
      },
      // Google Play Store icon (512x512 px, PNG, <1024KB)
      playStoreIcon: './assets/icons/plantify_icon_512x512.png',
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
      ],
      // Enable Hermes JavaScript engine for Android
      jsEngine: 'hermes',
      // RAM bundle for improved performance on older devices
      enableProguardInReleaseBuilds: true,
      enableHermes: true,
    },
    web: {
      favicon: './assets/icons/plantify_icon_180x180.png',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-localization',
      'expo-web-browser',
      [
        'expo-notifications',
        {
          icon: './assets/icons/plantify_icon_1024x1024.png',
          color: '#2E7D32',
          mode: 'production',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow Plantify to access your photos to identify plants.',
          cameraPermission:
            'Allow Plantify to access your camera to take photos of plants.',
        },
      ],
      [
        'expo-splash-screen',
        {
          imageResizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#121212',
          },
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static'
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: 'bf2e612b-23cd-4ac0-be30-d9ad9602656b',
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      appleClientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID,
    },
    metro: {
      config: './metro.config.cjs',
    },
    // Performance optimizations
    updates: {
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
    },
    experiments: {
      tsconfigPaths: true,
      turboModules: true,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
    // Deep linking configuration
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'plantai',
            host: 'auth',
            pathPrefix: '/callback'
          }
        ],
        category: ['BROWSABLE', 'DEFAULT']
      }
    ]
  },
};

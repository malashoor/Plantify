/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000,
      globalSetup: './e2e/setupMockServer.ts',
      globalTeardown: './e2e/setupMockServer.ts'
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/PlantAI.app',
      build: 'xcodebuild -workspace ios/PlantAI.xcworkspace -scheme PlantAI -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      env: {
        EXPO_PUBLIC_API_URL: 'http://localhost:3030'
      }
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/PlantAI.app',
      build: 'xcodebuild -workspace ios/PlantAI.xcworkspace -scheme PlantAI -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
      env: {
        EXPO_PUBLIC_API_URL: 'http://localhost:3030'
      }
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [
        8081,
        3030
      ],
      env: {
        EXPO_PUBLIC_API_URL: 'http://localhost:3030'
      }
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      env: {
        EXPO_PUBLIC_API_URL: 'http://localhost:3030'
      }
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_3a_API_30_x86'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug'
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release'
    }
  }
}; 
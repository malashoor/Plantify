// @ts-nocheck
// This file needs to be CommonJS format for Expo/Metro to work properly

/** @type {import('@babel/core').ConfigFunction} */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      // Handle React Native reanimated
      'react-native-reanimated/plugin',
      // Handle module resolution
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@components': './components',
            '@constants': './constants',
            '@hooks': './hooks',
            '@services': './services',
            '@screens': './app/screens',
            '@assets': './assets',
          },
        },
      ],
      // Handle environment variables
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: true,
          allowUndefined: false,
        },
      ],
    ],
  };
};

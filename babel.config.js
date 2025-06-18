// @ts-nocheck
// This file needs to be CommonJS format for Expo/Metro to work properly

/** @type {import('@babel/core').ConfigFunction} */
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Handle React Native reanimated
      'react-native-reanimated/plugin',
      // Handle module resolution
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@providers': './src/providers',
            '@types': './src/types',
            '@lib': './src/lib',
            '@layouts': './src/components/layout'
          },
        },
      ],
      // Handle environment variables
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: true,
        allowUndefined: false,
      }],
    ],
  };
}; 
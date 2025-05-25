// @ts-nocheck
// This file needs to be CommonJS format for Expo/Metro to work properly

/** @type {import('@babel/core').ConfigFunction} */
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'react-native-reanimated/plugin',
        {
          relativeSourceLocation: true,
        },
      ],
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './app',
            '@components': './app/components',
            '@assets': './app/assets',
            '@constants': './app/constants',
            '@utils': './app/utils',
            '@screens': './app/screens',
            '@hooks': './app/hooks',
            '@contexts': './app/contexts',
            '@services': './app/services',
            '@types': './app/types',
            '@layouts': './app/components/layout',
          },
        },
      ],
    ],
  };
}; 
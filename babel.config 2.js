module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      // Add Reanimated plugin
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@hooks': './hooks',
            '@screens': './app',
            '@utils': './utils',
            '@constants': './constants',
            '@types': './types'
          },
        },
      ],
    ],
  };
};

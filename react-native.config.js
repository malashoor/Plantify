module.exports = {
  dependencies: {
    ...(process.env.NO_FLIPPER ? { 'react-native-flipper': { platforms: { ios: null } } } : {}),
    'react-native-iap': {
      platforms: {
        ios: null,
        android: null,
      },
    },
  },
  project: {
    ios: {
      sourceDir: './ios',
    },
    android: {
      sourceDir: './android',
    },
  },
  assets: ['./assets/fonts/'],
  resolver: {
    extraNodeModules: {
      '@': './src',
      '@components': './src/components',
      '@screens': './src/screens',
      '@hooks': './src/hooks',
      '@services': './src/services',
      '@providers': './src/providers',
      '@types': './src/types',
      '@lib': './src/lib',
      '@layouts': './src/components/layout',
    },
  },
};

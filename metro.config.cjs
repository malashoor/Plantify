/* global module, require, __dirname, process */
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Add resolution for .web.js extensions
  config.resolver.sourceExts = [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'cjs',
    'web.js',
    'web.jsx',
    'web.ts',
    'web.tsx',
  ];

  // Add proper alias for react-native-web and TypeScript paths
  config.resolver.extraNodeModules = {
    'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
    fs: path.resolve(__dirname, 'web-shims.js'),
    path: path.resolve(__dirname, 'web-shims.js'),
    os: path.resolve(__dirname, 'web-shims.js'),
  };

  // Add TypeScript path mapping support
  config.resolver.alias = {
    '@': path.resolve(__dirname, '.'),
    components: path.resolve(__dirname, 'components'),
    hooks: path.resolve(__dirname, 'hooks'),
    lib: path.resolve(__dirname, 'lib'),
    types: path.resolve(__dirname, 'types'),
    utils: path.resolve(__dirname, 'utils'),
    data: path.resolve(__dirname, 'data'),
    services: path.resolve(__dirname, 'services'),
    constants: path.resolve(__dirname, 'constants'),
    theme: path.resolve(__dirname, 'theme'),
  };

  // Optimize Metro configuration
  config.maxWorkers = 2;
  config.watchFolders = [__dirname];
  config.resetCache = true;

  // Configure transformer
  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    minifierPath: require.resolve('metro-minify-terser'),
    minifierConfig: {
      ecma: 8,
      keep_classnames: true,
      keep_fnames: true,
      module: true,
      mangle: {
        module: true,
        keep_classnames: true,
        keep_fnames: true,
      },
    },
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  };

  return config;
})();

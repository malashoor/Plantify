// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add custom resolver configuration
config.resolver.extraNodeModules = {
  '@components': path.resolve(__dirname, 'components'),
  '@constants': path.resolve(__dirname, 'constants'),
  '@hooks': path.resolve(__dirname, 'hooks'),
  '@services': path.resolve(__dirname, 'services'),
  '@screens': path.resolve(__dirname, 'app/screens'),
  '@assets': path.resolve(__dirname, 'assets'),
};

// Add support for native modules
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg', 'jpeg');
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

// Enable symlinks for monorepo support
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

module.exports = config;

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Agregar los módulos de Node.js que necesitamos
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve('stream-browserify'),
  https: require.resolve('https-browserify'),
  http: require.resolve('stream-http'),
  crypto: require.resolve('crypto-browserify'),
  events: require.resolve('events/'),
  buffer: require.resolve('buffer/'),
  process: require.resolve('process/browser'),
};

// Deshabilitar la función de exports de paquetes que causa problemas
config.resolver.unstable_enablePackageExports = false;

module.exports = config; 
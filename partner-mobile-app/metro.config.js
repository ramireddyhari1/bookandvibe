const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

console.log('[metro.config] unstable_allowRequireContext =', config.transformer.unstable_allowRequireContext);

module.exports = config;

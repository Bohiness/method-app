const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Добавляем .lottie в список поддерживаемых расширений
config.resolver.assetExts.push('lottie');

module.exports = withNativeWind(config, { input: './app/global.css' });

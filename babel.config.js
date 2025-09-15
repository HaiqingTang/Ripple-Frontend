// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 其他插件如果有，写在这里
      'react-native-reanimated/plugin', // 必须在最后
    ],
  };
};

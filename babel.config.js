module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // keep any other plugins you might add here...
      'react-native-worklets/plugin', // must be last
    ],
  };
};

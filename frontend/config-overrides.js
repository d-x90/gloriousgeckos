const { DefinePlugin } = require('webpack');

module.exports = {
  webpack: function (config, env) {
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    config.resolve.fallback.stream = require.resolve('stream-browserify');
    config.resolve.fallback.crypto = require.resolve('crypto-browserify');

    if (!config.plugins) {
      config.plugins = [];
    }
    config.plugins.push(
      new DefinePlugin({
        process: { env: {} },
        'process.env.NODE_ENV': 'production',
      })
    );

    return config;
  },
};

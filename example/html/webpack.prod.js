const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      LIBRARY_URL: JSON.stringify(process.env.npm_config_library_url),
      CONFIG_URL: JSON.stringify('.'),
    }),
  ],
});


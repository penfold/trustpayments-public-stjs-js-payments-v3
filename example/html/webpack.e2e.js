const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      LIBRARY_URL: JSON.stringify('https://library.securetrading.net:8443'),
      CONFIG_URL: null,
    }),
  ],
});

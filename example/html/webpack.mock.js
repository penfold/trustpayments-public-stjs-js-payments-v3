const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      LIBRARY_URL: JSON.stringify('https://webservices.securetrading.net:6443'),
      CONFIG_URL: JSON.stringify('https://webservices.securetrading.net:6443'),
    }),
  ],
});

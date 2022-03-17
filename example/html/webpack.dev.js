const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    bonjour: true,
    host: '0.0.0.0',
    allowedHosts: [
      '.securetrading.net',
    ],
    https: true,
    port: 8444,
    static: {
      directory: path.join(__dirname, './dist'),
    },
    client: false,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      LIBRARY_URL: JSON.stringify(`https://${process.env.npm_package_config_host}:8443`),
      CONFIG_URL: JSON.stringify('./json'),
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
});

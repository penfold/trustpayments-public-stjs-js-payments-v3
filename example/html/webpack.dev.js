const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    compress: true,
    contentBase: path.join(__dirname, './dist'),
    publicPath: '',
    port: 8444,
    https: {
      key: fs.readFileSync('./../../docker/app-html/nginx/cert/merchant.securetrading.net/key.pem'),
      cert: fs.readFileSync('./../../docker/app-html/nginx/cert/merchant.securetrading.net/cert.pem'),
      ca: fs.readFileSync('./../../docker/app-html/nginx/cert/minica.pem')
    },
    host: '0.0.0.0',
    writeToDisk: true,
    index: 'index.html',
    disableHostCheck: true,
    watchOptions: {
      ignored: ['node_modules']
    },
    injectClient: false,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      LIBRARY_URL: JSON.stringify(`https://${process.env.npm_package_config_host}:8443`),
      CONFIG_URL: JSON.stringify('./json'),
    }),
  ],
  output: {
    publicPath: './'
  }
});

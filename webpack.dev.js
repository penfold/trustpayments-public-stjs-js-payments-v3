const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const fs = require('fs');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    compress: true,
    contentBase: path.join(__dirname, './dist'),
    publicPath: '',
    port: 8443,
    https: {
      key: fs.readFileSync('./docker/app-html/nginx/cert/merchant.securetrading.net/key.pem'),
      cert: fs.readFileSync('./docker/app-html/nginx/cert/merchant.securetrading.net/cert.pem'),
      ca: fs.readFileSync('./docker/app-html/nginx/cert/minica.pem'),
    },
    hot: true,
    host: '0.0.0.0',
    writeToDisk: true,
    index: 'index.html',
    disableHostCheck: true,
    watchOptions: {
      ignored: ['node_modules']
    }
  },
  plugins: [
    new ManifestPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      FRAME_URL: JSON.stringify(process.env.npm_config_frame_url),
    })
  ]
});

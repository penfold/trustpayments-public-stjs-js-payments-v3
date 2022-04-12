const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.cjs');
const webpack = require('webpack');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const fs = require('fs');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    bonjour: true,
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync('./docker/app-html/nginx/cert/merchant.securetrading.net/key.pem'),
      cert: fs.readFileSync('./docker/app-html/nginx/cert/merchant.securetrading.net/cert.pem'),
      cacert: fs.readFileSync('./docker/app-html/nginx/cert/minica.pem'),
    },
    port: 8443,
    static: {
      directory: path.join(__dirname, './dist'),
    },
    client: false,
  },
  plugins: [
    new WebpackManifestPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      FRAME_URL: JSON.stringify(process.env.npm_config_frame_url),
      ST_VERSION: JSON.stringify(process.env.npm_package_version),
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
});

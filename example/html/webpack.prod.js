const webpack = require('webpack');
const fs = require('fs');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    compress: true,
    publicPath: '',
    port: 8444,
    https: {
      key: fs.readFileSync('./../../docker/app-html/nginx/cert/merchant.securetrading.net/key.pem'),
      cert: fs.readFileSync('./../../docker/app-html/nginx/cert/merchant.securetrading.net/cert.pem'),
      ca: fs.readFileSync('./../../docker/app-html/nginx/cert/minica.pem')
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      LIBRARY_URL: JSON.stringify(process.env.npm_config_library_url),
      CONFIG_URL: undefined,
    }),
  ],
});

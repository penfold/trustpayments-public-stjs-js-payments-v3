const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    port: 8443,
    https: true,
    host: '0.0.0.0',
    writeToDisk: true,
    disableHostCheck: true,
    watchOptions: {
      ignored: ['node_modules']
    },
    injectClient: false
  },
  plugins: [
    new WebpackManifestPlugin(),
    new webpack.DefinePlugin({
      FRAME_URL: JSON.stringify(process.env.npm_config_frame_url),
    }),
  ],
  resolve: {
    alias: {
      [path.resolve(__dirname, "src/environments/environment")]:
        path.resolve(__dirname, "src/environments/environment.test.ts")
    }
  }
});

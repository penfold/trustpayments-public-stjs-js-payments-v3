const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');
const webpack = require('webpack');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new WebpackManifestPlugin(),
    new webpack.DefinePlugin({
      FRAME_URL: JSON.stringify(process.env.npm_config_frame_url),
      ST_VERSION: JSON.stringify(process.env.npm_package_version),
    }),
  ],
  resolve: {
    alias: {
      [path.resolve(__dirname, 'src/environments/environment')]:
        path.resolve(__dirname, 'src/environments/environment.test.ts'),
    }
  }
});

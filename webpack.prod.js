const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const common = require('./webpack.common.js');
const releaseVersion = require('./package.json').version;

const generateSourceMaps = Boolean(process.env.npm_config_sentry_sourcemaps);
const plugins = [
  new webpack.DefinePlugin({
    FRAME_URL: JSON.stringify(process.env.npm_config_frame_url),
  }),
];

if (generateSourceMaps) {
  plugins.push(new SentryWebpackPlugin({
    authToken: process.env.SENTRY_AUTH_TOKEN,
    org: 'trustpayments',
    project: 'js-payments',
    release: releaseVersion,
    include: './dist',
    ignore: ['node_modules', 'webpack.dev.js'],
    errorHandler: (error, invokeErr, compilation) => {
      compilation.warnings.push('Sentry CLI Plugin Error: ' + error.message);
    },
  }));
}

module.exports = merge(common, {
  mode: 'production',
  devtool: generateSourceMaps ? 'source-map' : undefined,
  plugins,
  resolve: {
    alias: {
      [path.resolve(__dirname, 'src/environments/environment')]:
        path.resolve(__dirname, 'src/environments/environment.prod.ts'),
    },
  },
});

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const path = require('path');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const releaseVersion = require('./package.json').version;

const plugins = [
  new webpack.DefinePlugin({
    FRAME_URL: JSON.stringify(process.env.npm_config_frame_url),
  }),
];

if (process.env.SENTRY_AUTH_TOKEN) {
  plugins.push(new SentryWebpackPlugin({
    authToken: process.env.SENTRY_AUTH_TOKEN,
    org: 'trustpayments',
    project: 'js-payments',
    release: releaseVersion,
    include: './dist',
    ignore: ['node_modules', 'webpack.dev.js'],
  }));
} else {
  console.error('SENTRY_AUTH_TOKEN from env variables is not defined!');
}

module.exports = merge(common, {
  mode: 'production',
  plugins,
  resolve: {
    alias: {
      [path.resolve(__dirname, 'src/environments/environment')]:
        path.resolve(__dirname, 'src/environments/environment.prod.ts')
    }
  }
});

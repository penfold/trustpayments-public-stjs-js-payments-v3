const path = require('path');
const webpack = require('webpack');

module.exports = {
  resolve: {
    alias: {
      'crypto': path.resolve(__dirname, 'node_modules/crypto-browserify'),
      'stream': path.resolve(__dirname, 'node_modules/stream-browserify'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};

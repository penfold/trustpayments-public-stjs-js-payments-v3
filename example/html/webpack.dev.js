const path = require('path');
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
    headers: {
      'Content-Security-Policy': 'default-src \'none\'; script-src \'self\' \'unsafe-inline\' localhost:8443 https://*.trustpayments.dev https://*.securetrading.net https://*.google-analytics.com https://pay.google.com https://*.secure.checkout.visa.com https://*.cardinalcommerce.com; connect-src \'self\' https://*.sentry.io https://*.cardinalcommerce.com; img-src \'self\' https://*.google-analytics.com data: https://*.gstatic.com  https://*.secure.checkout.visa.com; font-src \'self\' https://*.gstatic.com; frame-src \'self\' localhost:8443 https://*.trustpayments.com https://*.trustpayments.dev https://*.thirdparty.com https://*.securetrading.net https://*.secure.checkout.visa.com https://*.cardinalcommerce.com https://pay.google.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; form-action \'self\' https://*.cardinalcommerce.com https://*.thirdparty.com https://www.example.com/; base-uri \'self\'',
    },
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

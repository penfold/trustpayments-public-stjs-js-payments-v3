const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    st: [
      './src/shared/imports/polyfills.ts',
      './src/bootstrap.ts',
      './src/client/dependency-injection/ServiceDefinitions.ts',
      './src/testing/ServicesOverrides.ts',
      './src/client/st/ST.ts'
    ],
    controlFrame: [
      './src/shared/imports/polyfills.ts',
      './src/bootstrap.ts',
      './src/application/dependency-injection/ServiceDefinitions.ts',
      './src/testing/ServicesOverrides.ts',
      './src/application/components/control-frame/control-frame.ts'
    ],
    creditCardNumber: [
      './src/shared/imports/polyfills.ts',
      './src/bootstrap.ts',
      './src/application/dependency-injection/ServiceDefinitions.ts',
      './src/testing/ServicesOverrides.ts',
      './src/application/components/card-number/card-number.ts'
    ],
    expirationDate: [
      './src/shared/imports/polyfills.ts',
      './src/bootstrap.ts',
      './src/application/dependency-injection/ServiceDefinitions.ts',
      './src/testing/ServicesOverrides.ts',
      './src/application/components/expiration-date/expiration-date.ts'
    ],
    securityCode: [
      './src/shared/imports/polyfills.ts',
      './src/bootstrap.ts',
      './src/application/dependency-injection/ServiceDefinitions.ts',
      './src/testing/ServicesOverrides.ts',
      './src/application/components/security-code/security-code.ts'
    ],
    animatedCard: [
      './src/shared/imports/polyfills.ts',
      './src/bootstrap.ts',
      './src/application/dependency-injection/ServiceDefinitions.ts',
      './src/testing/ServicesOverrides.ts',
      './src/application/components/animated-card/animated-card.ts'
    ]
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    library: 'SecureTrading',
    libraryExport: 'default',
    libraryTarget: 'umd',
    publicPath: ''
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'card-number.html',
      template: './src/application/components/index.html',
      templateParameters: {
        partial: 'creditCardNumber'
      },
      chunks: ['creditCardNumber']
    }),
    new HtmlWebpackPlugin({
      filename: 'expiration-date.html',
      template: './src/application/components/index.html',
      templateParameters: {
        partial: 'expirationDate'
      },
      chunks: ['expirationDate']
    }),
    new HtmlWebpackPlugin({
      filename: 'security-code.html',
      template: './src/application/components/index.html',
      templateParameters: {
        partial: 'securityCode'
      },
      chunks: ['securityCode']
    }),
    new HtmlWebpackPlugin({
      filename: 'animated-card.html',
      template: './src/application/components/index.html',
      templateParameters: {
        partial: 'animatedCard'
      },
      chunks: ['animatedCard']
    }),
    new HtmlWebpackPlugin({
      filename: 'control-frame.html',
      template: './src/application/components/index.html',
      templateParameters: {
        partial: 'controlFrame'
      },
      chunks: ['controlFrame']
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyPlugin({
      patterns: [{
        from: 'src/application/core/services/icon/images/*.png',
        to: 'images/[name][ext]',
        force: true
      }]
    }),
    new StyleLintPlugin({
      context: path.join(__dirname, 'src')
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ],
  optimization: {
    minimizer: [new TerserPlugin({ extractComments: false })]
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: [
          path.resolve(__dirname, './src/client/st/st.css'),
          path.resolve(__dirname, './src/integrations/apm/client/APMClient.scss'),
          path.resolve(__dirname, './src/integrations/click-to-pay/adapter/hpp-adapter/hpp-adapter.scss'),
        ],
      },
      {
        include: [
          path.resolve(__dirname, './src/client/st/st.css'),
          path.resolve(__dirname, './src/integrations/apm/client/APMClient.scss'),
          path.resolve(__dirname, './src/integrations/click-to-pay/adapter/hpp-adapter/hpp-adapter.scss'),
        ],
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(svg)$/,
        use: {
          loader: 'svg-url-loader',
          options: {
            encoding: 'base64',
            iesafe: true
          }
        }
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource'
      },
      {
        test: /\.tsx?|js$/,
        use: ['babel-loader', 'source-map-loader'],
        include: [
          path.join(__dirname, 'src'),
          path.join(__dirname, 'test'),
          path.join(__dirname, 'example'),
          path.join(__dirname, 'node_modules/ts-money'),
          path.join(__dirname, 'node_modules/hoek'),
          path.join(__dirname, 'node_modules/isemail'),
          path.join(__dirname, 'node_modules/joi'),
          path.join(__dirname, 'node_modules/topo'),
          path.join(__dirname, 'node_modules/caniuse-lite'),
          path.join(__dirname, 'node_modules/node-jose'),
          path.join(__dirname, 'node_modules/buffer'),
          path.join(__dirname, 'node_modules/pako'),
        ],
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'source-map-loader'
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.cjs'],
    fallback: {
      'fs': false,
      'tls': false,
      'net': false,
      'path': false,
      'zlib': false,
      'http': false,
      'https': false,
      'crypto': require.resolve('crypto-browserify/'),
      'util': require.resolve('util/'),
      'stream': require.resolve('stream-browserify/'),
      'buffer': require.resolve('buffer/')
    }
  }
};

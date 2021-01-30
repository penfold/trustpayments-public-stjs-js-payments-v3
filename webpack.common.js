const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

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
  node: {
    net: 'empty',
    tls: 'empty',
    dns: 'empty'
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
        to: 'images',
        force: true,
        flatten: true
      }]
    }),
    new StyleLintPlugin({
      context: path.join(__dirname, 'src')
    }),
    new FriendlyErrorsWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',
          'sass-loader',
          'source-map-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
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
          path.join(__dirname, 'node_modules/topo')
        ]
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: {
              emitErrors: true
            }
          }, {
            loader: 'source-map-loader'
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};

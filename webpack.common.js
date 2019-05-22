const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

module.exports = {
  entry: {
    main: './src/components/index.ts',
    componentControlFrame: './src/components/control-frame/control-frame.ts',
    stjs: './src/stjs.ts',
    example: './example/index.ts',
    immediateExample: './example/immediate.ts'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
    library: '[name]',
    libraryTarget: 'var',
    publicPath: ''
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'card-number.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'creditCardNumber'
      },
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'expiration-date.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'expirationDate'
      },
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'security-code.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'securityCode'
      },
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'animated-card.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'animatedCard'
      },
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'notification-frame.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'notificationFrame'
      },
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'control-frame.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'controlFrame'
      },
      chunks: ['componentControlFrame']
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './example/index.html',
      chunks: ['example'],
      favicon: './favicon.ico'
    }),
    new HtmlWebpackPlugin({
      filename: 'immediate.html',
      template: './example/immediate.html',
      chunks: ['immediateExample'],
      favicon: './favicon.ico'
    }),
    new HtmlWebpackPlugin({
      filename: 'receipt.html',
      template: './example/receipt.html',
      chunks: ['receipt'],
      favicon: './favicon.ico'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new ManifestPlugin(),
    new StyleLintPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new webpack.DefinePlugin({
      HOST: JSON.stringify(process.env.npm_package_config_host)
    })
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
          'sass-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: { emitErrors: true }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.po$/,
        use: [
          {
            loader: 'i18next-po-loader',
            options: {}
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};

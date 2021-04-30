const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    example: ['./pages/index/index.ts'],
    receipt: ['./pages/receipt/receipt.ts'],
    iframe: ['./pages/iframe/iframe.ts'],
    minimal: ['./pages/minimal/minimal.ts'],
    inlineConfig: ['./pages/index/inline-config.ts'],
    counter: ['./pages/index/counter.ts']
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist')
  },
  plugins: [
    new WebpackManifestPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './pages/index/index.html',
      chunks: ['example']
    }),
    new HtmlWebpackPlugin({
      filename: 'receipt.html',
      template: './pages/receipt/receipt.html',
      chunks: ['receipt']
    }),
    new HtmlWebpackPlugin({
      filename: 'iframe.html',
      template: './pages/iframe/iframe.html',
      chunks: ['iframe']
    }),
    new HtmlWebpackPlugin({
      filename: 'minimal.html',
      template: './pages/minimal/minimal.html',
      chunks: ['minimal']
    }),
    new HtmlWebpackPlugin({
      filename: 'minimal-content-security-header.html',
      template: './pages/minimal/minimal-content-security-header.html',
      chunks: ['minimal']
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'img/*.png',
          to: '',
          force: true,
        }
      ]
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'img/*.webp',
          to: '',
          force: true,
        }
      ]
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'json/*.json',
          to: '',
          force: true,
          noErrorOnMissing: true
        }
      ]
    }),
    new StyleLintPlugin({
      context: path.join(__dirname, ''),
      files: [
        'pages/**/*.scss',
        'styles/**/*.scss',
      ]
    }),
    new webpack.SourceMapDevToolPlugin({}),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  ],
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.tsx?|js$/,
        use: 'babel-loader',
        include: [path.join(__dirname, 'pages'), path.join(__dirname, 'shared'), path.resolve('./node_modules/buffer')]
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
          }
        ],
        exclude: /node_modules/
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "crypto": require.resolve("crypto-browserify/"),
      "util": require.resolve("util/"),
      "stream": require.resolve("stream-browserify/"),
      "buffer": require.resolve("buffer/")
    },
  }
};

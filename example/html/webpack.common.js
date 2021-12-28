const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    example: ['./pages/index/index.ts'],
    receipt: ['./pages/receipt/receipt.ts'],
    iframe: ['./pages/iframe/iframe.ts'],
    minimal: ['./pages/minimal/minimal.ts'],
    inlineConfig: ['./pages/index/inline-config.ts'],
    counter: ['./pages/index/counter.ts'],
    predefinedCallbacks: ['./pages/index/predefined-callbacks.ts'],
    visa: ['./pages/visa/visa.ts'],
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    publicPath: '',
  },
  plugins: [
    new WebpackManifestPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './pages/index/index.html',
      chunks: ['example'],
      publicPath: './',
    }),
    new HtmlWebpackPlugin({
      filename: 'receipt.html',
      template: './pages/receipt/receipt.html',
      chunks: ['receipt'],
      publicPath: './',
    }),
    new HtmlWebpackPlugin({
      filename: 'iframe.html',
      template: './pages/iframe/iframe.html',
      chunks: ['iframe'],
      publicPath: './',
    }),
    new HtmlWebpackPlugin({
      filename: 'minimal.html',
      template: './pages/minimal/minimal.html',
      chunks: ['minimal'],
      publicPath: './',
    }),
    new HtmlWebpackPlugin({
      filename: 'minimal-content-security-header.html',
      template: './pages/minimal/minimal-content-security-header.html',
      chunks: ['minimal'],
      publicPath: './',
    }),
    new HtmlWebpackPlugin({
      filename: 'visa.html',
      template: './pages/visa/visa.html',
      chunks: ['visa'],
      publicPath: './',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'img/*.png',
          to: '',
          force: true,
        },
      ],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'img/*.webp',
          to: '',
          force: true,
        },
      ],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'img/*.svg',
          to: '',
          force: true,
        },
      ],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'json/*.json',
          to: '',
          force: true,
          noErrorOnMissing: true,
        },
      ],
    }),
    new StyleLintPlugin({
      context: path.join(__dirname, ''),
      files: [
        'pages/**/*.scss',
        'styles/**/*.scss',
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new webpack.SourceMapDevToolPlugin({}),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: path.resolve(__dirname, '../../src/client/st/st.css'),
      },
      {
        include: path.resolve(__dirname, '../../src/client/st/st.css'),
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.tsx?|js$/,
        use: 'babel-loader',
        include: [path.join(__dirname, 'pages'), path.join(__dirname, 'shared'), path.resolve('./node_modules/buffer')],
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: {
              emitErrors: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
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
      'buffer': require.resolve('buffer/'),
    },
  },
};

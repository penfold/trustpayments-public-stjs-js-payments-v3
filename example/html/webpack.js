const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    compress: true,
    contentBase: path.join(__dirname, './dist'),
    publicPath: '',
    port: 8444,
    https: {
      key: fs.readFileSync('./../../docker/app-html/nginx/cert/merchant.securetrading.net/key.pem'),
      cert: fs.readFileSync('./../../docker/app-html/nginx/cert/merchant.securetrading.net/cert.pem'),
      ca: fs.readFileSync('./../../docker/app-html/nginx/cert/minica.pem')
    },
    hot: true,
    host: '0.0.0.0',
    writeToDisk: true,
    index: 'index.html',
    disableHostCheck: true,
    watchOptions: {
      ignored: ['node_modules']
    }
  },

  entry: {
    example: ['./pages/index/index.ts'],
    receipt: ['./pages/receipt/receipt.ts'],
    iframe: ['./pages/iframe/iframe.ts'],
    inlineConfig: ['./pages/index/inline-config.ts'],
    counter: ['./pages/index/counter.ts']
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist')
  },
  plugins: [
    new WebpackManifestPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      BUNDLE_URL: JSON.stringify(`https://${process.env.npm_package_config_host}:8443`),
      EXAMPLE_URL: JSON.stringify(`https://${process.env.npm_package_config_host}:8444`)
    }),
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
    new CopyPlugin({
      patterns: [
        {
          from: 'img/*.png',
          to: 'img',
          force: true
        }
      ]
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'img/*.webp',
          to: 'img',
          force: true
        }
      ]
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'json/*.json',
          to: 'json',
          force: true,
          noErrorOnMissing: true
        }
      ]
    }),
    new StyleLintPlugin({
      context: path.join(__dirname, '')
    })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
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
        test: /\.tsx?|js$/,
        use: 'babel-loader',
        include: [path.join(__dirname, 'pages'), path.join(__dirname, 'shared')]
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
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
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
      "crypto": require.resolve("crypto-js/"),
      "util": require.resolve("util/"),
      "stream": require.resolve("stream/")
    }
  }
};

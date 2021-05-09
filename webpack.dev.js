const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const base = require('./webpack.base.js');

module.exports = merge(base, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    hot: true,
    port: 8080,
    // historyApiFallback: true,
    writeToDisk: true,
    // noInfo: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      'process.env.BASE_URL': '"/"',
      APP_SECRET: '"hello"',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
});

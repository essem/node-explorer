const webpack = require('webpack');
const path = require('path');
const HtmlwebpackPlugin = require('html-webpack-plugin');

const apiHost = (process.env.NODE_ENV === 'production') ? '' : 'http://localhost:5000';

const plugins = [
  new webpack.DefinePlugin({ API_HOST: JSON.stringify(apiHost) }),
  new webpack.HotModuleReplacementPlugin(),
  new HtmlwebpackPlugin({
    title: 'node explorer',
    favicon: './app/public/favicon.ico',
    template: './app/public/index.ejs',
  }),
];

module.exports = {
  devtool: 'source-map',
  entry: './app/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    hot: true,
    inline: true,
    progress: true,
    historyApiFallback: true,
    host: '0.0.0.0',
    port: 5001,
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
      }, {
        test: /\.css$/,
        loader: 'style!css',
      }, {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&minetype=application/font-woff',
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&minetype=application/octet-stream',
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file',
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&minetype=image/svg+xml',
      },
    ],
  },
  plugins,
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './client/src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './client/public/index.html', to: 'index.html' }
      ],
    }),
    // new HtmlWebpackPlugin({
    //   template: './client/public/index.html',
    //   inject: 'body',
    //   minify: {
    //     removeComments: true,
    //     collapseWhitespace: true,
    //     keepClosingSlash: true,
    //   },
    //   // Prevent HTML escaping of the script tag:
    //   scriptLoading: 'blocking',
    //   xhtml: true,
    // }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    historyApiFallback: true
  },
};
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
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env"],
          }
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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,  // Avoids mangling variable names.
          output: {
            ascii_only: true,  // Ensures output uses proper characters.
            comments: false,  // Strips out comments.
          },
        },
      }),
    ],
  },
  plugins: [
    // new CopyWebpackPlugin({
    //   patterns: [
    //     { from: './client/public/index.html', to: 'index.html' },
    //     { from: './client/public/supp.html', to: 'supp.html' },
    //   ],
    // }),
    new HtmlWebpackPlugin({
      template: './client/public/index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        keepClosingSlash: true,
      },
      // Prevent HTML escaping of the script tag:
      scriptLoading: 'blocking',
      xhtml: true,
    }),
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
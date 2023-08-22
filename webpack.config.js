const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    tech_employment: "./src/tech_employment.js",
    automation: "./src/automation.js"
  },
  output: {
    path: path.resolve("docs"),
    filename: '[name].[contenthash].js',
  },
  module: {
    rules: [
      { test: /\.js$/, loader: "babel-loader", exclude: /node_modules/ },
      {
        test: /\.css$/, 
        use: [
          'style-loader',
          'css-loader'
        ] 
      },
      {
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/tech_employment.html',
      inject: true,
      chunks: ['tech_employment'],
      filename: 'tech_employment.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/automation.html',
      inject: true,
      chunks: ['automation'],
      filename: 'automation.html'
    })
  ],
  mode: 'development'
};
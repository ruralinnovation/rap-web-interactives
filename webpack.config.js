const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: "./src/index.html",
  filename: "index.html",
  inject: "body"
});
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve("dist"),
    filename: "index_bundle.js"
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
  plugins: [HtmlWebpackPluginConfig],
  mode: 'development'
};
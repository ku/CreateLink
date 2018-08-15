"use strict"

const webpack = require("webpack")

module.exports = {
  entry: {
    "background": './src/background.js',
    "popup": './src/popup.js',
  },
  //devtool: 'source-map',
  cache: true,
  output: {
    // https://stackoverflow.com/questions/42940050/configuration-output-path-the-provided-value-public-is-not-an-absolute-path
    path: __dirname + "/extension/js",
    publicPath: '/',
    filename: "[name].js"
  },
}


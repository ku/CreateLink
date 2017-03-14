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
    path: `extension/js`,
    publicPath: '/',
    filename: "[name].js"
  },
}


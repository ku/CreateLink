"use strict"

const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: {
    "background": './src/background.js',
    "popup": './src/popup.js',
    "options": './src/options.js',
  },
  devtool: "source-map",
  node: { global: false },
  cache: true,
  output: {
    path: `${path.resolve(__dirname, 'extension/js')}`,
    publicPath: '/',
    filename: "[name].js"
  },
}


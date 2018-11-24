'use strict'

const path = require('path')
const fs = require('fs-extra')
const webpack = require('webpack')
const paths = require('../utils/paths')
const { eslintFix, getFilename, target } = require('./webpack.vars')

const servicesFolder = paths.appServicesFolder
const servicesPaths = fs.readdirSync(servicesFolder)

const servicesEntries = {}
servicesPaths.forEach(file => {
  if (!file.match(/^[^.]*.js$/)) return
  var filename = file.match(/^([^.]*).js$/)[1]
  servicesEntries[filename] = path.resolve(path.join(servicesFolder, file))
})

const config = {
  __mergeStrategy: {
    smart: false,
    strategy: {
      plugins: 'replace',
      output: 'replace',
      entry: 'replace',
      optimization: 'replace',
      module: 'replace'
    }
  },
  entry: servicesEntries,
  output: {
    path: paths.appServicesBuild,
    filename: `${getFilename()}.js`
  },
  target: 'node',
  optimization: {}, // reset optimization property
  devtool: false,
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: require.resolve('eslint-loader'),
        exclude: /node_modules/,
        options: {
          extends: ['cozy-app'],
          fix: eslintFix,
          emitWarning: true
        }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|cozy-(bar|client-js))/,
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: 'node_modules/.cache/babel-loader/node',
          babelrc: false,
          presets: [['cozy-app', { node: true, react: false }]]
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __TARGET__: JSON.stringify('services')
    })
  ]
}

// only for browser target (services are usable only on cozy-stack)
module.exports = target === 'browser' ? { multiple: { services: config } } : {}

const baseWebpack = require('../../configurations/webpack.base.config.js');

module.exports = baseWebpack({ env: process.env, dirname: __dirname, libraryTarget: 'umd' });
const baseWebpack = require('../../webpack.base.config.js');

module.exports = baseWebpack({ env: process.env, dirname: __dirname });
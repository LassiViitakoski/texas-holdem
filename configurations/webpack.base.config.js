const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = ({ env, dirname, libraryTarget = 'commonjs' }) => {
  const { NODE_ENV = 'production'} = env;
  return {
    entry: path.resolve(dirname, './src/index.ts'),
    mode: NODE_ENV,
    target: 'node',
    watch: NODE_ENV === 'development',
    output: {
      path: path.resolve(dirname, './dist'),
      filename: 'index.js',
      libraryTarget
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: ['ts-loader'],
        },
      ],
    },
    plugins: [new NodemonPlugin()],
  }
}

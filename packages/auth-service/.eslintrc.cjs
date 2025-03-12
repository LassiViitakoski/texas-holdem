const path = require('path');
const baseLintRules = require('../../eslint.base.cjs');

module.exports = {
  env: { node: true },
  extends: ['airbnb-base', 'airbnb-typescript/base'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: path.join(__dirname, 'tsconfig.json')
  },
  plugins: ['@typescript-eslint'],
  rules: {
    ...baseLintRules,
  },
  ignorePatterns: [".eslintrc.cjs", "*.js", "*.mjs", "*.d.ts"]
}
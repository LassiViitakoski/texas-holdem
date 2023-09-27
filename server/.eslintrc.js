const path = require('path');

module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['airbnb-base', 'airbnb-typescript/base'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: path.join(__dirname, 'tsconfig.json')
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'indent': ['error', 4, { 'SwitchCase': 1 }],
    '@typescript-eslint/indent': ['error', 4, { SwitchCase: 1 }],
    'no-console': 'off',
    'import/prefer-default-export': 'off'
  },
  ignorePatterns: [".eslintrc.js", "webpack.config.js"]
}
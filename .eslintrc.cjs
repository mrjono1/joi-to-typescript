module.exports = {
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module' // Allows for the use of imports
  },
  rules: {
    'lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterSingleLine: true
      }
    ],
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false
      },


    ],
    "no-console": "error",
    "eqeqeq": "error"
  }
};

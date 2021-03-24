module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:jest/recommended'],
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-inferrable-types': 0,
    'jest/no-done-callback': 0,
    'jest/no-jasmine-globals': 0,
    'jest/no-standalone-expect': [ 'error', { 'additionalTestBlockFunctions': ['each.it'] }],
    'jest/expect-expect': ['error', { 'assertFunctionNames': ['expect', 'verify', 'done'] }],
    'object-curly-spacing': [2, 'always'],
    'quotes': [2, 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    'no-prototype-builtins': 0,
    'no-extra-boolean-cast': 'warn'
  },
};

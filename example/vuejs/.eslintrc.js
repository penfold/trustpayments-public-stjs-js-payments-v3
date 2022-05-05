module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    semi: 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'class-methods-use-this': 'off',
    'no-eval': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'comma-dangle': 'off',
    'linebreak-style': ['error', 'unix'],
    'no-extra-semi': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    'import/no-extraneous-dependencies': 'warn',
    'import/extensions': 'warn',
    'import/no-unresolved': 'warn',
    'vue/multi-word-component-names': 'off',
    'vuejs-accessibility/form-control-has-label': 'off'
  },
};

module.exports = {
  '*.ts': [
    (filenames) => `npx eslint -c .eslintrc-strict.js ${filenames.join(' ')}`,
    () => 'npm run typescript:check'
  ]
};

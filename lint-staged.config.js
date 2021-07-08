module.exports = {
  '*.ts': [
    (filenames) => `npx eslint ${filenames.join(' ')}`,
    () => 'npm run typescript:check'
  ]
};

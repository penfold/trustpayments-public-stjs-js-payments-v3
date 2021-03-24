module.exports = {
  '*.ts': [
    'npm run prettier',
    'npm run lint',
    () => 'npm run typescript:check'
  ]
};

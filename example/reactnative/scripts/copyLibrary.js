const fse = require('fs-extra');

const srcDir = `./../src/library/`;
const destDir = `./../android/app/src/main/assets/library/`;

module.exports = fse.copy(srcDir, destDir, function (err) {
  if (err) {
    console.error(err);
  } else {
    console.log('JS libray has been copied for android!');
  }
});

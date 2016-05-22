/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const co = require('co');
const util = require('./util');

const targetDir = process.argv[2];
const type = 'max800';

console.log(`processing ${targetDir}`);

co(function* () { // eslint-disable-line func-names
  const files = fs.readdirSync(targetDir);
  for (const file of files) {
    const srcPath = path.resolve(targetDir, file);
    const targetPath = util.getImageCacheFilepath(srcPath, type);

    console.log(`create ${targetPath} from ${srcPath}`);
    yield util.createImageCache(type, srcPath, targetPath);
  }
});

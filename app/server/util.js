import fs from 'fs';

function promisify(func) {
  return function() {
    var params = arguments;
    return new Promise(function(resolve, reject) {
      func(...params, function(err, ...results) {
        if (err) {
          reject(err);
        } else {
          if (results.length == 0) {
            resolve();
          } else if (results.length == 1) {
            resolve(results[0]);
          } else {
            resolve(results);
          }
        }
      });
    });
  };
}

module.exports.pipeStream = function(readStream, writeStream) {
  return new Promise(function(resolve, reject) {
    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
    readStream.pipe(writeStream);
  });
};

module.exports.readdir = promisify(fs.readdir);
module.exports.unlink = promisify(fs.unlink);

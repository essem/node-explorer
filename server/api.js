const parse = require('co-busboy');
const sendfile = require('koa-sendfile');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const config = require('config');
const logger = require('./logger');

function getFilePath(param) {
  const result = /(\d+)(.*)/.exec(param);
  if (!result) {
    return null;
  }

  const bookmarkIndex = parseInt(result[1], 10);
  const bookmark = config.bookmarks[bookmarkIndex];
  if (!bookmark) {
    return null;
  }

  let subdir = result[2];
  if (subdir.length > 0) {
    if (subdir[0] !== '/') {
      return null;
    }

    subdir = subdir.substr(1);
  }

  const realpath = path.normalize(path.resolve(bookmark.dir, subdir));
  if (!realpath.startsWith(bookmark.dir)) {
    return null;
  }

  return realpath;
}

const funcs = {
  *bookmarks() {
    const bookmarks = config.get('bookmarks');
    this.body = JSON.stringify(bookmarks.map(b => b.name));
  },

  *dir(param) {
    const dir = getFilePath(param);
    if (!dir) {
      this.body = 'invalid location';
      return;
    }

    let files = yield fs.readdirAsync(dir);
    files = files.map(file => {
      const stats = fs.lstatSync(path.resolve(dir, file));
      return {
        name: file,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime.getTime(),
      };
    });
    this.body = files;
  },

  *download(param) {
    const filepath = getFilePath(param);
    if (!filepath) {
      this.body = 'invalid location';
      return;
    }

    yield sendfile(this, filepath);
    if (!this.status) {
      this.throw(404);
    }
  },

  *upload(param) {
    const dir = getFilePath(param);
    if (!dir) {
      this.body = 'invalid location';
      return;
    }

    const parts = parse(this);
    let part = yield parts;
    while (part) {
      const filename = path.resolve(dir, part.filename);
      const readStream = part;
      const writeStream = fs.createWriteStream(filename);
      yield new Promise((resolve, reject) => {
        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);
        readStream.pipe(writeStream);
      });

      part = yield parts;
    }

    this.status = 200;
  },

  *delete(param) {
    const filepath = getFilePath(param);
    if (!filepath) {
      this.body = 'invalid location';
      return;
    }

    yield fs.unlinkAsync(filepath);
    this.status = 200;
  },
};

function init(app) {
  app.use(function* apiHandler(next) {
    const result = /^\/api\/(\w+)\/?(.*)/.exec(this.path);
    if (!result) {
      yield next;
      return;
    }

    const apiName = result[1];
    const param = result[2];
    if (!funcs[apiName]) {
      logger.warn(`Invalid api: ${apiName}`);
      return;
    }

    try {
      yield* funcs[apiName].call(this, param);
    } catch (err) {
      logger.warn(`Failed to handle api: ${apiName}`, err, err.stack);
      this.status = 500;
    }
  });
}

module.exports = init;

import parse from 'co-busboy';
import sendfile from 'koa-sendfile';
import path from 'path';
import fs from 'fs';
import config from '../../config';
import sutil from './util';

function getFilePath(param) {
  let result = /(\d+)(.*)/.exec(param);
  if (!result) {
    return null;
  }

  let bookmarkIndex = parseInt(result[1]);
  let bookmark = config.bookmarks[bookmarkIndex];
  if (!bookmark) {
    return null;
  }

  let subdir = result[2];
  if (subdir.length > 0) {
    if (subdir[0] != '/') {
      return null;
    }
    subdir = subdir.substr(1);
  }

  let realpath = path.normalize(path.resolve(bookmark.dir, subdir));
  if (!realpath.startsWith(bookmark.dir)) {
    return null;
  }

  return realpath;
}

let funcs = {
  'bookmarks': function*(koa) {
    koa.body = JSON.stringify(config.bookmarks.map(b => b.name));
  },

  'dir': function*(koa, param) {
    let dir = getFilePath(param);
    if (!dir) {
      koa.body = 'invalid location';
      return;
    }

    let files = yield sutil.readdir(dir);
    files = files.map(function(file) {
      let stats = fs.lstatSync(path.resolve(dir, file));
      return {
        name: file,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime.getTime()
      };
    });
    koa.body = files;
  },

  'download': function*(koa, param) {
    let filepath = getFilePath(param);
    if (!filepath) {
      koa.body = 'invalid location';
      return;
    }

    filepath = path.resolve('/', filepath);
    yield* sendfile.call(koa, filepath);
    if (!koa.status) {
      koa.throw(404);
    }
  },

  'upload': function*(koa, param) {
    let dir = getFilePath(param);
    if (!dir) {
      koa.body = 'invalid location';
      return;
    }

    let parts = parse(koa);
    let part = yield parts;
    while (part) {
      let filename = path.resolve(dir, part.filename);
      yield sutil.pipeStream(part, fs.createWriteStream(filename));
      part = yield parts;
    }
    koa.status = 200;
  },

  'delete': function*(koa, param) {
    let filepath = getFilePath(param);
    if (!filepath) {
      koa.body = 'invalid location';
      return;
    }

    filepath = path.resolve('/', filepath);
    yield sutil.unlink(filepath);
    koa.status = 200;
  }
};

module.exports.call = function*(koa, pathname) {
  let result = /(\w+)\/?(.*)/.exec(pathname);
  if (!result) {
    console.log('Failed to parse api call', pathname);
    return;
  }
  let apiName = result[1];
  let param = result[2];
  if (!funcs[apiName]) {
    console.log('No api name', apiName);
    return;
  }

  try {
    yield* funcs[apiName](koa, param);
  } catch (err) {
    console.log('api fail', err, err.stack);
    koa.status = 500;
  }
};

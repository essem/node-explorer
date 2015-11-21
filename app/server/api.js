import parse from 'co-busboy';
import sendfile from 'koa-sendfile';
import path from 'path';
import fs from 'fs';
import config from '../../config';
import sutil from './util';

let funcs = {
  'bookmarks': function*(koa) {
    koa.body = JSON.stringify(config.bookmarks);
  },

  'dir': function*(koa, pathname) {
    let dir = decodeURIComponent(pathname);
    if (dir.indexOf('..') != -1) {
      koa.body = 'invalid dir';
      return;
    }
    dir = path.resolve('/', dir);
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

  'download': function*(koa, pathname) {
    let filepath = decodeURIComponent(pathname);
    if (filepath.indexOf('..') != -1) {
      koa.body = 'invalid dir';
      return;
    }
    filepath = path.resolve('/', filepath);
    yield* sendfile.call(koa, filepath);
    if (!koa.status) {
      koa.throw(404);
    }
  },

  'upload': function*(koa, pathname) {
    let dir = decodeURIComponent(pathname);
    if (dir.indexOf('..') != -1) {
      koa.body = 'invalid dir';
      return;
    }
    dir = path.resolve('/', dir);

    let parts = parse(koa);
    let part = yield parts;
    while (part) {
      let filename = path.resolve(dir, part.filename);
      yield sutil.pipeStream(part, fs.createWriteStream(filename));
      part = yield parts;
    }
    koa.status = 200;
  },

  'delete': function*(koa, pathname) {
    let filepath = decodeURIComponent(pathname);
    if (filepath.indexOf('..') != -1) {
      koa.body = 'invalid dir';
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
    console.log('api fail', err);
    koa.status = 500;
  }
};

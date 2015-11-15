import koa from 'koa';
import koaAuth from 'koa-basic-auth';
import koaStatic from 'koa-static';
import sendfile from 'koa-sendfile';
import ejs from 'koa-ejs';
import path from 'path';
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

let readdir = promisify(fs.readdir);

var config = null;
try {
  config = require('../../config');
} catch (err) {
  console.log('Failed to load config file.', err);
  process.exit();
}

let port = config.port;

let app = koa();

app.use(function*(next){
  let start = new Date;
  yield next;
  let ms = new Date - start;
  console.log('%s %s - %s ms', this.method, this.url, ms);
});

app.use(function *(next){
  try {
    yield next;
  } catch (err) {
    if (401 == err.status) {
      this.status = 401;
      this.set('WWW-Authenticate', 'Basic');
      this.body = 'Enter account and password.';
    } else {
      throw err;
    }
  }
});

app.use(koaAuth(config.auth));

app.use(koaStatic('public'));

ejs(app, {
  root: path.join(__dirname, 'view'),
  layout: false,
  viewExt: 'ejs',
  cache: false
});

app.use(function*() {
  let result = /^\/api\/dir\/?(.*)/.exec(this.url);
  if (result) {
    let dir = decodeURIComponent(result[1]);
    if (dir.indexOf('..') != -1) {
      this.body = 'invalid dir';
      return;
    }
    dir = path.resolve('/', dir);
    let files = yield readdir(dir);
    files = files.map(function(file) {
      let stats = fs.lstatSync(path.resolve(dir, file));
      return {
        name: file,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime.getTime()
      };
    });
    this.body = files;
    return;
  }

  result = /^\/api\/download\/?(.*)/.exec(this.url);
  if (result) {
    let filepath = decodeURIComponent(result[1]);
    if (filepath.indexOf('..') != -1) {
      this.body = 'invalid dir';
      return;
    }
    filepath = path.resolve('/', filepath);
    yield* sendfile.call(this, filepath);
    if (!this.status) {
      this.throw(404);
    }
    return;
  }

  let bundlePath = 'bundle.js';
  if (process.env.NODE_ENV != 'production') {
    bundlePath = 'http://localhost:5001/assets/bundle.js';
  }
  yield this.render('index.html', { bundlePath: bundlePath });
});

app.listen(port);
console.log(`server is started on ${port} in ${process.env.NODE_ENV} mode`);

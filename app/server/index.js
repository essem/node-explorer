import koa from 'koa';
import koaAuth from 'koa-basic-auth';
import koaStatic from 'koa-static';
import ejs from 'koa-ejs';
import path from 'path';
import url from 'url';
import fs from 'fs';
import api from './api';

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

app.use(function*(next){
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
  let pathname = decodeURIComponent(url.parse(this.url).pathname);

  let result = /^\/api\/(.*)/.exec(pathname);
  if (result) {
    yield api.call(this, result[1]);
    return;
  }

  let bundlePath = '/bundle.js';
  if (process.env.NODE_ENV != 'production') {
    bundlePath = 'http://localhost:5001/assets/bundle.js';
  }
  yield this.render('index.html', { bundlePath: bundlePath });
});

if (fs.existsSync('cert')) {
  // sample certificate can be made following command
  // openssl req -new -x509 -nodes -out server.crt -keyout server.key
  let options = {
    key: fs.readFileSync('cert/server.key'),
    cert: fs.readFileSync('cert/server.crt')
  };
  require('https').createServer(options, app.callback()).listen(port);
  console.log(`server is started on ${port}(https) in ${process.env.NODE_ENV} mode`);
} else {
  app.listen(port);
  console.log(`server is started on ${port} in ${process.env.NODE_ENV} mode`);
}

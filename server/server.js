/* eslint-disable global-require */

const koa = require('koa');
const cors = require('koa-cors');
const send = require('koa-send');
const auth = require('koa-basic-auth');
const morgan = require('koa-morgan');
const config = require('config');
const fs = require('fs');
const logger = require('./logger');
const api = require('./api');

function createServer(hostname, port) {
  const app = koa();

  const stream = {
    write(message) {
      logger.info(message.slice(0, -1));
    },
  };
  app.use(morgan.middleware('combined', { stream }));

  if (config.get('cors')) {
    app.use(cors());
  }

  if (config.has('auth')) {
    app.use(function* authHandler(next) {
      try {
        yield next;
      } catch (err) {
        if (err.status === 401) {
          this.status = 401;
          this.set('WWW-Authenticate', 'Basic');
          this.body = 'Enter account and password.';
        } else {
          throw err;
        }
      }
    });

    app.use(auth(config.get('auth')));
  }

  api(app);

  if (config.get('serveStatic')) {
    app.use(require('koa-static')('dist'));
  }

  app.use(function* index() {
    yield send(this, 'dist/index.html');
  });

  const envStr = process.env.NODE_ENV || 'development';
  let httpServer = null;

  if (fs.existsSync('cert')) {
    const options = {
      key: fs.readFileSync('cert/server.key'),
      cert: fs.readFileSync('cert/server.crt'),
    };
    httpServer = require('https').createServer(options, app.callback()).listen(port);
    logger.info(`server is started on ${hostname}:${port}(https) in ${envStr} mode`);
  } else {
    httpServer = app.listen(port, hostname);
    logger.info(`server is started on ${hostname}:${port} in ${envStr} mode`);
  }

  return httpServer;
}

module.exports = createServer;

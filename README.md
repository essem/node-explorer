# Node Explorer

Web-based file managing application.

## Screenshot

![screenshot](/docs/screenshot.png?raw=true)

## Run

### Sample config file

config/development.json or config/production.json

```json
{
  "port": 5000,
  "auth": {
    "name": "tj",
    "pass": "tobi"
  },
  "bookmarks": [
    { "name": "Root", "dir": "/" },
    { "name": "Home", "dir": "/home" }
  ]
}
```

### To use https

Sample certificate can be made following command.

```bash
mkdir cert
cd cert
openssl req -new -x509 -nodes -out server.crt -keyout server.key
```

### Development environment

Start back-end node server.
```bash
npm run dev-back
```

Start webpack dev server to serve webpack bundle.
```bash
npm run dev-front
```

Open your browser and connect to http://localhost:5001.

### Production environment

Build bundle.
```bash
npm run build
```

Start server.
```bash
npm start
```

Open your browser and connect to http://localhost:5000.
Default username/password is tj/tobi.

### Production environment (Docker)

Build bundle.
```bash
npm run build
```

Build docker image.
```bash
sudo docker build -t node-explorer .
```

Run container.
```bash
sudo docker run --name=node-explorer -p 5000:5000 -v /media:/media -v /home:/home -d node-explorer
```

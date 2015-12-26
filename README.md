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

### Development environment

Start docker container and install node modules.
```bash
sudo docker run --name node-explorer-dev -it -v $PWD:/data -p 5000:5000 -p 5001:5001 node:4.2 bash
cd /data && npm install
exit
sudo docker start node-explorer-dev
```

Start back-end node server.
```bash
sudo docker exec -it node-explorer-dev bash -c "cd /data && npm run dev-back"
```

Start webpack dev server to serve webpack bundle.
```bash
sudo docker exec -it node-explorer-dev bash -c "cd /data && npm run dev-front"
```

Open your browser and connect to http://localhost:5000.
Default username/password is tj/tobi.

### Production environment

Build docker image.
```bash
sudo docker build -t node-explorer .
```

Run container.
```bash
sudo docker run --name=node-explorer -p 9508:5000 -v /media:/media -v /home:/home -d node-explorer
```

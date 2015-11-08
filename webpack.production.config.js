var path = require('path');

module.exports = {
  entry: "./app/client/index.js",
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: "bundle.js",
    publicPath: "/"
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: "babel", exclude: /node_modules/ },
      { test: /\.css$/, loader: "style!css", exclude: /node_modules/ },
      { test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=image/svg+xml" }
    ]
  }
};

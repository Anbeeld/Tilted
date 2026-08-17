const hostname = '127.0.0.1';
const portHttp = 8080;

import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

const rootDir = process.cwd();
const safeRoot = path.resolve(rootDir);

function sendFile(filePath, contentType, res) {
  const full = path.resolve(safeRoot, filePath);
  if (!full.startsWith(safeRoot)) {
    res.statusCode = 403;
    res.end('Forbidden.');
    return;
  }
  fs.readFile(full, function(err, data) {
    if (err) {
      res.statusCode = err.code === 'ENOENT' ? 404 : 500;
      res.end(err.code === 'ENOENT' ? 'Not found.' : 'Internal server error.');
    } else {
      res.setHeader('Content-type', contentType);
      res.writeHead(200);
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/main.css') {
    sendFile('./examples/main.css', 'text/css', res);
    return;
  } else if (req.url === '/js/tilted.js') {
    sendFile('./dist/tilted.js', 'text/javascript', res);
    return;
  } else if (req.url.startsWith('/js/') && req.url.endsWith('.js')) {
    sendFile('./examples' + req.url, 'text/javascript', res);
    return;
  } else if (req.url.startsWith('/tilted/world-map/') && req.url.endsWith('.jpg')) {
    sendFile('./' + req.url.replace('/tilted/', '/examples/'), 'image/jpeg', res);
    return;
  } else if (req.url.startsWith('/tilted/world-map/') && req.url.endsWith('.png')) {
    sendFile('./' + req.url.replace('/tilted/', '/examples/'), 'image/png', res);
    return;
  } else if (req.url === '/tile-map') {
    sendFile('./examples/tile-map.html', 'text/html', res);
    return;
  } else if (req.url === '/world-map') {
    sendFile('./examples/world-map.html', 'text/html', res);
    return;
  } else if (req.url === '/elemap') {
    sendFile('./examples/elemap.html', 'text/html', res);
    return;
  } else if (req.url === '/') {
    sendFile('./examples/index.html', 'text/html', res);
    return;
  } else {
    res.writeHead(404);
    res.end();
    return;
  }
});

server.listen(portHttp, hostname, () => {
  console.log(`Server running at http://${hostname}:${portHttp}/`);
});
const hostname = '127.0.0.1';
const portHttp = 8080;

import * as fs from 'fs';
import * as http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/main.css') {
    fs.readFile('./examples/main.css', function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'text/css');
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  } else if (req.url === '/js/tilted.js') {
    fs.readFile('./dist/tilted.js', function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'text/javascript');
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  } else if (req.url.startsWith('/js/') && req.url.endsWith('.js')) {
    fs.readFile('./examples' + req.url, function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'text/javascript');
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  } else if (req.url.startsWith('/tilted/world-map/') && req.url.endsWith('.jpg')) {
    fs.readFile('./' + req.url.replace('/tilted/', '/examples/'), function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'image/jpeg');
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  } else if (req.url.startsWith('/tilted/world-map/') && req.url.endsWith('.png')) {
    fs.readFile('./' + req.url.replace('/tilted/', '/examples/'), function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'image/png');
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  } else if (req.url === '/tile-map') {
    fs.readFile('./examples/tile-map.html', function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'text/html');
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  } else if (req.url === '/world-map') {
    fs.readFile('./examples/world-map.html', function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'text/html');
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  } else if (req.url === '/elemap') {
    fs.readFile('./examples/elemap.html', function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'text/html');
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  } else if (req.url === '/') {
    fs.readFile('./examples/index.html', function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'text/html');
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  } else {
    res.writeHead(404);
    res.end();
    return;
  }
});

server.listen(portHttp, hostname, () => {
  console.log(`Server running at https://${hostname}:${portHttp}/`);
});
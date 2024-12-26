const hostname = '127.0.0.1';
const portHttp = 8080;

import * as fs from 'fs';
import * as http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/tilted.js') {
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
  } else if (req.url === '/map.jpg') {
    fs.readFile('./example/map.jpg', function(err, data) {
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
  } else if (req.url === '/html') {
    fs.readFile('./example/html.html', function(err, data) {
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
  } else if (req.url === '/image') {
    fs.readFile('./example/image.html', function(err, data) {
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
    fs.readFile('./example/index.html', function(err, data) {
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
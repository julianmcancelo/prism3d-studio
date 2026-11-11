const http = require('http');
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\Julian\\.gemini\\antigravity\\scratch\\split3mf-mirror';
const PORT = 8080;

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  let reqPath = req.url.split('?')[0];
  if (reqPath === '' || reqPath === '/') reqPath = '/index.html';

  const localPath = path.join(baseDir, reqPath);

  // Check if direct file exists
  if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
    const ext = path.extname(localPath).toLowerCase();
    const mime = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(localPath).pipe(res);
    return;
  }

  // If request is for an asset that failed or was missed, return 404 or dummy
  if (reqPath.startsWith('/assets/') || reqPath.endsWith('.js') || reqPath.endsWith('.css') || reqPath.endsWith('.wasm')) {
    // If it's a language file, fallback to es or en
    if (reqPath.includes('lang-')) {
      const fallback = path.join(baseDir, 'assets', 'lang-es-69e092a2e5.js');
      if (fs.existsSync(fallback)) {
        res.writeHead(200, { 'Content-Type': 'application/javascript; charset=UTF-8' });
        fs.createReadStream(fallback).pipe(res);
        return;
      }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  // Otherwise, route through index.html (SPA)
  const indexPath = path.join(baseDir, 'index.html');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
  fs.createReadStream(indexPath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

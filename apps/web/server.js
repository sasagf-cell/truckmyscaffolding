import { createServer } from 'http';
import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

console.log(`=== SERVER STARTUP ===`);
console.log(`NODE_VERSION: ${process.version}`);
console.log(`PORT: ${PORT}`);
console.log(`__dirname: ${__dirname}`);
console.log(`DIST: ${DIST}`);
console.log(`DIST exists: ${existsSync(DIST)}`);
try {
  if (existsSync(DIST)) {
    console.log(`DIST contents: ${readdirSync(DIST).slice(0, 5).join(', ')}`);
    const idx = join(DIST, 'index.html');
    console.log(`index.html exists: ${existsSync(idx)}`);
  }
} catch (e) {
  console.error('Startup check error:', e.message);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

createServer((req, res) => {
  try {
    const url = req.url.split('?')[0];
    let filePath = join(DIST, url);

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(DIST, 'index.html');
    }

    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404: dist/index.html not found. DIST=${DIST}`);
      return;
    }

    const ext = extname(filePath);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', ext === '.html' ? 'no-cache' : 'public, max-age=31536000');
    res.end(readFileSync(filePath));
  } catch (err) {
    console.error('Request error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`500: ${err.message}`);
  }
}).listen(PORT, '0.0.0.0', () => console.log(`Static server on port ${PORT}`));

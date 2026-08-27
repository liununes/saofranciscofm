import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(__dirname, 'dist');
const port = Number(process.env.PORT || 80);
const defaultStreamUrl = process.env.STREAM_SOURCE_URL || 'https://stm28.srvaudio.com.br:10884/';
const allowedHosts = new Set(
  (process.env.STREAM_ALLOWED_HOSTS || new URL(defaultStreamUrl).hostname)
    .split(',')
    .map(host => host.trim().toLowerCase())
    .filter(Boolean)
);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function getStreamSource(requestUrl) {
  const query = new URL(requestUrl, 'http://localhost').searchParams.get('url');
  const source = query || defaultStreamUrl;
  const parsed = new URL(source);
  if (!['http:', 'https:'].includes(parsed.protocol) || !allowedHosts.has(parsed.hostname.toLowerCase())) {
    throw new Error('Stream host is not allowed');
  }
  return parsed.toString();
}

function setCors(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
}

const activeTranscoders = new Map();

function startTranscoder(source) {
  const existing = activeTranscoders.get(source);
  if (existing) return existing;

  const clients = new Set();
  const ffmpeg = spawn('ffmpeg', [
    '-hide_banner',
    '-loglevel', 'error',
    '-reconnect', '1',
    '-reconnect_streamed', '1',
    '-reconnect_delay_max', '5',
    '-i', source,
    '-vn',
    '-c:a', 'libmp3lame',
    '-b:a', '128k',
    '-f', 'mp3',
    'pipe:1',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  const transcoder = { ffmpeg, clients };
  activeTranscoders.set(source, transcoder);

  ffmpeg.stdout.on('data', chunk => {
    for (const response of clients) response.write(chunk);
  });

  ffmpeg.stderr.on('data', chunk => {
    console.error(`[stream-relay] ${chunk.toString().trim()}`);
  });

  const cleanup = () => {
    activeTranscoders.delete(source);
    for (const response of clients) response.end();
    clients.clear();
  };
  ffmpeg.on('close', cleanup);
  ffmpeg.on('error', error => console.error('[stream-relay] ffmpeg error:', error));

  return transcoder;
}

function serveStream(request, response) {
  let source;
  try {
    source = getStreamSource(request.url);
  } catch {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Stream source is not allowed.');
    return;
  }

  const transcoder = startTranscoder(source);
  transcoder.clients.add(response);
  setCors(response);
  response.writeHead(200, {
    'Content-Type': 'audio/mpeg',
    'Transfer-Encoding': 'chunked',
    Connection: 'keep-alive',
  });

  const removeClient = () => {
    transcoder.clients.delete(response);
    if (transcoder.clients.size === 0 && activeTranscoders.get(source) === transcoder) {
      transcoder.ffmpeg.kill('SIGTERM');
    }
  };
  request.on('close', removeClient);
  response.on('error', removeClient);
}

function serveStatic(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidate = normalize(join(publicDir, relativePath));
  const safePath = candidate === publicDir || candidate.startsWith(publicDir + sep);
  const filePath = safePath && existsSync(candidate) && statSync(candidate).isFile() ? candidate : join(publicDir, 'index.html');

  response.setHeader('Content-Type', mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream');
  if (request.method === 'HEAD') {
    response.writeHead(200);
    response.end();
    return;
  }
  createReadStream(filePath).on('error', () => {
    response.writeHead(500);
    response.end('Internal server error');
  }).pipe(response);
}

createServer((request, response) => {
  if (request.url?.startsWith('/stream.mp3')) {
    serveStream(request, response);
    return;
  }
  serveStatic(request, response);
}).listen(port, '0.0.0.0', () => {
  console.log(`São Francisco FM server listening on port ${port}`);
});

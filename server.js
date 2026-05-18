const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const { exec } = require('node:child_process')

const PORT = 3030
const DIST = path.join(__dirname, 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
}

http.createServer((req, res) => {
  const url = req.url.split('?')[0]
  let filePath = path.join(DIST, url === '/' ? 'index.html' : url)

  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST, 'index.html')
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return }
    const mime = MIME[path.extname(filePath)] ?? 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime })
    res.end(data)
  })
}).listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`
  console.log(`Gerador de Carteirinha: ${url}`)
  exec(`start ${url}`)
})

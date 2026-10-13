import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// The hub serves its own page at the root and each volume's dist folder under its path.
// Set BIBLE_DIST, BOM_DIST, or DC_DIST to use a folder that is not a sibling of this one.
const sibling = name => fileURLToPath(new URL(`../../${name}/dist/`, import.meta.url));
const mounts = {
  '/bible/': process.env.BIBLE_DIST || sibling('Bible Wayfinder'),
  '/book-of-mormon/': process.env.BOM_DIST || sibling('Book of Mormon Wayfinder'),
  '/doctrine-and-covenants/': process.env.DC_DIST || sibling('D&C Wayfinder'),
  '/': fileURLToPath(new URL('../dist/', import.meta.url)),
};
const port = Number(process.env.PORT || 4170);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.geojson':'application/geo+json', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/vnd.microsoft.icon', '.woff2':'font/woff2', '.txt':'text/plain; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (mounts[pathname + '/']) { res.writeHead(302, { Location: pathname + '/' }); return res.end(); }
    const mount = Object.keys(mounts).find(prefix => pathname.startsWith(prefix));
    const root = resolve(mounts[mount]);
    const rest = pathname.slice(mount.length);
    const target = resolve(root, './' + (rest === '' || rest.endsWith('/') ? rest + 'index.html' : rest));
    if (!target.startsWith(root + sep)) { res.writeHead(403); return res.end('Forbidden'); }
    if (!(await stat(target)).isFile()) throw new Error('Not a file');
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not found'); }
});
server.on('error', error => { console.error(error.message); process.exit(1); });
server.listen(port, '127.0.0.1', () => console.log(`Wayfinder is ready at http://127.0.0.1:${port}`));

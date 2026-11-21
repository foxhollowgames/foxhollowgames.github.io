import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const sibling = name => fileURLToPath(new URL(`../../${name}/dist/`, import.meta.url));
const targets = [
  join(root, 'dist'),
  process.env.BIBLE_DIST || sibling('Bible Wayfinder'),
  process.env.BOM_DIST || sibling('Book of Mormon Wayfinder'),
  process.env.DC_DIST || sibling('D&C Wayfinder'),
  process.env.TIMELINE_DIST || sibling('timeline'),
];
const source = await readFile(join(root, 'viewer/analytics.js'), 'utf8');
const check = process.argv.includes('--check');
let stale = 0;
async function update(path, text) {
  let current; try { current = await readFile(path, 'utf8'); } catch {}
  if (current === text) return;
  stale++;
  if (check) console.error('Stale analytics: ' + path);
  else await writeFile(path, text);
}
async function pages(dir, dist) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) { if (!['assets', 'vendor', 'data', 'tiles'].includes(item.name)) await pages(path, dist); continue; }
    if (!item.name.endsWith('.html')) continue;
    // Write only persistent templates. Existing generators produce the named book pages.
    if (!check && !['index.html', 'book.html'].includes(item.name)) continue;
    const current = await readFile(path, 'utf8');
    if (!/<\/head>/i.test(current) || /http-equiv=["']refresh/i.test(current)) continue;
    const src = relative(dir, join(dist, 'analytics.js')).replaceAll('\\', '/');
    const tag = `<script defer src="${src}?v=20261120.2"></script>`;
    const next = /<script\b[^>]*src=["'][^"']*analytics\.js[^"']*["'][^>]*><\/script>/.test(current)
      ? current.replace(/<script\b[^>]*src=["'][^"']*analytics\.js[^"']*["'][^>]*><\/script>/g, tag)
      : current.replace(/<\/head>/i, tag + '</head>');
    await update(path, next);
  }
}
for (const dist of targets) { await update(join(dist, 'analytics.js'), source); await pages(dist, dist); }
if (check && stale) process.exit(1);
console.log(check ? 'All analytics copies and page loaders match.' : `Synchronized analytics (${stale} changed files).`);

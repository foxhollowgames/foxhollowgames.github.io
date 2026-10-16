import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The volumes share one reader. Its files live in viewer/. This script copies them into each volume's dist folder.
// Each copy starts with a stamp line. The stamp holds a hash of the copy, so the script finds a copy that someone edited in place.
// Run `npm run sync-viewer` to copy. Run `npm run sync-viewer -- --check` to report stale or edited copies without a change.
// Set BIBLE_DIST, BOM_DIST, or DC_DIST to use a folder that is not a sibling of this one.
const viewer = fileURLToPath(new URL('../viewer/', import.meta.url));
const sibling = name => fileURLToPath(new URL(`../../${name}/dist/`, import.meta.url));
const shell = ['breadcrumbs.js', 'breadcrumbs.css', 'chapter-picker.js', 'modal-drag.js', 'settings-menu.js'];
const reader = [...shell, 'app.js', 'styles.css', 'chapter-map.js', 'native-book.js', 'portraits.js'];
// The Book of Mormon has its own reader for its flat map. It takes the shared shell files only.
const volumes = [
  { name: 'Bible', dist: process.env.BIBLE_DIST || sibling('Bible Wayfinder'), files: reader },
  { name: 'Doctrine and Covenants', dist: process.env.DC_DIST || sibling('D&C Wayfinder'), files: reader },
  { name: 'Book of Mormon', dist: process.env.BOM_DIST || sibling('Book of Mormon Wayfinder'), files: shell },
];
const checkOnly = process.argv.includes('--check');

const hash = text => createHash('sha256').update(text).digest('hex').slice(0, 12);
const stampFor = (file, body) => {
  const note = `Shared Wayfinder viewer file. Edit Wayfinder/viewer/${file}, then run npm run sync-viewer. Hash ${hash(body)}.`;
  return file.endsWith('.css') ? `/* ${note} */` : `// ${note}`;
};
const stampPattern = /^(?:\/\/|\/\*) Shared Wayfinder viewer file\. .* Hash ([0-9a-f]{12})\.(?: \*\/)?\n/;
const readText = async path => { try { return (await readFile(path, 'utf8')).replace(/\r\n/g, '\n'); } catch { return null; } };

// The release version in viewer/app.js is the cache key for every shared file.
const version = (await readFile(join(viewer, 'app.js'), 'utf8')).match(/const releaseVersion = '([\d.]+)'/)[1];
const versioned = files => new RegExp(`((?:^|[/'"(])(?:${files.map(f => f.replace(/[.]/g, '\\.')).join('|')}))\\?v=[\\d.]+`, 'gm');
const problems = [], changes = [];

for (const volume of volumes) {
  const pending = [];
  for (const file of volume.files) {
    const body = (await readFile(join(viewer, file), 'utf8')).replace(/\r\n/g, '\n').replace(versioned(reader), `$1?v=${version}`);
    const next = `${stampFor(file, body)}\n${body}`;
    const path = join(volume.dist, file), current = await readText(path);
    if (current === next) continue;
    const stamp = current?.match(stampPattern);
    if (stamp && hash(current.slice(stamp[0].length)) !== stamp[1]) {
      problems.push(`${volume.name}: dist/${file} was edited in place. Move the edit into viewer/${file}, then run the sync again.`);
      continue;
    }
    pending.push({ path, next, label: `${volume.name}: dist/${file}` });
  }
  // Pages and the volume's own scripts load the shared files with ?v=<version>. Point them at this release.
  const pattern = versioned(volume.files);
  for (const entry of await readdir(volume.dist, { withFileTypes: true })) {
    if (!entry.isFile() || !/\.(html|js)$/.test(entry.name) || volume.files.includes(entry.name)) continue;
    const path = join(volume.dist, entry.name), current = await readFile(path, 'utf8');
    const next = current.replace(pattern, `$1?v=${version}`);
    if (next !== current) pending.push({ path, next, label: `${volume.name}: dist/${entry.name} (cache version)` });
  }
  for (const item of pending) {
    changes.push(item.label);
    if (!checkOnly) await writeFile(item.path, item.next);
  }
}

for (const line of changes) console.log(`${checkOnly ? 'Stale' : 'Updated'} ${line}`);
for (const line of problems) console.error(line);
if (!changes.length && !problems.length) console.log(`Every volume has viewer ${version}.`);
if (problems.length || (checkOnly && changes.length)) process.exit(1);

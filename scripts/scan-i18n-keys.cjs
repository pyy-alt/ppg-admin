const fs = require('fs');
const path = require('path');
const glob = require('glob');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const localesDir = path.join(src, 'locales');
const enPath = path.join(localesDir, 'en.json');

function readJSON(p) {
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function flatten(obj, prefix = '') {
  const res = {};
  for (const k of Object.keys(obj || {})) {
    const v = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(res, flatten(v, key));
    } else {
      res[key] = v;
    }
  }
  return res;
}

function unflatten(flat) {
  const res = {};
  for (const k of Object.keys(flat)) {
    const parts = k.split('.');
    let cur = res;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) cur[p] = flat[k];
      else cur[p] = cur[p] || {};
      cur = cur[p];
    }
  }
  return res;
}

// Glob files to scan
const patterns = [
  'src/**/*.{ts,tsx,js,jsx}',
  '!src/**/*.d.ts',
  '!src/js/**',
  '!src/assets/**',
  '!src/**/routeTree.gen.*',
];

const files = patterns.flatMap((p) => glob.sync(p, { nodir: true, absolute: true }));

const keyRegex = /(?:\b(?:i18n\.t|t)\s*\(\s*)(?:['`\"])([^'`\"]+)(?:['`\"])/g;

const found = new Set();

for (const f of files) {
  try {
    const content = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = keyRegex.exec(content))) {
      found.add(m[1]);
    }
  } catch (e) {
    // ignore unreadable files
  }
}

const existing = readJSON(enPath);
const flatExisting = flatten(existing);

let added = 0;
for (const k of Array.from(found)) {
  if (!(k in flatExisting)) {
    flatExisting[k] = k; // default English value = key
    added++;
  }
}

const merged = unflatten(flatExisting);
writeJSON(enPath, merged);

console.log(`Scanned ${files.length} files, found ${found.size} keys, added ${added} new keys to ${enPath}`);

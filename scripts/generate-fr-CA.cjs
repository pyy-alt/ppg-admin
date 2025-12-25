const fs = require('fs');
const path = require('path');

const enPath = path.resolve(__dirname, '../src/locales/en.json');
const frCaPath = path.resolve(__dirname, '../src/locales/fr-CA.json');

function emptyValues(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(emptyValues);
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    out[k] = typeof v === 'object' && v !== null ? emptyValues(v) : '';
  }
  return out;
}

if (!fs.existsSync(enPath)) {
  console.error('en.json not found:', enPath);
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function mergeWithExisting(template, existing) {
  if (typeof template !== 'object' || template === null) return template;
  if (Array.isArray(template)) return template.map(() => '');

  const out = {};
  for (const k of Object.keys(template)) {
    const tv = template[k];
    const ev = existing && typeof existing === 'object' ? existing[k] : undefined;
    if (tv && typeof tv === 'object' && !Array.isArray(tv)) {
      out[k] = mergeWithExisting(tv, ev || {});
    } else {
      out[k] = typeof ev === 'string' && ev.trim() !== '' ? ev : '';
    }
  }

  // preserve extra existing keys
  if (existing && typeof existing === 'object') {
    for (const k of Object.keys(existing)) {
      if (!(k in out)) out[k] = existing[k];
    }
  }

  return out;
}

const existing = fs.existsSync(frCaPath) ? JSON.parse(fs.readFileSync(frCaPath, 'utf8')) : {};
const template = emptyValues(en);
const merged = mergeWithExisting(template, existing);

fs.writeFileSync(frCaPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
console.log('Merged/updated fr-CA.json at', frCaPath);

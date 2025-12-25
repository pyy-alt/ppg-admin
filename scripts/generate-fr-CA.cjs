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
const fr = emptyValues(en);

fs.writeFileSync(frCaPath, JSON.stringify(fr, null, 2) + '\n', 'utf8');
console.log('Generated/updated fr-CA.json at', frCaPath);

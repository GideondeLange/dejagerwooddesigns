/* One-shot: walk every HTML file and inject width/height attributes
   into <img> tags pointing at /assets/images/bq/* so the browser
   reserves correct space before pixels arrive. Kills CLS / reflow.

   Run with: node scripts/add-img-dims.cjs
*/
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'public', 'assets', 'images', 'bq');
const ROOT    = path.join(__dirname, '..');

function readJpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) return null;
    const m = buf[i + 1];
    i += 2;
    if (m === 0xC0 || m === 0xC2) {
      const h = buf.readUInt16BE(i + 3);
      const w = buf.readUInt16BE(i + 5);
      return { w, h };
    }
    const len = buf.readUInt16BE(i);
    i += len;
  }
  return null;
}

const dims = {};
for (const f of fs.readdirSync(IMG_DIR)) {
  const size = readJpegSize(fs.readFileSync(path.join(IMG_DIR, f)));
  if (size) dims[f] = size;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const IMG_TAG_RE = /<img\b([^>]*?)\/?>/gi;
const SRC_RE     = /src=["']\/assets\/images\/bq\/([^"']+)["']/i;
const HAS_W_RE   = /\bwidth\s*=/i;
const HAS_H_RE   = /\bheight\s*=/i;

let totalEdits = 0;

for (const file of walk(ROOT)) {
  const orig = fs.readFileSync(file, 'utf8');
  let edits = 0;
  const next = orig.replace(IMG_TAG_RE, (full, attrs) => {
    const m = attrs.match(SRC_RE);
    if (!m) return full;
    const fname = m[1];
    const d = dims[fname];
    if (!d) return full;
    if (HAS_W_RE.test(attrs) && HAS_H_RE.test(attrs)) return full;
    edits++;
    const insert = ` width="${d.w}" height="${d.h}"`;
    return `<img${attrs}${insert}>`;
  });
  if (edits) {
    fs.writeFileSync(file, next);
    totalEdits += edits;
    console.log(`${path.relative(ROOT, file)}: +${edits}`);
  }
}
console.log(`\nDone. Added dimensions to ${totalEdits} <img> tags.`);

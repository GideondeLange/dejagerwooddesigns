/* One-shot: fix image-loading glitch by switching gallery images
   from lazy → eager and injecting <link rel="preload"|"prefetch">
   tags into the home page <head> so gallery images are warm in
   browser cache before the user clicks through.

   Run with: node scripts/fix-image-loading.cjs
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* ── Pages where every <img> on the page should load eagerly ─── */
const EAGER_PAGES = new Set([
  path.join(ROOT, 'gallery', 'index.html'),
]);

/* ── On home page, eager-load only the gallery preview imgs.
      Identified by their src pattern + being inside .gallery-home. ─ */
const HOME = path.join(ROOT, 'index.html');

function flipLazyToEager(filePath) {
  const before = fs.readFileSync(filePath, 'utf8');
  const after  = before.replace(/loading="lazy"/g, 'loading="eager"');
  if (after === before) return 0;
  fs.writeFileSync(filePath, after);
  const count = (before.match(/loading="lazy"/g) || []).length;
  return count;
}

/* On home page, only flip lazy → eager for the gallery-home block.
   Pattern: between <section class="gallery-home"...> and the next </section> */
function flipHomeGalleryPreview() {
  const before = fs.readFileSync(HOME, 'utf8');
  const sectionMatch = before.match(/<section class="gallery-home[^>]*>[\s\S]*?<\/section>/);
  if (!sectionMatch) return 0;
  const orig = sectionMatch[0];
  const fixed = orig.replace(/loading="lazy"/g, 'loading="eager"');
  if (fixed === orig) return 0;
  fs.writeFileSync(HOME, before.replace(orig, fixed));
  return (orig.match(/loading="lazy"/g) || []).length;
}

/* Inject preload/prefetch links into home <head>. First 6 gallery
   images preload (high priority — likely above fold on /gallery/);
   remaining images prefetch (idle priority). Idempotent: marker
   comment ensures we don't double-inject on re-run. */
function injectPreloadLinks() {
  const MARKER = '<!-- gallery-preload-injected -->';
  const html = fs.readFileSync(HOME, 'utf8');
  if (html.includes(MARKER)) {
    console.log('  (preload links already present — skipping)');
    return 0;
  }

  // Discover all bq-* images that exist on disk
  const imgDir = path.join(ROOT, 'public', 'assets', 'images', 'bq');
  const all = fs.readdirSync(imgDir)
    .filter(f => /^bq-\d+\.jpe?g$/i.test(f))
    .sort();

  const PRELOAD_COUNT = 6;
  const preload  = all.slice(0, PRELOAD_COUNT);
  const prefetch = all.slice(PRELOAD_COUNT);

  const lines = [
    `  ${MARKER}`,
    `  <!-- Preload first ${PRELOAD_COUNT} gallery images: warm cache for instant gallery render -->`,
    ...preload.map(f =>
      `  <link rel="preload" as="image" href="/assets/images/bq/${f}" fetchpriority="low" />`
    ),
    `  <!-- Prefetch remaining gallery images during idle time -->`,
    ...prefetch.map(f =>
      `  <link rel="prefetch" as="image" href="/assets/images/bq/${f}" />`
    ),
  ];
  const block = lines.join('\n') + '\n';

  // Insert just before </head>
  const next = html.replace(/<\/head>/, block + '</head>');
  fs.writeFileSync(HOME, next);
  return preload.length + prefetch.length;
}

let total = 0;

console.log('Flipping lazy → eager on full-eager pages:');
for (const p of EAGER_PAGES) {
  const n = flipLazyToEager(p);
  console.log(`  ${path.relative(ROOT, p)}: ${n} replaced`);
  total += n;
}

console.log('\nFlipping lazy → eager in home gallery preview only:');
const hn = flipHomeGalleryPreview();
console.log(`  index.html (gallery-home section): ${hn} replaced`);
total += hn;

console.log('\nInjecting <link rel="preload|prefetch"> into index.html <head>:');
const injected = injectPreloadLinks();
console.log(`  Added ${injected} preload/prefetch links`);

console.log(`\nDone. ${total} loading attrs flipped, ${injected} preload links added.`);

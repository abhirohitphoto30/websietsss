// build.js — pages/ folder ko scan karke dist/ banata hai (koi npm package nahi chahiye)
// Chalane ke liye:  node build.js
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PAGES_DIR = path.join(ROOT, 'pages');
const DIST = path.join(ROOT, 'dist');
const TEMPLATE = path.join(ROOT, 'src', 'index.template.html');

// ---- settings (site.config.json se) ----
let config = { siteTitle: 'For Sania', defaultPage: 'latest', defaultYear: null };
try {
  config = { ...config, ...JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8')) };
} catch (e) { /* config optional hai */ }

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const MONTH_LABEL = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const fallbackYear = Number(config.defaultYear) || new Date().getFullYear();

// Filename se date nikalta hai. Ye sab formats chalenge:
//   14-09-2026.html      (DD-MM-YYYY)
//   2026-09-14.html      (YYYY-MM-DD)
//   25 sept.html         (DD month, saal na ho to defaultYear/is saal)
//   7-oct-2026.html, 07_Oct.html, 14-09-2026_extra.html
function parseDate(file) {
  const base = file.replace(/\.html?$/i, '').trim();
  let m;
  if ((m = base.match(/^(\d{4})[-_.](\d{1,2})[-_.](\d{1,2})/))) {
    return mk(+m[1], +m[2], +m[3]);
  }
  if ((m = base.match(/^(\d{1,2})[-_.](\d{1,2})[-_.](\d{4})/))) {
    return mk(+m[3], +m[2], +m[1]);
  }
  if ((m = base.match(/^(\d{1,2})[\s_.-]*([a-zA-Z]{3,})[\s_.-]*(\d{4})?/))) {
    const mi = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase());
    if (mi >= 0) return mk(m[3] ? +m[3] : fallbackYear, mi + 1, +m[1]);
  }
  return null;
}
function mk(y, mo, d) {
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return { y, mo, d, key: y * 10000 + mo * 100 + d };
}
const pad = n => String(n).padStart(2, '0');
const slug = s => s.toLowerCase().replace(/\.html?$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ---- pages/ scan ----
if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true });
const files = fs.readdirSync(PAGES_DIR)
  .filter(f => /\.html?$/i.test(f) && !f.startsWith('_') && !f.startsWith('.'));

const items = files.map(f => ({ file: f, date: parseDate(f) }));
const dated = items.filter(i => i.date).sort((a, b) => a.date.key - b.date.key || a.file.localeCompare(b.file));
const undated = items.filter(i => !i.date).sort((a, b) => a.file.localeCompare(b.file));
const ordered = [...dated, ...undated];

const years = new Set(dated.map(i => i.date.y));
const dupCount = {};
const used = new Set();
const pages = ordered.map(i => {
  let id = slug(i.file) || 'page';
  while (used.has(id)) id += '-x';
  used.add(id);

  let label;
  if (i.date) {
    label = `${pad(i.date.d)} ${MONTH_LABEL[i.date.mo - 1]}`;
    if (years.size > 1) label += ` ${String(i.date.y).slice(2)}`;
    dupCount[label] = (dupCount[label] || 0) + 1;
    if (dupCount[label] > 1) label += ` · ${dupCount[label]}`;
  } else {
    label = i.file.replace(/\.html?$/i, '').toUpperCase();
    console.warn(`⚠  "${i.file}" ka date samajh nahi aaya — label "${label}" rakha hai, list ke end me dikhega.`);
  }
  return { id, label, src: `pages/${id}.html`, date: i.date ? `${i.date.y}-${pad(i.date.mo)}-${pad(i.date.d)}` : null, _file: i.file };
});

// ---- dist/ banao ----
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'pages'), { recursive: true });
for (const p of pages) fs.copyFileSync(path.join(PAGES_DIR, p._file), path.join(DIST, p.src));

const publicManifest = pages.map(({ _file, ...rest }) => rest);
const safeJson = JSON.stringify({ title: config.siteTitle, defaultPage: config.defaultPage, pages: publicManifest })
  .replace(/</g, '\\u003c');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

let html = fs.readFileSync(TEMPLATE, 'utf8');
html = html.replace('/*__SITE_DATA__*/', `window.SITE = ${safeJson};`).replace(/__SITE_TITLE__/g, esc(config.siteTitle));
fs.writeFileSync(path.join(DIST, 'index.html'), html);

console.log(`✔ ${pages.length} page(s) ready:`);
pages.forEach(p => console.log(`   ${p.label.padEnd(10)} ← pages/${p._file}`));

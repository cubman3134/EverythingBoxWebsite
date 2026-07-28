// Post-build link check.
//
// Internal links MUST resolve to a built file — a broken one fails the gate. External
// links are checked for reachability but only warn: the network is not this repo's
// responsibility, and a flaky third-party host should not block a deploy.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

function htmlFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = htmlFiles(DIST);
const internal = new Map(); // href -> the page that referenced it
const external = new Set();

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)/g)) {
    const href = m[1];
    if (href.startsWith('http')) external.add(href);
    else if (href.startsWith('/') && !internal.has(href)) internal.set(href, f);
  }
}

let broken = 0;
for (const [href, from] of internal) {
  const clean = href.replace(/\/$/, '');
  const candidates = [
    join(DIST, clean, 'index.html'),
    join(DIST, clean),
    join(DIST, `${clean}.html`),
  ];
  if (!candidates.some(existsSync)) {
    console.error(`BROKEN internal link: ${href}  (referenced by ${from})`);
    broken++;
  }
}

console.log(`checked ${internal.size} internal links across ${files.length} pages`);

let warned = 0;
await Promise.all(
  [...external].map(async (url) => {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (!res.ok) {
        console.warn(`WARN external ${res.status}: ${url}`);
        warned++;
      }
    } catch (err) {
      console.warn(`WARN external unreachable: ${url} (${err.message})`);
      warned++;
    }
  }),
);
console.log(`checked ${external.size} external links (${warned} warning(s))`);

if (broken > 0) {
  console.error(`\n${broken} broken internal link(s)`);
  process.exit(1);
}
console.log('links ok');

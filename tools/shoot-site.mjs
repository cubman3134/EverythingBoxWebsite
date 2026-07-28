// Render the running site to PNGs, for review and for sharing what it looks like.
//
//   npm run dev            # in another shell
//   node tools/shoot-site.mjs [--mobile]
//
// Output lands in .site-shots/ (gitignored) — these are pictures of the website, not
// content the site ships.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.SITE_BASE ?? 'http://localhost:4321';
const OUT = '.site-shots';
const mobile = process.argv.includes('--mobile');

const PAGES = [
  ['home', '/'],
  ['features', '/features'],
  ['download', '/download'],
  ['emulation', '/emulation'],
  ['addons', '/addons'],
  ['screenshots', '/screenshots'],
  ['docs', '/docs'],
  ['docs-troubleshooting', '/docs/troubleshooting'],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

for (const [name, path] of PAGES) {
  const res = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  if (!res || !res.ok()) throw new Error(`${path} returned ${res?.status()}`);
  // Let lazy images below the fold decode before a full-page capture.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  const suffix = mobile ? '-mobile' : '';
  await page.screenshot({ path: `${OUT}/${name}${suffix}-fold.png` });
  await page.screenshot({ path: `${OUT}/${name}${suffix}-full.png`, fullPage: true });
  console.log(`${name}${suffix}`);
}

await browser.close();
console.log(`\nwrote ${PAGES.length * 2} images to ${OUT}/`);

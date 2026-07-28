// Render the Open Graph card to public/og.png (1200x630).
//
//   node tools/make-og.mjs
//
// Built with Playwright rather than composited with sharp so the card uses the same
// fonts, colours and gradient treatment as the site itself — text baked into an image
// by hand drifts from the design the moment the design changes.
//
// The output is COMMITTED: social crawlers fetch it from the deployed site, so it has to
// exist in the build without needing a browser at deploy time.
import { readFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const SHOT = 'src/assets/shots/movies-browse.png';
const OUT = 'public/og.png';

const shotDataUri = `data:image/png;base64,${readFileSync(SHOT).toString('base64')}`;

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: #0d1424; color: #f6f1e4;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  }
  .glow {
    position: absolute; left: 50%; top: -260px; transform: translateX(-50%);
    width: 1100px; height: 620px;
    background: radial-gradient(ellipse at center, rgba(232,177,58,.34), rgba(232,177,58,0) 68%);
  }
  .wrap { position: relative; padding: 62px 64px 0; }
  .brand { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 800; }
  .brand img { width: 40px; height: 40px; }
  h1 {
    margin-top: 30px; font-size: 82px; line-height: 1.02;
    letter-spacing: -0.035em; font-weight: 800;
  }
  h1 span { color: #e8b13a; }
  /* Text is capped short of the artwork's left edge (~750px) so nothing ever runs
     underneath it — the card has no reflow to save it if a string grows. */
  p { margin-top: 20px; font-size: 27px; color: #a9b3c9; max-width: 620px; line-height: 1.4; }
  .shot {
    position: absolute; right: -110px; bottom: -50px; width: 560px;
    border: 1px solid #2c3856; border-radius: 14px; overflow: hidden;
    box-shadow: 0 30px 80px rgba(0,0,0,.55); transform: rotate(-5deg);
  }
  .shot img { width: 100%; display: block; }
  .foot {
    position: absolute; left: 64px; bottom: 52px;
    font-size: 21px; color: #a9b3c9; letter-spacing: .01em;
  }
</style></head>
<body>
  <div class="glow"></div>
  <div class="shot"><img src="${shotDataUri}"></div>
  <div class="wrap">
    <div class="brand">EverythingBox</div>
    <h1>Every screen.<br><span>One box.</span></h1>
    <p>Films, shows, music, games, comics and books — one native app.</p>
  </div>
  <div class="foot">Windows · macOS · Linux · Android TV · iOS · Free and open source</div>
</body></html>`;

mkdirSync('public', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.waitForTimeout(400);
await page.screenshot({ path: OUT });
await browser.close();

console.log(`wrote ${OUT} (1200x630)`);

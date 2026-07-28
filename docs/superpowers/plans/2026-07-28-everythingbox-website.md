# EverythingBox Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a seven-page static showcase website for the EverythingBox media-hub app, anchored by real screenshots captured from the running application.

**Architecture:** Astro 5 with static output. Page content is rendered from typed data modules in `src/data/` (features, platforms, systems, emulators, themes, screenshots) and an MDX content collection for `/docs`, so pages stay thin and the long lists have exactly one source of truth. Download links are resolved at build time from the GitHub Releases API with a committed fallback, so the build never depends on network access and links survive the app's in-flight `MyMediaVault` → `EverythingBox` asset rename. Client JavaScript is limited to five small vanilla islands.

**Tech Stack:** Astro 5, Tailwind CSS v4 (via `@tailwindcss/vite`), MDX, `sharp` for image and animation processing, Vitest for tests, Python 3 for the screenshot capture harness.

## Global Constraints

These apply to every task. Values are copied verbatim from `docs/superpowers/specs/2026-07-28-everythingbox-website-design.md`.

- **Product name is `EverythingBox`.** The string `MyMediaVault` and `My Media Vault` must never appear in site copy. They may appear only inside release-asset filenames returned by the GitHub API at build time.
- **Colour tokens:** base `#0d1424`, surface `#131c33`, accent `#e8b13a`, text `#f6f1e4`, muted `#a9b3c9`, border `#2c3856`.
- **Dark-only.** No light mode in v1.
- **No framework runtime in the browser.** Client JS is limited to five vanilla islands: gallery lightbox, gallery filter, mobile nav, hero playback control, hero platform detection.
- **Accuracy rule.** Every factual claim traces to the app repo at `C:\Users\cubma\Project Goliath`. Casting (Chromecast/DLNA) and LAN netplay are built but **unverified on hardware**: they are either omitted or explicitly labelled unverified. Never state that they work.
- **Framing rule.** The addon system is presented as extensibility. The site states that the project ships the engine and not the sources. No indexer, tracker, or debrid provider is named as a selling point.
- **Privacy gate.** `C:\EverythingBox-app\everythingbox.ini` holds live API keys and OAuth tokens. Nothing from it may enter this repo. Every screenshot is reviewed for personal library paths, filenames, and account names before commit.
- **Verified content counts:** 63 game systems, 16 of them backed by standalone emulators, 15 standalone emulators, 6 bundled themes (Default, Grid, Lumen, Midnight, Channels, Triple), 5 download platforms.
- **Node 24 / npm 11** are installed. `ffmpeg` is **not** installed and must not be assumed.

---

## File Structure

| Path | Responsibility |
|---|---|
| `astro.config.mjs` | Astro + Tailwind v4 + MDX wiring; `site` configurable, no host adapter. |
| `src/styles/global.css` | Tailwind import and the design tokens as CSS custom properties. |
| `src/layouts/Base.astro` | `<head>`, fonts, nav, footer. Every page wraps in this. |
| `src/layouts/Doc.astro` | Wraps `Base`; adds docs sidebar and prose styles. |
| `src/components/Glow.astro` | The gold radial motif. Isolated so its usage stays countable. |
| `src/components/Hero.astro` | Hero loop, headline, CTA. |
| `src/components/FeatureBlock.astro` | One screenshot-anchored feature section. |
| `src/components/PlatformCard.astro` | One download card. |
| `src/components/SystemsTable.astro` | Renders `systems.ts`. |
| `src/components/Gallery.astro` | Screenshot grid + filter. |
| `src/components/Lightbox.astro` | Fullscreen image viewer. |
| `src/components/Shot.astro` | A bordered screenshot with `<Image>` behind it. Used everywhere a capture appears. |
| `src/data/types.ts` | Shared TypeScript types for every data module. |
| `src/data/systems.ts` | 63 systems. **Generated** by `tools/gen-catalog.mjs`. |
| `src/data/emulators.ts` | 15 standalone emulators. **Generated** by `tools/gen-catalog.mjs`. |
| `src/data/features.ts` | Hand-authored feature inventory. |
| `src/data/platforms.ts` | Hand-authored platform definitions + asset matchers. |
| `src/data/themes.ts` | The 6 bundled themes. |
| `src/data/screenshots.ts` | Capture manifest: id, file, caption, theme, category. |
| `src/data/release.fallback.json` | Committed snapshot of the resolved release. |
| `src/lib/release.ts` | Build-time release resolution + platform asset matching. |
| `src/lib/shots.ts` | Loads capture images and fails the build on a missing file. |
| `src/content/docs/*.mdx` | Docs pages. |
| `src/content.config.ts` | Content collection schema. |
| `tools/gen-catalog.mjs` | Parses the app repo's C++ headers → `systems.ts` / `emulators.ts`. |
| `tools/capture.py` | Drives the running app over its uitest channel to produce screenshots. |
| `tools/make-hero-loop.mjs` | Frame sequence → animated WebP via sharp. |
| `tools/check-links.mjs` | Post-build link checker. |
| `tests/*.test.ts` | Vitest suites. |

---

## Task 1: Scaffold, tokens, and the site shell

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Glow.astro`, `src/pages/index.astro`
- Test: `tests/shell.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `Base.astro` with props `{ title: string; description: string; wide?: boolean }`. `Glow.astro` with props `{ className?: string }`.

- [ ] **Step 1: Scaffold the Astro project**

Run in `C:\Users\cubma\source\repos\EverythingBoxWebsite`:

```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --skip-houston
```

Answer "y" if it warns the directory is not empty — `docs/` and `.gitignore` are already there and must be preserved.

- [ ] **Step 2: Install dependencies**

```bash
npm install && npm install tailwindcss @tailwindcss/vite @astrojs/mdx sharp && npm install -D vitest
```

- [ ] **Step 3: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// `site` is intentionally a placeholder until a deploy target is chosen; it only
// affects absolute URLs in generated metadata, not local development.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://everythingbox.example',
  integrations: [mdx()],
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 4: Write `src/styles/global.css`**

```css
@import "tailwindcss";

@theme {
  --color-base: #0d1424;
  --color-surface: #131c33;
  --color-accent: #e8b13a;
  --color-ink: #f6f1e4;
  --color-muted: #a9b3c9;
  --color-edge: #2c3856;
  --font-sans: "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
}

html { background: var(--color-base); color-scheme: dark; }

body {
  background: var(--color-base);
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

/* Display sizes get tight tracking; body text keeps normal tracking. */
.display { letter-spacing: -0.03em; line-height: 1.04; font-weight: 800; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 5: Write `src/components/Glow.astro`**

```astro
---
// The signature gold radial. Used at most once per section — importing this
// component (rather than inlining the gradient) is what makes that countable.
interface Props { className?: string }
const { className = '' } = Astro.props;
---
<div
  aria-hidden="true"
  class={`pointer-events-none absolute left-1/2 -translate-x-1/2 -z-10 ${className}`}
  style="width:min(900px,120vw);height:520px;background:radial-gradient(ellipse at center, rgba(232,177,58,.30), rgba(232,177,58,0) 68%);"
></div>
```

- [ ] **Step 6: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
interface Props { title: string; description: string; wide?: boolean }
const { title, description, wide = false } = Astro.props;
const nav = [
  { href: '/features',    label: 'Features' },
  { href: '/emulation',   label: 'Emulation' },
  { href: '/addons',      label: 'Addons' },
  { href: '/screenshots', label: 'Screenshots' },
  { href: '/docs',        label: 'Docs' },
];
const path = Astro.url.pathname;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/favicon.png" />
  </head>
  <body class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-50 border-b border-edge/60 bg-base/85 backdrop-blur">
      <nav class="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
        <a href="/" class="flex items-center gap-2 font-extrabold">
          <img src="/appicon.png" alt="" width="24" height="24" />
          EverythingBox
        </a>
        <div class="ml-auto hidden items-center gap-5 text-sm text-muted md:flex">
          {nav.map((i) => (
            <a href={i.href} class={path.startsWith(i.href) ? 'text-accent' : 'hover:text-ink'}>{i.label}</a>
          ))}
          <a href="/download" class="rounded-md bg-accent px-3 py-1.5 font-semibold text-base">Download</a>
        </div>
        <button id="navToggle" class="ml-auto md:hidden" aria-expanded="false" aria-controls="mobileNav">Menu</button>
      </nav>
      <div id="mobileNav" hidden class="border-t border-edge/60 px-5 py-3 md:hidden">
        {nav.map((i) => <a href={i.href} class="block py-2 text-muted">{i.label}</a>)}
        <a href="/download" class="block py-2 font-semibold text-accent">Download</a>
      </div>
    </header>

    <main class={wide ? 'flex-1' : 'mx-auto w-full max-w-6xl flex-1 px-5'}>
      <slot />
    </main>

    <footer class="mt-24 border-t border-edge/60 px-5 py-10 text-sm text-muted">
      <div class="mx-auto flex max-w-6xl flex-wrap gap-6">
        <p>EverythingBox is free software under the GNU General Public License v3.0.</p>
        <a class="ml-auto hover:text-ink" href="https://github.com/cubman3134/EverythingBox">Source on GitHub</a>
      </div>
    </footer>

    <script>
      // Island 1 of 5: mobile nav.
      const btn = document.getElementById('navToggle');
      const panel = document.getElementById('mobileNav');
      btn?.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        if (panel) panel.hidden = open;
      });
    </script>
  </body>
</html>
```

- [ ] **Step 7: Write a placeholder `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="EverythingBox" description="One native app for everything you watch, play and read.">
  <h1 class="display mt-24 text-5xl">EverythingBox</h1>
</Base>
```

- [ ] **Step 8: Write the failing test `tests/shell.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function allHtml(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) allHtml(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

describe('built site shell', () => {
  const files = allHtml('dist');

  it('produces at least one page', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('never leaks the old product name', () => {
    for (const f of files) {
      const html = readFileSync(f, 'utf8');
      expect(html, `${f} mentions the pre-rename product name`).not.toMatch(/My ?Media ?Vault/i);
    }
  });

  it('renders the nav and the licence line', () => {
    const home = readFileSync('dist/index.html', 'utf8');
    expect(home).toContain('EverythingBox');
    expect(home).toContain('General Public License v3.0');
  });
});
```

- [ ] **Step 9: Write `vitest.config.ts` and wire the scripts**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/**/*.test.ts'] } });
```

Add to `package.json` `"scripts"`:

```json
"test": "astro build && vitest run",
"gen": "node tools/gen-catalog.mjs"
```

- [ ] **Step 10: Run the test to verify it fails**

```bash
npx vitest run
```

Expected: FAIL — `dist` does not exist yet (`ENOENT`).

- [ ] **Step 11: Run the full test to verify it passes**

```bash
npm test
```

Expected: PASS, 3 tests.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro site shell with design tokens"
```

---

## Task 2: Generated catalog data

**Files:**
- Create: `src/data/types.ts`, `tools/gen-catalog.mjs`
- Generate: `src/data/systems.ts`, `src/data/emulators.ts`
- Test: `tests/catalog.test.ts`

**Interfaces:**
- Consumes: `Base.astro` from Task 1.
- Produces: `export interface GameSystem { id: string; name: string; extensions: string[]; cores: string[]; externalEmulator: string }` and `export interface Emulator { id: string; name: string; homepage: string }`; `export const systems: GameSystem[]` from `src/data/systems.ts`; `export const emulators: Emulator[]` from `src/data/emulators.ts`.

The generator reads the app repo so these lists cannot drift from the app. Its **output is committed**, so the website build never needs the app repo present.

- [ ] **Step 1: Write `src/data/types.ts`**

```ts
export interface GameSystem {
  id: string;
  name: string;
  extensions: string[];
  cores: string[];
  /** Non-empty => runs in a standalone emulator (Emulator.id), not an in-process libretro core. */
  externalEmulator: string;
}

export interface Emulator {
  id: string;
  name: string;
  homepage: string;
}

export interface Platform {
  id: string;
  name: string;
  note: string;
  /** Matches the release asset filename, tolerating either brand prefix. */
  assetPattern: RegExp;
}

export interface Feature {
  group: string;
  title: string;
  body: string;
  /** Built but not verified on hardware — rendered with an explicit caveat. */
  unverified?: boolean;
}

export interface Theme {
  id: string;
  name: string;
  blurb: string;
  shot: string;
}

export interface Screenshot {
  id: string;
  file: string;
  caption: string;
  theme: string | null;
  category: 'video' | 'games' | 'music' | 'reading' | 'system';
}
```

- [ ] **Step 2: Write `tools/gen-catalog.mjs`**

```js
// Parses the EverythingBox app repo's C++ headers into typed TS data modules.
// Run manually after the app's catalog changes: `npm run gen`.
// The OUTPUT is committed, so the site build never needs the app repo.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APP = process.env.EB_APP_REPO ?? 'C:/Users/cubma/Project Goliath';

function parseSystems() {
  const src = readFileSync(join(APP, 'native/src/core/SystemCatalog.h'), 'utf8');
  const body = src.slice(src.indexOf('static const QList<GameSystem> list = {'));
  const re = /\{\s*"([a-z0-9_]+)"\s*,\s*"([^"]+)"\s*,\s*\{([^}]*)\}\s*,\s*\{([^}]*)\}\s*(?:,\s*"([a-z0-9_]+)"\s*)?\}/gs;
  const out = [];
  for (const m of body.matchAll(re)) {
    out.push({
      id: m[1],
      name: m[2],
      extensions: [...m[3].matchAll(/"([^"]+)"/g)].map((x) => x[1]),
      cores: [...m[4].matchAll(/"([^"]+)"/g)].map((x) => x[1]),
      externalEmulator: m[5] ?? '',
    });
  }
  return out;
}

function parseEmulators() {
  const src = readFileSync(join(APP, 'native/src/core/EmulatorRegistry.h'), 'utf8');
  const body = src.slice(src.indexOf('static const QList<ExternalEmulator> list = {'));
  // Each entry opens with id, displayName, argsTemplate, fullscreenArgs, windowedArgs, homepage.
  // fullscreenArgs/windowedArgs may be QString() rather than a literal, so match loosely and
  // take the first https:// literal that follows the id as the homepage.
  const re = /QStringLiteral\("([a-z0-9_]+)"\),\s*QStringLiteral\("([^"]+)"\),/g;
  const seen = new Set();
  const out = [];
  for (const m of body.matchAll(re)) {
    if (seen.has(m[1])) continue;
    const rest = body.slice(m.index, m.index + 1200);
    const hp = rest.match(/QStringLiteral\("(https:\/\/(?!api\.github|git\.ryujinx)[^"]+)"\)/);
    if (!hp) continue; // not a top-level entry
    seen.add(m[1]);
    out.push({ id: m[1], name: m[2], homepage: hp[1] });
  }
  return out;
}

const banner = '// GENERATED by tools/gen-catalog.mjs from the EverythingBox app repo. Do not edit by hand.\n';

const systems = parseSystems();
const emulators = parseEmulators();

if (systems.length < 60) throw new Error(`only parsed ${systems.length} systems — parser is broken`);
if (emulators.length < 14) throw new Error(`only parsed ${emulators.length} emulators — parser is broken`);

writeFileSync(
  'src/data/systems.ts',
  `${banner}import type { GameSystem } from './types';\n\nexport const systems: GameSystem[] = ${JSON.stringify(systems, null, 2)};\n`,
);
writeFileSync(
  'src/data/emulators.ts',
  `${banner}import type { Emulator } from './types';\n\nexport const emulators: Emulator[] = ${JSON.stringify(emulators, null, 2)};\n`,
);

console.log(`wrote ${systems.length} systems, ${emulators.length} emulators`);
```

- [ ] **Step 3: Write the failing test `tests/catalog.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { systems } from '../src/data/systems';
import { emulators } from '../src/data/emulators';

describe('catalog data', () => {
  it('carries every system from the app catalog', () => {
    expect(systems).toHaveLength(63);
  });

  it('carries every standalone emulator', () => {
    expect(emulators).toHaveLength(15);
  });

  it('marks exactly the externally-backed systems', () => {
    const external = systems.filter((s) => s.externalEmulator);
    expect(external).toHaveLength(16);
  });

  it('points every external system at a real emulator', () => {
    const ids = new Set(emulators.map((e) => e.id));
    for (const s of systems.filter((x) => x.externalEmulator)) {
      expect(ids, `${s.id} -> ${s.externalEmulator}`).toContain(s.externalEmulator);
    }
  });

  it('gives every emulator a homepage', () => {
    for (const e of emulators) expect(e.homepage).toMatch(/^https:\/\//);
  });

  it('has no duplicate system ids', () => {
    expect(new Set(systems.map((s) => s.id)).size).toBe(systems.length);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
npx vitest run tests/catalog.test.ts
```

Expected: FAIL — cannot resolve `../src/data/systems`.

- [ ] **Step 5: Generate the data**

```bash
npm run gen
```

Expected output: `wrote 63 systems, 15 emulators`

- [ ] **Step 6: Run the test to verify it passes**

```bash
npx vitest run tests/catalog.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: generate systems and emulator catalogs from the app repo"
```

---

## Task 3: Release resolution

**Files:**
- Create: `src/lib/release.ts`, `src/data/platforms.ts`, `src/data/release.fallback.json`
- Test: `tests/release.test.ts`

**Interfaces:**
- Consumes: `Platform` from `src/data/types.ts` (Task 2).
- Produces:
  - `export const platforms: Platform[]` from `src/data/platforms.ts`
  - `export interface ResolvedAsset { platformId: string; name: string; url: string; size: number }`
  - `export interface Release { version: string; publishedAt: string; assets: ResolvedAsset[] }`
  - `export async function resolveRelease(): Promise<Release>`
  - `export function matchAssets(names: {name: string; size: number; browser_download_url: string}[]): ResolvedAsset[]`

**Why this exists:** the published v0.5.0 assets are named `MyMediaVault-*`, but the app's source rename to `EverythingBox` is complete, so the next release will be named `EverythingBox-*`. Matching on the platform suffix rather than the full filename makes the site correct across that change without an edit.

- [ ] **Step 1: Write `src/data/platforms.ts`**

```ts
import type { Platform } from './types';

// assetPattern matches the platform suffix only, so it holds across the app's
// in-flight MyMediaVault -> EverythingBox asset rename.
export const platforms: Platform[] = [
  {
    id: 'windows',
    name: 'Windows',
    // Deliberately does not name the .exe: the v0.5.0 archive still carries the
    // pre-rename executable name, so naming it would be wrong for today's build.
    note: 'Unzip anywhere and run the application. There is no installer.',
    assetPattern: /-windows-x64\.zip$/,
  },
  {
    id: 'macos',
    name: 'macOS (Apple Silicon)',
    note: 'Unsigned build — on first launch, right-click the app and choose Open.',
    assetPattern: /-macos-arm64\.dmg$/,
  },
  {
    id: 'linux',
    name: 'Linux (x86_64)',
    note: 'Mark it executable with chmod +x, then run it.',
    assetPattern: /-linux-x86_64\.AppImage$/,
  },
  {
    id: 'android',
    name: 'Android & Android TV',
    note: 'Sideload the APK. Runs on phones, tablets, and TV devices. Standalone emulators are desktop-only.',
    assetPattern: /-android-arm64\.apk$/,
  },
  {
    id: 'ios',
    name: 'iOS / iPadOS',
    note: 'Unsigned — sideload with AltStore or Sideloadly. Emulation is unavailable on iOS.',
    assetPattern: /-ios-arm64\.ipa$/,
  },
];
```

- [ ] **Step 2: Write the failing test `tests/release.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { matchAssets } from '../src/lib/release';

// Real asset names from EverythingBox v0.5.0, which predates the product rename.
const v050 = [
  { name: 'MyMediaVault-android-arm64.apk',       size: 34623858, browser_download_url: 'https://x/a' },
  { name: 'MyMediaVault-android-armv7.apk',       size: 31121968, browser_download_url: 'https://x/b' },
  { name: 'MyMediaVault-android-x86_64.apk',      size: 36442197, browser_download_url: 'https://x/c' },
  { name: 'MyMediaVault-ios-arm64.ipa',           size: 28255979, browser_download_url: 'https://x/d' },
  { name: 'MyMediaVault-linux-x86_64.AppImage',   size: 129718776, browser_download_url: 'https://x/e' },
  { name: 'MyMediaVault-macos-arm64.dmg',         size: 94842308, browser_download_url: 'https://x/f' },
  { name: 'MyMediaVault-windows-x64-pdb.zip',     size: 11288895, browser_download_url: 'https://x/g' },
  { name: 'MyMediaVault-windows-x64.zip',         size: 113840490, browser_download_url: 'https://x/h' },
];

// The same release after the rename lands.
const renamed = v050.map((a) => ({ ...a, name: a.name.replace('MyMediaVault', 'EverythingBox') }));

describe('matchAssets', () => {
  it('resolves all five platforms from pre-rename assets', () => {
    const got = matchAssets(v050);
    expect(got.map((a) => a.platformId).sort()).toEqual(
      ['android', 'ios', 'linux', 'macos', 'windows'],
    );
  });

  it('resolves all five platforms from post-rename assets', () => {
    expect(matchAssets(renamed)).toHaveLength(5);
  });

  it('never offers the debug-symbol archive as the Windows download', () => {
    const win = matchAssets(v050).find((a) => a.platformId === 'windows');
    expect(win?.name).toBe('MyMediaVault-windows-x64.zip');
    expect(win?.size).toBe(113840490);
  });

  it('picks arm64 for Android, not armv7 or x86_64', () => {
    const android = matchAssets(v050).find((a) => a.platformId === 'android');
    expect(android?.name).toContain('arm64');
  });

  it('omits a platform whose asset is absent rather than inventing a link', () => {
    const partial = v050.filter((a) => !a.name.includes('ios'));
    expect(matchAssets(partial).map((a) => a.platformId)).not.toContain('ios');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npx vitest run tests/release.test.ts
```

Expected: FAIL — cannot resolve `../src/lib/release`.

- [ ] **Step 4: Write `src/lib/release.ts`**

```ts
import { platforms } from '../data/platforms';
import fallback from '../data/release.fallback.json';

export interface ResolvedAsset {
  platformId: string;
  name: string;
  url: string;
  size: number;
}

export interface Release {
  version: string;
  publishedAt: string;
  assets: ResolvedAsset[];
}

interface ApiAsset { name: string; size: number; browser_download_url: string }

const API = 'https://api.github.com/repos/cubman3134/EverythingBox/releases/latest';

export function matchAssets(assets: ApiAsset[]): ResolvedAsset[] {
  const out: ResolvedAsset[] = [];
  for (const p of platforms) {
    const hit = assets.find((a) => p.assetPattern.test(a.name));
    if (!hit) continue; // A missing asset yields no card, never a broken link.
    out.push({ platformId: p.id, name: hit.name, url: hit.browser_download_url, size: hit.size });
  }
  return out;
}

/**
 * Build-time only. Falls back to the committed snapshot so the build never
 * fails offline or when the API rate-limits.
 */
export async function resolveRelease(): Promise<Release> {
  try {
    const res = await fetch(API, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'everythingbox-website' },
    });
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const json = (await res.json()) as { tag_name: string; published_at: string; assets: ApiAsset[] };
    const assets = matchAssets(json.assets);
    if (assets.length === 0) throw new Error('no assets matched any platform');
    return { version: json.tag_name, publishedAt: json.published_at, assets };
  } catch (err) {
    console.warn(`[release] live lookup failed (${(err as Error).message}); using committed fallback`);
    return fallback as Release;
  }
}

export function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}
```

- [ ] **Step 5: Write `src/data/release.fallback.json`**

```json
{
  "version": "v0.5.0",
  "publishedAt": "2026-07-23T19:02:21Z",
  "assets": [
    { "platformId": "windows", "name": "MyMediaVault-windows-x64.zip", "url": "https://github.com/cubman3134/EverythingBox/releases/download/v0.5.0/MyMediaVault-windows-x64.zip", "size": 113840490 },
    { "platformId": "macos", "name": "MyMediaVault-macos-arm64.dmg", "url": "https://github.com/cubman3134/EverythingBox/releases/download/v0.5.0/MyMediaVault-macos-arm64.dmg", "size": 94842308 },
    { "platformId": "linux", "name": "MyMediaVault-linux-x86_64.AppImage", "url": "https://github.com/cubman3134/EverythingBox/releases/download/v0.5.0/MyMediaVault-linux-x86_64.AppImage", "size": 129718776 },
    { "platformId": "android", "name": "MyMediaVault-android-arm64.apk", "url": "https://github.com/cubman3134/EverythingBox/releases/download/v0.5.0/MyMediaVault-android-arm64.apk", "size": 34623858 },
    { "platformId": "ios", "name": "MyMediaVault-ios-arm64.ipa", "url": "https://github.com/cubman3134/EverythingBox/releases/download/v0.5.0/MyMediaVault-ios-arm64.ipa", "size": 28255979 }
  ]
}
```

Add `"resolveJsonModule": true` to `tsconfig.json` `compilerOptions` if it is not already inherited.

- [ ] **Step 6: Run the test to verify it passes**

```bash
npx vitest run tests/release.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: resolve release assets at build time with an offline fallback"
```

---

## Task 4: Screenshot capture harness

**Files:**
- Create: `tools/capture.py`, `tools/README.md`
- Create (output): `src/assets/shots/*.png`

**Interfaces:**
- Consumes: nothing in this repo. Depends on the app being reachable on its uitest channel.
- Produces: PNG files in `src/assets/shots/` named by the ids listed in `TARGETS`. Task 5's `screenshots.ts` references exactly these ids.

**Preconditions the implementer must satisfy before running:** the deployed app at `C:\EverythingBox-app\EverythingBox.exe` must be running with `EB_UITEST=1` set. The harness client lives in the app repo at `native/tools/uitest.py` and speaks the named pipe `\\.\pipe\EverythingBox-uitest`.

- [ ] **Step 1: Write `tools/capture.py`**

```python
#!/usr/bin/env python3
"""Capture EverythingBox screenshots for the website.

Drives the ALREADY-RUNNING app over its uitest channel. The app must have been
launched with EB_UITEST=1. Nothing here steals focus or synthesises keystrokes:
the app screenshots itself, even while occluded.

Usage:
    python tools/capture.py            # capture every target
    python tools/capture.py xmb-home   # capture one target by id
"""
import json
import os
import pathlib
import subprocess
import sys
import time

APP_REPO = pathlib.Path(os.environ.get("EB_APP_REPO", r"C:\Users\cubma\Project Goliath"))
UITEST = APP_REPO / "native" / "tools" / "uitest.py"
OUT = pathlib.Path(__file__).resolve().parent.parent / "src" / "assets" / "shots"

# (id, keys-to-get-there, expected substring in the state JSON before shooting)
# `keys` is a space-separated sequence understood by uitest.py's `keys` command.
# `expect` guards against a drifted sequence committing the wrong screenshot.
TARGETS = [
    ("home-default",  "escape escape",                      '"view"'),
    ("home-grid",     "escape escape",                      '"view"'),
    ("home-lumen",    "escape escape",                      '"view"'),
    ("home-midnight", "escape escape",                      '"view"'),
    ("home-channels", "escape escape",                      '"view"'),
    ("home-triple",   "escape escape",                      '"view"'),
    ("movie-detail",  "escape escape enter enter",          '"view"'),
    ("show-episodes", "escape escape right enter enter enter", '"view"'),
    ("music-playing", "escape escape",                      '"view"'),
    ("video-playing", "escape escape",                      '"view"'),
    ("emu-grid",      "escape escape",                      '"view"'),
    ("emu-running",   "escape escape",                      '"view"'),
    ("reader-book",   "escape escape",                      '"view"'),
    ("reader-comic",  "escape escape",                      '"view"'),
    ("reader-pdf",    "escape escape",                      '"view"'),
    ("downloads",     "escape escape",                      '"view"'),
    ("settings",      "escape escape",                      '"view"'),
    ("remap",         "escape escape",                      '"view"'),
]


def ui(*args: str) -> str:
    r = subprocess.run([sys.executable, str(UITEST), *args],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(
            f"uitest failed ({' '.join(args)}): {r.stderr.strip() or r.stdout.strip()}\n"
            f"Is the app running with EB_UITEST=1?")
    return r.stdout.strip()


def main() -> int:
    if not UITEST.exists():
        raise SystemExit(f"uitest client not found at {UITEST}; set EB_APP_REPO")
    OUT.mkdir(parents=True, exist_ok=True)

    wanted = sys.argv[1:]
    targets = [t for t in TARGETS if not wanted or t[0] in wanted]
    if wanted and not targets:
        raise SystemExit(f"no target matches {wanted}")

    for tid, keys, expect in targets:
        print(f"--> {tid}")
        if keys:
            ui("keys", keys)
        time.sleep(0.6)  # let the view settle before shooting
        state = ui("state")
        if expect not in state:
            print(f"    SKIP {tid}: state did not contain {expect!r}\n    state={state[:200]}")
            continue
        dest = OUT / f"{tid}.png"
        ui("shot", str(dest))
        if not dest.exists():
            print(f"    FAILED {tid}: no file written")
        else:
            print(f"    wrote {dest.name} ({dest.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 2: Write `tools/README.md`**

````markdown
# Website tooling

## `capture.py` — screenshots

The app screenshots itself over its UI-test channel, so no window ever needs focus.

1. Launch the deployed app with the test channel enabled:

   ```powershell
   $env:EB_UITEST = "1"; & "C:\EverythingBox-app\EverythingBox.exe"
   ```

2. Capture:

   ```bash
   python tools/capture.py
   ```

Output lands in `src/assets/shots/`. **Review every image before committing** —
the running app is pointed at a real library and a real account.

`TARGETS` in the script is the list of screens. Each entry asserts on the app's
reported state before shooting, so a drifted key sequence skips rather than
committing the wrong screenshot.

## `gen-catalog.mjs` — systems and emulators

Regenerates `src/data/systems.ts` and `src/data/emulators.ts` from the app repo.
Run `npm run gen` after the app's catalog changes. Output is committed; the site
build never needs the app repo.
````

- [ ] **Step 3: Launch the app with the test channel**

```powershell
$env:EB_UITEST = "1"; Start-Process "C:\EverythingBox-app\EverythingBox.exe"
```

- [ ] **Step 4: Verify the channel is reachable before capturing**

```bash
python "C:/Users/cubma/Project Goliath/native/tools/uitest.py" state
```

Expected: a JSON blob describing the current view. If it errors, the app is not running with `EB_UITEST=1` — fix that before continuing rather than working around it.

- [ ] **Step 5: Capture one target and inspect it**

```bash
python tools/capture.py home-default
```

Open `src/assets/shots/home-default.png` and confirm: real artwork is visible, the product name reads EverythingBox, and no personal path or filename is legible.

- [ ] **Step 6: Tune `TARGETS` against the live app, then capture the rest**

The `keys` sequences above are starting points. Drive the app manually with `uitest.py keys …` and `uitest.py state` to learn the real navigation path to each screen, update each `TARGETS` entry with the sequence and a distinctive `expect` substring from that view's state JSON, then run:

```bash
python tools/capture.py
```

Expected: one `wrote <id>.png` line per target. Any `SKIP` line names a target whose sequence still needs work — fix it rather than leaving the capture missing.

- [ ] **Step 7: Review every capture for private content**

```bash
ls src/assets/shots/
```

Open each. Remove or re-shoot any image showing a real filesystem path, a personal filename, an account name, or an email address.

- [ ] **Step 8: Commit**

```bash
git add tools/ src/assets/shots/
git commit -m "feat: screenshot capture harness and captured app screens"
```

---

## Task 5: Screenshot manifest and the build-time existence guard

**Files:**
- Create: `src/data/screenshots.ts`, `src/data/themes.ts`, `src/lib/shots.ts`, `src/components/Shot.astro`
- Test: `tests/shots.test.ts`

**Interfaces:**
- Consumes: `Screenshot`, `Theme` from `src/data/types.ts`; the PNGs from Task 4.
- Produces: `export const screenshots: Screenshot[]`; `export const themes: Theme[]`; `export function shotById(id: string): { src: ImageMetadata; caption: string }`; `Shot.astro` with props `{ id: string; caption?: string; priority?: boolean }`.

- [ ] **Step 1: Write `src/data/themes.ts`**

```ts
import type { Theme } from './types';

// The six themes bundled with the app, from native/registry/everythingbox-themes/themes2/.
export const themes: Theme[] = [
  { id: 'default',  name: 'Default',  blurb: 'A PS3-style cross-media bar. Categories across, the active category down.', shot: 'home-default' },
  { id: 'grid',     name: 'Grid',     blurb: 'Poster-first rows. The closest thing to a streaming-app home screen.',      shot: 'home-grid' },
  { id: 'lumen',    name: 'Lumen',    blurb: 'Light, airy, and typographic. Built for bright rooms.',                     shot: 'home-lumen' },
  { id: 'midnight', name: 'Midnight', blurb: 'Deep contrast with restrained accents, for a dark room and a big screen.',  shot: 'home-midnight' },
  { id: 'channels', name: 'Channels', blurb: 'Your library arranged like a channel guide.',                               shot: 'home-channels' },
  { id: 'triple',   name: 'Triple',   blurb: 'Three panes at once — browse, preview, and detail without leaving the page.', shot: 'home-triple' },
];
```

- [ ] **Step 2: Write `src/data/screenshots.ts`**

Every `file` must correspond to a PNG captured in Task 4. Adjust captions to match what the images actually show.

```ts
import type { Screenshot } from './types';

export const screenshots: Screenshot[] = [
  { id: 'home-default',  file: 'home-default.png',  caption: 'The Default theme — a cross-media bar, navigable entirely with a D-pad.', theme: 'default',  category: 'system' },
  { id: 'home-grid',     file: 'home-grid.png',     caption: 'The Grid theme, poster-first.',                    theme: 'grid',     category: 'system' },
  { id: 'home-lumen',    file: 'home-lumen.png',    caption: 'The Lumen theme.',                                 theme: 'lumen',    category: 'system' },
  { id: 'home-midnight', file: 'home-midnight.png', caption: 'The Midnight theme.',                              theme: 'midnight', category: 'system' },
  { id: 'home-channels', file: 'home-channels.png', caption: 'The Channels theme.',                              theme: 'channels', category: 'system' },
  { id: 'home-triple',   file: 'home-triple.png',   caption: 'The Triple theme — browse, preview and detail at once.', theme: 'triple', category: 'system' },
  { id: 'movie-detail',  file: 'movie-detail.png',  caption: 'A film, with artwork and metadata pulled in by the catalog addon.', theme: null, category: 'video' },
  { id: 'show-episodes', file: 'show-episodes.png', caption: 'A series drilled down to its episodes.',           theme: null, category: 'video' },
  { id: 'video-playing', file: 'video-playing.png', caption: 'Playback through libmpv — MKV, HEVC, AV1, and the rest.', theme: null, category: 'video' },
  { id: 'music-playing', file: 'music-playing.png', caption: 'Now playing, with the folder queued as a playlist.', theme: null, category: 'music' },
  { id: 'emu-grid',      file: 'emu-grid.png',      caption: 'The games library.',                               theme: null, category: 'games' },
  { id: 'emu-running',   file: 'emu-running.png',   caption: 'A game running in-process on a libretro core.',    theme: null, category: 'games' },
  { id: 'remap',         file: 'remap.png',         caption: 'Controller remapping, per player port.',           theme: null, category: 'games' },
  { id: 'reader-book',   file: 'reader-book.png',   caption: 'The EPUB reader, with contents and resume.',        theme: null, category: 'reading' },
  { id: 'reader-comic',  file: 'reader-comic.png',  caption: 'The comic reader.',                                theme: null, category: 'reading' },
  { id: 'reader-pdf',    file: 'reader-pdf.png',    caption: 'PDFs, rendered by PDFium.',                        theme: null, category: 'reading' },
  { id: 'downloads',     file: 'downloads.png',     caption: 'The downloads queue.',                             theme: null, category: 'system' },
  { id: 'settings',      file: 'settings.png',      caption: 'Settings.',                                        theme: null, category: 'system' },
];
```

- [ ] **Step 3: Write the failing test `tests/shots.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { screenshots } from '../src/data/screenshots';
import { themes } from '../src/data/themes';

describe('screenshot manifest', () => {
  it('has a file on disk for every entry', () => {
    for (const s of screenshots) {
      expect(existsSync(join('src/assets/shots', s.file)), `missing ${s.file}`).toBe(true);
    }
  });

  it('has no duplicate ids', () => {
    expect(new Set(screenshots.map((s) => s.id)).size).toBe(screenshots.length);
  });

  it('gives every theme a screenshot that exists in the manifest', () => {
    const ids = new Set(screenshots.map((s) => s.id));
    for (const t of themes) expect(ids, `theme ${t.id}`).toContain(t.shot);
  });

  it('covers all six bundled themes', () => {
    expect(themes).toHaveLength(6);
  });

  it('writes a caption for every screenshot', () => {
    for (const s of screenshots) expect(s.caption.length).toBeGreaterThan(10);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
npx vitest run tests/shots.test.ts
```

Expected: FAIL — cannot resolve `../src/data/screenshots`.

- [ ] **Step 5: Write `src/lib/shots.ts`**

```ts
import type { ImageMetadata } from 'astro';
import { screenshots } from '../data/screenshots';

// Eager glob: a screenshot named in the manifest but absent on disk must fail
// the BUILD. A silently missing image is worse than a broken build.
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/shots/*.png',
  { eager: true },
);

export function shotById(id: string): { src: ImageMetadata; caption: string } {
  const meta = screenshots.find((s) => s.id === id);
  if (!meta) throw new Error(`[shots] no screenshot with id "${id}"`);
  const mod = files[`../assets/shots/${meta.file}`];
  if (!mod) throw new Error(`[shots] "${id}" points at ${meta.file}, which is not on disk`);
  return { src: mod.default, caption: meta.caption };
}
```

- [ ] **Step 6: Write `src/components/Shot.astro`**

```astro
---
import { Image } from 'astro:assets';
import { shotById } from '../lib/shots';

interface Props { id: string; caption?: string; priority?: boolean }
const { id, caption, priority = false } = Astro.props;
const shot = shotById(id);
const text = caption ?? shot.caption;
---
<figure class="my-6">
  <Image
    src={shot.src}
    alt={text}
    widths={[640, 1024, 1600]}
    sizes="(max-width: 768px) 100vw, 1024px"
    loading={priority ? 'eager' : 'lazy'}
    class="w-full rounded-lg border border-edge"
  />
  <figcaption class="mt-2 text-sm text-muted">{text}</figcaption>
</figure>
```

- [ ] **Step 7: Run the test to verify it passes**

```bash
npx vitest run tests/shots.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: screenshot manifest with a build-time existence guard"
```

---

## Task 6: Feature inventory and the Features page

**Files:**
- Create: `src/data/features.ts`, `src/pages/features.astro`
- Test: `tests/features.test.ts`

**Interfaces:**
- Consumes: `Feature` from types; `Base.astro`.
- Produces: `export const features: Feature[]`, grouped by `feature.group`.

- [ ] **Step 1: Write `src/data/features.ts`**

Every entry traces to `README.md` or `native/README.md` in the app repo. `unverified: true` is reserved for casting and netplay.

```ts
import type { Feature } from './types';

export const features: Feature[] = [
  // ---- Playback ----
  { group: 'Playback', title: 'Plays essentially anything', body: 'Video runs on libmpv, the same engine behind mpv — MKV, HEVC, AV1, AC3 and the rest, including large files streamed rather than copied.' },
  { group: 'Playback', title: 'Music with real playlists', body: 'MP3, FLAC, OGG, WAV and more, with folder queueing, previous and next, and automatic advance at end of track.' },
  { group: 'Playback', title: 'Subtitles', body: 'Fetches and caches subtitles, with per-file offset adjustment when a track drifts.' },
  { group: 'Playback', title: 'Skip intros and credits', body: 'Chapter and EDL-based segments let you jump past an intro or a recap without hunting for the timestamp.' },
  { group: 'Playback', title: 'Resume where you stopped', body: 'Per-file resume across video, books and PDFs.' },

  // ---- Library ----
  { group: 'Library', title: 'Your own files, scanned in place', body: 'Point it at folders and it builds a library, matching entries against catalog metadata rather than renaming anything on disk.' },
  { group: 'Library', title: 'Artwork and metadata', body: 'Posters, logos, banners and descriptions arrive through catalog addons, so a shelf of files becomes a browsable library.' },
  { group: 'Library', title: 'PC game libraries', body: 'Imports installed titles from Steam, Epic, GOG and Battle.net so they sit alongside everything else.' },
  { group: 'Library', title: 'Profiles and a parental lock', body: 'Separate profiles with their own progress, and a PIN-protected lock.' },
  { group: 'Library', title: 'Favourites, history and stats', body: 'Recently played, favourites, and per-item play statistics.' },

  // ---- Emulation ----
  { group: 'Emulation', title: '63 systems', body: 'From the Atari 2600 and the ZX Spectrum through to the Xbox 360 and the Switch.' },
  { group: 'Emulation', title: 'Cores run in-process', body: 'libretro cores load directly into the app — including hardware-rendered ones, which get a real GL context.' },
  { group: 'Emulation', title: 'Standalone emulators, installed for you', body: 'For 16 modern systems the app fetches and configures the standalone emulator from its official source: Dolphin, PCSX2, RPCS3, Ryujinx, Xenia and ten more.' },
  { group: 'Emulation', title: 'Controllers done properly', body: 'SDL2 gamepads with hot-plug, four player ports, independent per-port remapping for pad and keyboard, rumble, and adjustable turbo.' },
  { group: 'Emulation', title: 'Save states and cloud saves', body: 'Save and load states from the transport bar, with saves syncable across machines.' },
  { group: 'Emulation', title: 'RetroAchievements', body: 'Sign in and earn achievements on supported cores.' },

  // ---- Reading ----
  { group: 'Reading', title: 'EPUB reader', body: 'Parses the spine and table of contents, renders page by page, with adjustable text size and per-book resume.' },
  { group: 'Reading', title: 'PDF reader', body: 'Rendered with PDFium: page navigation, zoom, and fit-to-width.' },
  { group: 'Reading', title: 'Comics', body: 'CBZ and CBR, page by page.' },

  // ---- Extensibility ----
  { group: 'Extensibility', title: 'Addons are sandboxed JavaScript', body: 'Each addon is a manifest and a script running in an isolated interpreter, with a per-call execution timeout so a runaway addon cannot hang the interface.' },
  { group: 'Extensibility', title: 'They never block the interface', body: 'Addon calls run off the GUI thread, each in a fresh context, so no addon can freeze the app while it waits on the network.' },
  { group: 'Extensibility', title: 'Catalogs, search and drill-down', body: 'An addon declares catalogs per media type and supports search, pagination and drill-down — a series to its episodes, an album to its tracks.' },
  { group: 'Extensibility', title: 'Themes', body: 'Six themes ship with the app, and more install from the theme registry.' },

  // ---- Sync and social ----
  { group: 'Sync & social', title: 'Cloud sync', body: 'Progress, saves and settings sync between your own machines.' },
  { group: 'Sync & social', title: 'Trakt', body: 'Scrobble what you watch.' },
  { group: 'Sync & social', title: 'Cast to a TV', body: 'Chromecast and DLNA targets are implemented, but have not yet been tested against real hardware.', unverified: true },
  { group: 'Sync & social', title: 'Local netplay', body: 'Two-player lockstep netplay over a LAN is implemented, but has not yet been tested end to end.', unverified: true },

  // ---- Platforms ----
  { group: 'Platforms', title: 'Five platforms, one codebase', body: 'Windows, macOS, Linux, Android including Android TV, and iOS — a native Qt6 and C++ application on each.' },
  { group: 'Platforms', title: 'Built for a remote', body: 'The whole interface is navigable with a D-pad, which is what makes it work on a television.' },
  { group: 'Platforms', title: 'Free software', body: 'GPLv3. Use it, study it, change it, share it.' },
];
```

- [ ] **Step 2: Write the failing test `tests/features.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { features } from '../src/data/features';

describe('feature inventory', () => {
  it('uses only the agreed groups', () => {
    const groups = new Set(features.map((f) => f.group));
    expect([...groups].sort()).toEqual(
      ['Emulation', 'Extensibility', 'Library', 'Platforms', 'Playback', 'Reading', 'Sync & social'],
    );
  });

  it('marks casting and netplay as unverified', () => {
    const unverified = features.filter((f) => f.unverified).map((f) => f.title);
    expect(unverified).toContain('Cast to a TV');
    expect(unverified).toContain('Local netplay');
  });

  it('never claims an unverified feature works', () => {
    for (const f of features.filter((x) => x.unverified)) {
      expect(f.body.toLowerCase()).toMatch(/not yet been tested/);
    }
  });

  it('names no indexer, tracker or debrid provider', () => {
    const all = features.map((f) => `${f.title} ${f.body}`).join(' ').toLowerCase();
    for (const banned of ['real-debrid', 'torbox', 'prowlarr', 'jackett', 'torznab', 'torrent']) {
      expect(all, `mentions ${banned}`).not.toContain(banned);
    }
  });

  it('states the verified counts', () => {
    const all = features.map((f) => f.body + f.title).join(' ');
    expect(all).toContain('63 systems');
    expect(all).toContain('16 modern systems');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npx vitest run tests/features.test.ts
```

Expected: FAIL — cannot resolve `../src/data/features`.

- [ ] **Step 4: Run the test to verify it passes**

The data file from Step 1 satisfies it.

```bash
npx vitest run tests/features.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Write `src/pages/features.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Glow from '../components/Glow.astro';
import { features } from '../data/features';

const order = ['Playback', 'Library', 'Emulation', 'Reading', 'Extensibility', 'Sync & social', 'Platforms'];
const grouped = order.map((g) => ({ group: g, items: features.filter((f) => f.group === g) }));
---
<Base title="Features — EverythingBox" description="Everything EverythingBox does, grouped and in full.">
  <section class="relative pt-20 pb-10">
    <Glow className="top-0" />
    <h1 class="display text-5xl">Features</h1>
    <p class="mt-4 max-w-2xl text-muted">
      The full inventory. Where something is built but not yet proven on real hardware, it says so.
    </p>
  </section>

  {grouped.map(({ group, items }) => (
    <section class="border-t border-edge/60 py-12">
      <h2 class="text-sm font-semibold uppercase tracking-widest text-accent">{group}</h2>
      <div class="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {items.map((f) => (
          <div>
            <h3 class="font-semibold">
              {f.title}
              {f.unverified && (
                <span class="ml-2 rounded border border-edge px-1.5 py-0.5 align-middle text-[11px] font-normal text-muted">
                  untested on hardware
                </span>
              )}
            </h3>
            <p class="mt-1 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  ))}
</Base>
```

- [ ] **Step 6: Build and check the page renders**

```bash
npx astro build
```

Expected: build succeeds and `dist/features/index.html` exists.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: feature inventory and features page"
```

---

## Task 7: Download page

**Files:**
- Create: `src/components/PlatformCard.astro`, `src/pages/download.astro`
- Test: extend `tests/shell.test.ts`

**Interfaces:**
- Consumes: `resolveRelease`, `formatSize` from `src/lib/release.ts`; `platforms` from `src/data/platforms.ts`.
- Produces: `PlatformCard.astro` with props `{ name: string; note: string; url: string | null; filename: string | null; size: string | null }`.

- [ ] **Step 1: Write `src/components/PlatformCard.astro`**

```astro
---
interface Props {
  name: string;
  note: string;
  url: string | null;
  filename: string | null;
  size: string | null;
}
const { name, note, url, filename, size } = Astro.props;
---
<div class="rounded-lg border border-edge bg-surface p-5">
  <h3 class="font-semibold">{name}</h3>
  <p class="mt-1 text-sm leading-relaxed text-muted">{note}</p>
  {url ? (
    <>
      <a href={url} class="mt-4 inline-block rounded-md bg-accent px-4 py-2 font-semibold text-base">
        Download
      </a>
      <p class="mt-2 text-xs text-muted">{filename} · {size}</p>
    </>
  ) : (
    <p class="mt-4 text-sm text-muted">
      No build in the current release —
      <a class="text-accent" href="https://github.com/cubman3134/EverythingBox/releases">see all releases</a>.
    </p>
  )}
</div>
```

- [ ] **Step 2: Write `src/pages/download.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Glow from '../components/Glow.astro';
import PlatformCard from '../components/PlatformCard.astro';
import { platforms } from '../data/platforms';
import { resolveRelease, formatSize } from '../lib/release';

const release = await resolveRelease();
const byPlatform = new Map(release.assets.map((a) => [a.platformId, a]));
const date = new Date(release.publishedAt).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric',
});
---
<Base title="Download EverythingBox" description="Builds for Windows, macOS, Linux, Android TV and iOS.">
  <section class="relative pt-20 pb-10">
    <Glow className="top-0" />
    <h1 class="display text-5xl">Download</h1>
    <p class="mt-4 text-muted">Version {release.version} · released {date}</p>
  </section>

  <div class="grid gap-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
    {platforms.map((p) => {
      const a = byPlatform.get(p.id);
      return (
        <PlatformCard
          name={p.name}
          note={p.note}
          url={a?.url ?? null}
          filename={a?.name ?? null}
          size={a ? formatSize(a.size) : null}
        />
      );
    })}
  </div>

  <section class="border-t border-edge/60 py-12">
    <h2 class="text-2xl font-bold">Build it yourself</h2>
    <p class="mt-3 max-w-2xl text-muted">
      You need CMake, a C++17 compiler, Qt 6.8, libmpv and SDL2. The libretro frontend builds with
      just CMake and a compiler; the full application is behind a flag.
    </p>
    <pre class="mt-5 overflow-x-auto rounded-lg border border-edge bg-surface p-4 text-sm"><code>cmake -S native -B build -DEVERYTHINGBOX_BUILD_APP=ON \
  -DCMAKE_PREFIX_PATH="/path/to/Qt/6.8.3" \
  -DMPV_INCLUDE_DIR=… -DMPV_LIBRARY=… \
  -DSDL2_INCLUDE_DIR=… -DSDL2_LIBRARY=…
cmake --build build --config Release</code></pre>
    <p class="mt-4 text-sm text-muted">
      Full instructions live in the
      <a class="text-accent" href="https://github.com/cubman3134/EverythingBox/blob/main/native/README.md">app repository</a>.
    </p>
  </section>
</Base>
```

- [ ] **Step 3: Add the failing assertions to `tests/shell.test.ts`**

Append inside the existing `describe` block:

```ts
  it('renders a real, resolvable download link for every platform', () => {
    const html = readFileSync('dist/download/index.html', 'utf8');
    for (const suffix of [
      'windows-x64.zip', 'macos-arm64.dmg', 'linux-x86_64.AppImage',
      'android-arm64.apk', 'ios-arm64.ipa',
    ]) {
      expect(html, `no link ending ${suffix}`).toContain(suffix);
    }
  });

  it('never offers the debug-symbol archive', () => {
    const html = readFileSync('dist/download/index.html', 'utf8');
    expect(html).not.toContain('-pdb.zip');
  });
```

Note: this file's existing "never leaks the old product name" test scans **all** HTML. Release asset filenames are the one sanctioned exception, so relax that test now — replace its body with:

```ts
  it('never leaks the old product name outside release filenames', () => {
    for (const f of files) {
      const html = readFileSync(f, 'utf8')
        // Release asset filenames come from the GitHub API and legitimately
        // carry the pre-rename name until the next release is cut.
        .replace(/MyMediaVault-[a-z0-9._-]+/gi, '');
      expect(html, `${f} mentions the pre-rename product name`).not.toMatch(/My ?Media ?Vault/i);
    }
  });
```

- [ ] **Step 4: Run to verify it fails**

```bash
npx vitest run tests/shell.test.ts
```

Expected: FAIL — `dist/download/index.html` does not exist.

- [ ] **Step 5: Run the full suite to verify it passes**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: download page with build-time resolved release assets"
```

---

## Task 8: Emulation page

**Files:**
- Create: `src/components/SystemsTable.astro`, `src/pages/emulation.astro`

**Interfaces:**
- Consumes: `systems`, `emulators` from Task 2; `Shot.astro` from Task 5.
- Produces: `SystemsTable.astro`, no props — reads the data modules directly.

- [ ] **Step 1: Write `src/components/SystemsTable.astro`**

```astro
---
import { systems } from '../data/systems';
import { emulators } from '../data/emulators';

const emuName = new Map(emulators.map((e) => [e.id, e.name]));
---
<div class="overflow-x-auto rounded-lg border border-edge">
  <table class="w-full min-w-[560px] text-left text-sm">
    <thead class="bg-surface text-xs uppercase tracking-wider text-muted">
      <tr>
        <th class="px-4 py-3">System</th>
        <th class="px-4 py-3">Runs on</th>
        <th class="px-4 py-3">File types</th>
      </tr>
    </thead>
    <tbody>
      {systems.map((s) => (
        <tr class="border-t border-edge/60">
          <td class="px-4 py-2.5 font-medium">{s.name}</td>
          <td class="px-4 py-2.5 text-muted">
            {s.externalEmulator
              ? emuName.get(s.externalEmulator) ?? s.externalEmulator
              : 'Built-in core'}
          </td>
          <td class="px-4 py-2.5 font-mono text-xs text-muted">
            {s.extensions.slice(0, 6).map((e) => `.${e}`).join(' ')}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

- [ ] **Step 2: Write `src/pages/emulation.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Glow from '../components/Glow.astro';
import Shot from '../components/Shot.astro';
import SystemsTable from '../components/SystemsTable.astro';
import { systems } from '../data/systems';
import { emulators } from '../data/emulators';

const externalCount = systems.filter((s) => s.externalEmulator).length;
---
<Base title="Emulation — EverythingBox" description="63 systems, from the Atari 2600 to the Xbox 360.">
  <section class="relative pt-20 pb-10">
    <Glow className="top-0" />
    <h1 class="display text-5xl">Emulation</h1>
    <p class="mt-4 max-w-2xl text-muted">
      {systems.length} systems. {systems.length - externalCount} of them run on cores loaded straight
      into the application; the remaining {externalCount} hand off to a standalone emulator the app
      installs and configures for you.
    </p>
  </section>

  <Shot id="emu-running" priority />

  <section class="grid gap-10 border-t border-edge/60 py-12 md:grid-cols-2">
    <div>
      <h2 class="text-xl font-bold">Cores run inside the app</h2>
      <p class="mt-3 text-sm leading-relaxed text-muted">
        libretro cores load directly into the process, so there is no second window and no separate
        configuration to keep in step. Hardware-rendered cores get a real OpenGL context. Cores are
        downloaded on demand — you pick the system, the app fetches what it needs.
      </p>
    </div>
    <div>
      <h2 class="text-xl font-bold">Modern consoles use the real thing</h2>
      <p class="mt-3 text-sm leading-relaxed text-muted">
        For newer hardware the app fetches the established standalone emulator from its own official
        source, unpacks it, and launches it with the right arguments:
        {emulators.map((e) => e.name).join(', ')}. These are desktop-only — Android and iOS cannot
        launch downloaded desktop executables.
      </p>
    </div>
  </section>

  <section class="border-t border-edge/60 py-12">
    <h2 class="text-2xl font-bold">Controllers</h2>
    <div class="mt-4 grid gap-8 md:grid-cols-2">
      <p class="text-sm leading-relaxed text-muted">
        Gamepads are handled through SDL2 with hot-plug, so a pad connected mid-session just works.
        Four player ports, each with its own controller <em>and</em> keyboard mapping, plus rumble and
        adjustable turbo per button.
      </p>
      <Shot id="remap" />
    </div>
  </section>

  <section class="border-t border-edge/60 py-12">
    <h2 class="text-2xl font-bold">Every system</h2>
    <p class="mt-3 mb-6 max-w-2xl text-sm text-muted">
      EverythingBox ships no games and no BIOS files. It runs what you already own.
    </p>
    <SystemsTable />
  </section>
</Base>
```

- [ ] **Step 3: Build and verify**

```bash
npx astro build
```

Expected: succeeds; `dist/emulation/index.html` exists and contains `Nintendo 64` and `Dolphin`.

```bash
node -e "const h=require('fs').readFileSync('dist/emulation/index.html','utf8');if(!h.includes('Nintendo 64')||!h.includes('Dolphin'))throw new Error('systems table did not render');console.log('ok')"
```

Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: emulation page with the full systems table"
```

---

## Task 9: Addons page

**Files:**
- Create: `src/pages/addons.astro`

**Interfaces:**
- Consumes: `Base.astro`, `Glow.astro`, `Shot.astro`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write `src/pages/addons.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Glow from '../components/Glow.astro';
import Shot from '../components/Shot.astro';

const manifest = `{
  "id": "com.example.myaddon",
  "name": "My Addon",
  "version": "1.0.0",
  "catalogs": [
    { "id": "popular", "type": "movie", "name": "Popular" }
  ]
}`;

const script = `// main.js
function getCatalog(catalogId, args) {
  var res = httpGet("https://example.com/api/" + catalogId + "?page=" + args.page);
  var data = JSON.parse(res);
  return {
    items: data.results.map(function (r) {
      return { id: String(r.id), title: r.title, poster: r.image };
    }),
    hasMore: data.page < data.total_pages
  };
}

function getDetail(id) {
  return { id: id, title: "…", episodes: [] };
}`;
---
<Base title="Addons — EverythingBox" description="Extend EverythingBox with sandboxed JavaScript addons.">
  <section class="relative pt-20 pb-10">
    <Glow className="top-0" />
    <h1 class="display text-5xl">Addons</h1>
    <p class="mt-4 max-w-2xl text-muted">
      An addon teaches EverythingBox about a new source of things to browse. It is a manifest and a
      script, and it runs sandboxed.
    </p>
  </section>

  <section class="rounded-lg border border-edge bg-surface p-6">
    <h2 class="text-lg font-bold">EverythingBox ships the engine, not the sources</h2>
    <p class="mt-3 text-sm leading-relaxed text-muted">
      The application provides the addon runtime, the catalog model, and a metadata addon that fills
      in artwork and descriptions. It does not ship media, and it does not come configured to point
      anywhere in particular. What you connect it to is your decision and your responsibility.
    </p>
  </section>

  <section class="grid gap-10 border-t border-edge/60 py-12 md:grid-cols-3">
    <div>
      <h3 class="font-semibold">Sandboxed</h3>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        Each addon runs in an isolated JavaScript interpreter with a per-call execution timeout, so a
        runaway script cannot lock up the interface.
      </p>
    </div>
    <div>
      <h3 class="font-semibold">Never blocks the app</h3>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        Calls run off the interface thread, each in a fresh context. No addon can freeze the app while
        it waits on a slow network.
      </p>
    </div>
    <div>
      <h3 class="font-semibold">Configurable</h3>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        An addon declares its own settings schema, and the app renders a form for it. Values persist
        per addon and the script reads them back.
      </p>
    </div>
  </section>

  <section class="border-t border-edge/60 py-12">
    <h2 class="text-2xl font-bold">The bundled catalog addon</h2>
    <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
      EverythingBox ships with a catalog addon that supplies metadata and artwork for films, shows,
      games and music. Add your own API keys in its configuration screen and your library fills in
      with posters, logos and descriptions.
    </p>
    <Shot id="movie-detail" />
  </section>

  <section class="border-t border-edge/60 py-12">
    <h2 class="text-2xl font-bold">Installing one</h2>
    <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
      Addons are distributed as <code class="text-accent">.addon</code> files. Open the library,
      choose to install, and pick the file. Each source can be enabled or disabled individually, and
      the setting sticks.
    </p>
  </section>

  <section class="border-t border-edge/60 py-12">
    <h2 class="text-2xl font-bold">Writing one</h2>
    <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
      Two files. A manifest describing what you provide:
    </p>
    <pre class="mt-4 overflow-x-auto rounded-lg border border-edge bg-surface p-4 text-sm"><code>{manifest}</code></pre>
    <p class="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
      And a script that answers for it. The host gives you HTTP, storage, logging and your own
      configuration values:
    </p>
    <pre class="mt-4 overflow-x-auto rounded-lg border border-edge bg-surface p-4 text-sm"><code>{script}</code></pre>
    <p class="mt-6 text-sm text-muted">
      Catalogs support search, pagination and drill-down, so a series can expand to its episodes and
      an album to its tracks. The full contract is documented in the
      <a class="text-accent" href="https://github.com/cubman3134/EverythingBox/blob/main/native/README.md">app repository</a>.
    </p>
  </section>
</Base>
```

- [ ] **Step 2: Build and verify the framing rule holds**

```bash
npx astro build && node -e "const h=require('fs').readFileSync('dist/addons/index.html','utf8').toLowerCase();for(const b of ['real-debrid','torbox','prowlarr','jackett','torrent'])if(h.includes(b))throw new Error('addons page names '+b);if(!h.includes('ships the engine'))throw new Error('missing the engine-not-sources statement');console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: addons page"
```

---

## Task 10: Screenshots gallery

**Files:**
- Create: `src/components/Gallery.astro`, `src/components/Lightbox.astro`, `src/pages/screenshots.astro`

**Interfaces:**
- Consumes: `screenshots`, `themes`, `shotById`.
- Produces: nothing consumed later. Islands 2 and 3 of 5 (filter, lightbox) live here.

- [ ] **Step 1: Write `src/components/Lightbox.astro`**

```astro
---
// Island 2 of 5. Progressive: with JS off, gallery images are still visible in
// the grid; the lightbox is purely an enlargement.
---
<div id="lightbox" hidden
     class="fixed inset-0 z-[100] hidden place-items-center bg-black/90 p-6 [&:not([hidden])]:grid">
  <button id="lightboxClose" class="absolute right-5 top-4 text-2xl text-ink" aria-label="Close">&times;</button>
  <figure class="max-h-full">
    <img id="lightboxImg" alt="" class="max-h-[80vh] w-auto rounded-lg border border-edge" />
    <figcaption id="lightboxCap" class="mt-3 text-center text-sm text-muted"></figcaption>
  </figure>
</div>

<script>
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg') as HTMLImageElement | null;
  const cap = document.getElementById('lightboxCap');

  function close() { if (box) box.hidden = true; }

  document.querySelectorAll<HTMLElement>('[data-lightbox]').forEach((el) => {
    el.addEventListener('click', () => {
      const src = el.dataset.full;
      if (!box || !img || !src) return;
      img.src = src;
      img.alt = el.dataset.caption ?? '';
      if (cap) cap.textContent = el.dataset.caption ?? '';
      box.hidden = false;
    });
  });

  document.getElementById('lightboxClose')?.addEventListener('click', close);
  box?.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
</script>
```

- [ ] **Step 2: Write `src/components/Gallery.astro`**

```astro
---
import { Image } from 'astro:assets';
import { screenshots } from '../data/screenshots';
import { shotById } from '../lib/shots';
import Lightbox from './Lightbox.astro';

const categories = ['all', 'video', 'games', 'music', 'reading', 'system'] as const;
const items = screenshots.map((s) => ({ meta: s, shot: shotById(s.id) }));
---
<div class="mb-8 flex flex-wrap gap-2">
  {categories.map((c) => (
    <button
      data-filter={c}
      class="filter-btn rounded-full border border-edge px-3 py-1 text-sm capitalize text-muted"
      aria-pressed={c === 'all' ? 'true' : 'false'}
    >{c}</button>
  ))}
</div>

<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(({ meta, shot }) => (
    <figure class="gallery-item" data-category={meta.category}>
      <button
        data-lightbox
        data-full={shot.src.src}
        data-caption={shot.caption}
        class="block w-full cursor-zoom-in"
      >
        <Image src={shot.src} alt={shot.caption} widths={[400, 800]} sizes="400px"
               loading="lazy" class="w-full rounded-lg border border-edge" />
      </button>
      <figcaption class="mt-2 text-sm text-muted">{shot.caption}</figcaption>
    </figure>
  ))}
</div>

<Lightbox />

<script>
  // Island 3 of 5: category filter. Without JS every item stays visible, which
  // is the correct unfiltered state.
  const buttons = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
  const items = document.querySelectorAll<HTMLElement>('.gallery-item');

  buttons.forEach((b) => b.addEventListener('click', () => {
    const want = b.dataset.filter;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    items.forEach((it) => {
      it.hidden = want !== 'all' && it.dataset.category !== want;
    });
  }));
</script>

<style>
  .filter-btn[aria-pressed='true'] {
    background: var(--color-accent);
    color: var(--color-base);
    border-color: var(--color-accent);
    font-weight: 600;
  }
</style>
```

- [ ] **Step 3: Write `src/pages/screenshots.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Glow from '../components/Glow.astro';
import Gallery from '../components/Gallery.astro';
---
<Base title="Screenshots — EverythingBox" description="EverythingBox running, across every theme and every kind of media.">
  <section class="relative pt-20 pb-10">
    <Glow className="top-0" />
    <h1 class="display text-5xl">Screenshots</h1>
    <p class="mt-4 max-w-2xl text-muted">
      All captured from the running application. Nothing here is a mockup.
    </p>
  </section>
  <div class="pb-20"><Gallery /></div>
</Base>
```

- [ ] **Step 4: Build and verify**

```bash
npx astro build && node -e "const h=require('fs').readFileSync('dist/screenshots/index.html','utf8');const n=(h.match(/gallery-item/g)||[]).length;if(n<18)throw new Error('only '+n+' gallery items rendered');console.log('ok '+n)"
```

Expected: `ok 18`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: screenshots gallery with filter and lightbox"
```

---

## Task 11: Home page

**Files:**
- Create: `src/components/Hero.astro`, `src/components/FeatureBlock.astro`
- Modify: `src/pages/index.astro` (replaces the Task 1 placeholder)

**Interfaces:**
- Consumes: `resolveRelease`, `platforms`, `themes`, `Shot.astro`, `Glow.astro`.
- Produces: `FeatureBlock.astro` with props `{ eyebrow: string; title: string; body: string; shotId: string; flip?: boolean }`. Islands 4 and 5 (hero playback, platform detection) live in `Hero.astro`.

The hero uses a still image until Task 12 produces the loop.

- [ ] **Step 1: Write `src/components/Hero.astro`**

```astro
---
import { Image } from 'astro:assets';
import Glow from './Glow.astro';
import { shotById } from '../lib/shots';
import { resolveRelease, formatSize } from '../lib/release';

const shot = shotById('home-default');
const release = await resolveRelease();
// Serialised for the platform-detection island. Build-time data, no runtime fetch.
const assets = release.assets.map((a) => ({ id: a.platformId, url: a.url, size: formatSize(a.size) }));
---
<section class="relative overflow-hidden pt-24 pb-0 text-center">
  <Glow className="-top-32" />

  <h1 class="display mx-auto max-w-3xl px-5 text-5xl sm:text-6xl md:text-7xl">
    Every screen.<br /><span class="text-accent">One box.</span>
  </h1>

  <p class="mx-auto mt-6 max-w-xl px-5 text-lg text-muted">
    Films, shows, music, games, comics and books — in one native app, on your desktop, your phone
    and your television.
  </p>

  <div class="mt-8 flex flex-wrap items-center justify-center gap-3 px-5">
    <a id="heroCta" href="/download" class="rounded-lg bg-accent px-6 py-3 font-semibold text-base">
      Download
    </a>
    <a href="/download" class="rounded-lg border border-edge px-6 py-3 font-medium text-muted hover:text-ink">
      All platforms
    </a>
  </div>

  <p class="mt-4 text-xs text-muted">Free and open source · {release.version}</p>

  <div class="relative mx-auto mt-14 max-w-5xl px-5">
    <Image src={shot.src} alt="EverythingBox on a television" widths={[800, 1400, 2000]}
           sizes="(max-width: 1024px) 100vw, 1024px" loading="eager"
           class="w-full rounded-t-xl border border-b-0 border-edge" />
  </div>
</section>

<script define:vars={{ assets }}>
  // Island 4 of 5: platform detection. This only UPGRADES the CTA — with JS off
  // it stays "Download" pointing at /download, which is correct for everyone.
  const cta = document.getElementById('heroCta');
  if (cta && assets.length) {
    const ua = navigator.userAgent;
    const label = { windows: 'Windows', macos: 'macOS', linux: 'Linux', android: 'Android', ios: 'iOS' };
    let id = null;
    if (/Windows/i.test(ua)) id = 'windows';
    else if (/iPhone|iPad|iPod/i.test(ua)) id = 'ios';
    else if (/Android/i.test(ua)) id = 'android';
    else if (/Macintosh|Mac OS X/i.test(ua)) id = 'macos';
    else if (/Linux/i.test(ua)) id = 'linux';

    const hit = assets.find((a) => a.id === id);
    if (hit) {
      cta.textContent = `Download for ${label[id]}`;
      cta.setAttribute('href', hit.url);
    }
  }
</script>
```

- [ ] **Step 2: Write `src/components/FeatureBlock.astro`**

```astro
---
import Shot from './Shot.astro';

interface Props { eyebrow: string; title: string; body: string; shotId: string; flip?: boolean }
const { eyebrow, title, body, shotId, flip = false } = Astro.props;
---
<section class="grid items-center gap-10 border-t border-edge/60 py-16 md:grid-cols-2">
  <div class={flip ? 'md:order-2' : ''}>
    <p class="text-sm font-semibold uppercase tracking-widest text-accent">{eyebrow}</p>
    <h2 class="mt-3 text-3xl font-bold">{title}</h2>
    <p class="mt-4 leading-relaxed text-muted">{body}</p>
  </div>
  <div class={flip ? 'md:order-1' : ''}>
    <Shot id={shotId} caption="" />
  </div>
</section>
```

`Shot.astro` renders an empty `<figcaption>` when `caption=""`. That is intentional here — the surrounding prose already names the screen.

- [ ] **Step 3: Rewrite `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import FeatureBlock from '../components/FeatureBlock.astro';
import Shot from '../components/Shot.astro';
import { themes } from '../data/themes';
import { systems } from '../data/systems';

const faqs = [
  {
    q: 'Does it come with anything to watch or play?',
    a: 'No. EverythingBox is a player and a library. It ships no media, no games and no BIOS files — it runs what you already have and what you choose to connect it to.',
  },
  {
    q: 'Does it work on a television?',
    a: 'Yes. Every screen is navigable with a D-pad, and the Android build carries a TV launcher entry, so it works on Android TV devices, Shield and Google TV with a remote or a controller.',
  },
  {
    q: 'What does it cost?',
    a: 'Nothing. It is free software under the GPLv3 — you can use it, study it, change it and share it.',
  },
  {
    q: 'Do I need to convert my files?',
    a: 'No. Video runs on libmpv, which plays essentially anything, and the library scans your folders in place without renaming or moving anything.',
  },
];
---
<Base title="EverythingBox — one app for everything you watch, play and read" description="A native media hub for films, shows, music, games, comics and books. Windows, macOS, Linux, Android TV and iOS. Free and open source." wide>
  <Hero />

  <div class="mx-auto w-full max-w-6xl px-5">
    <section class="grid gap-6 border-t border-edge/60 py-12 text-center sm:grid-cols-3">
      <div><p class="display text-4xl text-accent">6</p><p class="mt-1 text-sm text-muted">kinds of media, one library</p></div>
      <div><p class="display text-4xl text-accent">{systems.length}</p><p class="mt-1 text-sm text-muted">game systems</p></div>
      <div><p class="display text-4xl text-accent">5</p><p class="mt-1 text-sm text-muted">platforms, one codebase</p></div>
    </section>

    <FeatureBlock
      eyebrow="Video"
      title="Plays what other apps refuse to"
      body="Video runs on libmpv, the engine behind mpv. MKV, HEVC, AV1, AC3 — including large files streamed rather than copied first. Subtitles, resume, and a chapter-aware skip for intros and recaps."
      shotId="video-playing"
    />
    <FeatureBlock
      eyebrow="Games"
      title="Sixty-three systems, nothing to configure"
      body="Cores load straight into the application, so retro systems just run. For modern consoles the app fetches the established standalone emulator from its official source and sets it up for you. Four controllers, per-port remapping, rumble, save states and achievements."
      shotId="emu-grid"
      flip
    />
    <FeatureBlock
      eyebrow="Music"
      title="A folder is a playlist"
      body="MP3, FLAC, OGG and the rest, with folder queueing, automatic advance, and a now-playing view that stays out of the way."
      shotId="music-playing"
    />
    <FeatureBlock
      eyebrow="Reading"
      title="Books, comics and PDFs"
      body="An EPUB reader that parses the spine and contents, a comic reader for CBZ and CBR, and PDFs rendered by PDFium. Every one of them remembers your place."
      shotId="reader-book"
      flip
    />
    <FeatureBlock
      eyebrow="Extensibility"
      title="Addons, sandboxed"
      body="Teach the app about a new source with a manifest and a script. Each addon runs in an isolated interpreter with an execution timeout, off the interface thread, so nothing an addon does can freeze the app. EverythingBox ships the engine, not the sources."
      shotId="movie-detail"
    />

    <section class="border-t border-edge/60 py-16">
      <p class="text-sm font-semibold uppercase tracking-widest text-accent">Themes</p>
      <h2 class="mt-3 text-3xl font-bold">Make it look like whatever you want</h2>
      <p class="mt-4 max-w-2xl text-muted">
        Six themes ship with the app, from a cross-media bar to a three-pane browser, and more install
        from the theme registry.
      </p>
      <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((t) => (
          <div>
            <Shot id={t.shot} caption="" />
            <h3 class="font-semibold">{t.name}</h3>
            <p class="mt-1 text-sm text-muted">{t.blurb}</p>
          </div>
        ))}
      </div>
    </section>

    <section class="border-t border-edge/60 py-16">
      <h2 class="text-3xl font-bold">Questions</h2>
      <div class="mt-8 grid gap-8 md:grid-cols-2">
        {faqs.map((f) => (
          <div>
            <h3 class="font-semibold">{f.q}</h3>
            <p class="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
          </div>
        ))}
      </div>
    </section>

    <section class="relative border-t border-edge/60 py-20 text-center">
      <h2 class="display text-4xl">Get it</h2>
      <p class="mx-auto mt-4 max-w-lg text-muted">
        Windows, macOS, Linux, Android TV and iOS. Free, and always will be.
      </p>
      <a href="/download" class="mt-8 inline-block rounded-lg bg-accent px-8 py-3.5 font-semibold text-base">
        Download EverythingBox
      </a>
    </section>
  </div>
</Base>
```

- [ ] **Step 4: Build and verify**

```bash
npx astro build && node -e "const h=require('fs').readFileSync('dist/index.html','utf8');for(const s of ['Every screen','63','Themes','ships the engine'])if(!h.includes(s))throw new Error('home missing: '+s);console.log('ok')"
```

Expected: `ok`

- [ ] **Step 5: Look at it**

```bash
npm run dev
```

Open `http://localhost:4321` and check the hero, the alternating feature blocks, and the theme grid at both a desktop width and a 375px-wide viewport.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: home page"
```

---

## Task 12: Hero loop

**Files:**
- Create: `tools/make-hero-loop.mjs`
- Create (output): `public/hero-loop.webp`
- Modify: `src/components/Hero.astro`

**Interfaces:**
- Consumes: a frame sequence in `src/assets/hero-frames/` produced by `tools/capture.py`.
- Produces: `public/hero-loop.webp`, referenced by `Hero.astro`.

`ffmpeg` is not installed. This encodes an animated WebP with sharp instead, which needs no new system dependency.

- [ ] **Step 1: Capture a frame sequence**

Add to `tools/capture.py` above `main()`:

```python
def capture_frames(count: int = 90, delay: float = 0.08) -> None:
    """Capture a frame sequence for the website hero loop."""
    dest = pathlib.Path(__file__).resolve().parent.parent / "src" / "assets" / "hero-frames"
    dest.mkdir(parents=True, exist_ok=True)
    # Drift slowly across the home screen so the loop has motion in it.
    for i in range(count):
        if i and i % 10 == 0:
            ui("key", "right")
        ui("shot", str(dest / f"f{i:03d}.png"))
        time.sleep(delay)
    print(f"wrote {count} frames to {dest}")
```

And in `main()`, before the target loop:

```python
    if wanted == ["--frames"]:
        capture_frames()
        return 0
```

Then run:

```bash
python tools/capture.py --frames
```

Expected: `wrote 90 frames to …/src/assets/hero-frames`

- [ ] **Step 2: Write `tools/make-hero-loop.mjs`**

```js
// Frame sequence -> animated WebP, using sharp's multi-page ("toilet roll") input.
// ffmpeg is deliberately not a dependency of this project.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = 'src/assets/hero-frames';
const OUT = 'public/hero-loop.webp';
const WIDTH = 1280;
const DELAY = 80; // ms per frame

const frames = readdirSync(SRC).filter((f) => f.endsWith('.png')).sort();
if (frames.length < 10) throw new Error(`only ${frames.length} frames in ${SRC}`);

// Normalise every frame to the same width, then stack them vertically. sharp
// reads that stack back as an animation when given `pages` and `pageHeight`.
const resized = await Promise.all(
  frames.map((f) => sharp(join(SRC, f)).resize({ width: WIDTH }).toBuffer({ resolveWithObject: true })),
);

const height = resized[0].info.height;
if (resized.some((r) => r.info.height !== height)) {
  throw new Error('frames differ in height after resize — the window was resized mid-capture');
}

const stacked = await sharp({
  create: { width: WIDTH, height: height * frames.length, channels: 4, background: '#0d1424' },
})
  .composite(resized.map((r, i) => ({ input: r.data, top: i * height, left: 0 })))
  .png()
  .toBuffer();

await sharp(stacked, { raw: undefined, pages: frames.length, pageHeight: height })
  .webp({ quality: 72, effort: 5, loop: 0, delay: DELAY })
  .toFile(OUT);

console.log(`wrote ${OUT} from ${frames.length} frames at ${WIDTH}px`);
```

- [ ] **Step 3: Encode and check the size**

```bash
node tools/make-hero-loop.mjs && ls -lh public/hero-loop.webp
```

Expected: `wrote public/hero-loop.webp from 90 frames at 1280px`.

**Gate:** if the file exceeds **2 MB**, or the animation looks smeared or banded, stop and report it rather than shipping it. The spec's escalation path is to ask the user before installing ffmpeg to produce mp4/webm instead.

- [ ] **Step 4: Use it in `src/components/Hero.astro`**

Replace the `<Image …>` in the hero's screenshot block with:

```astro
  <div class="relative mx-auto mt-14 max-w-5xl px-5">
    <img
      id="heroLoop"
      src="/hero-loop.webp"
      alt="EverythingBox browsing a library on a television"
      width="1280"
      class="w-full rounded-t-xl border border-b-0 border-edge"
    />
    <button id="heroToggle"
            class="absolute bottom-4 right-8 rounded-md border border-edge bg-base/80 px-3 py-1 text-xs text-muted">
      Pause
    </button>
  </div>
```

And append this island to the same file's `<script>` section, as a separate `<script>` block:

```astro
<script>
  // Island 5 of 5: hero playback control. An animated WebP cannot be paused
  // directly, so pausing swaps in the first frame, held as a still.
  const loop = document.getElementById('heroLoop') as HTMLImageElement | null;
  const toggle = document.getElementById('heroToggle');
  const moving = '/hero-loop.webp';
  const still = '/hero-still.webp';
  let playing = true;

  // Honour a reduced-motion preference without being asked.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && loop) {
    loop.src = still;
    playing = false;
    if (toggle) toggle.textContent = 'Play';
  }

  toggle?.addEventListener('click', () => {
    if (!loop) return;
    playing = !playing;
    loop.src = playing ? moving : still;
    toggle.textContent = playing ? 'Pause' : 'Play';
  });
</script>
```

- [ ] **Step 5: Produce the still fallback**

```bash
node -e "import('sharp').then(async ({default:s})=>{await s('src/assets/hero-frames/f000.png').resize({width:1280}).webp({quality:80}).toFile('public/hero-still.webp');console.log('ok')})"
```

Expected: `ok`

- [ ] **Step 6: Keep the frames out of the repo**

Append to `.gitignore`:

```
# hero loop source frames — the encoded output in public/ is what ships
src/assets/hero-frames/
```

- [ ] **Step 7: Build and commit**

```bash
npx astro build
git add -A
git commit -m "feat: animated hero loop encoded with sharp"
```

---

## Task 13: Docs

**Files:**
- Create: `src/content.config.ts`, `src/layouts/Doc.astro`, `src/pages/docs/index.astro`, `src/pages/docs/[...slug].astro`
- Create: `src/content/docs/getting-started.mdx`, `first-run.mdx`, `your-library.mdx`, `metadata.mdx`, `on-a-tv.mdx`, `troubleshooting.mdx`
- Test: `tests/docs.test.ts`

**Interfaces:**
- Consumes: `Base.astro`.
- Produces: the `docs` collection with schema `{ title: string; description: string; order: number }`.

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

export const collections = { docs };
```

- [ ] **Step 2: Write `src/layouts/Doc.astro`**

```astro
---
import Base from './Base.astro';
import { getCollection } from 'astro:content';

interface Props { title: string; description: string }
const { title, description } = Astro.props;

const all = (await getCollection('docs')).sort((a, b) => a.data.order - b.data.order);
const path = Astro.url.pathname;
---
<Base title={`${title} — EverythingBox docs`} description={description}>
  <div class="grid gap-12 py-14 md:grid-cols-[200px_1fr]">
    <nav class="text-sm">
      <p class="mb-3 font-semibold uppercase tracking-widest text-accent">Docs</p>
      <ul class="space-y-2">
        {all.map((d) => (
          <li>
            <a href={`/docs/${d.id}`}
               class={path === `/docs/${d.id}` ? 'text-accent' : 'text-muted hover:text-ink'}>
              {d.data.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <article class="max-w-2xl">
      <h1 class="display text-4xl">{title}</h1>
      <p class="mt-3 text-muted">{description}</p>
      <div class="doc-prose mt-8"><slot /></div>
    </article>
  </div>
</Base>

<style is:global>
  /* Long-form pages drop the glow, widen line-height, and use gold only for links. */
  .doc-prose { line-height: 1.75; }
  .doc-prose h2 { margin-top: 2.25rem; font-size: 1.35rem; font-weight: 700; }
  .doc-prose h3 { margin-top: 1.75rem; font-size: 1.1rem; font-weight: 600; }
  .doc-prose p, .doc-prose ul, .doc-prose ol { margin-top: 1rem; color: var(--color-muted); }
  .doc-prose ul { list-style: disc; padding-left: 1.25rem; }
  .doc-prose ol { list-style: decimal; padding-left: 1.25rem; }
  .doc-prose li { margin-top: 0.35rem; }
  .doc-prose a { color: var(--color-accent); text-decoration: underline; }
  .doc-prose code {
    background: var(--color-surface); border: 1px solid var(--color-edge);
    border-radius: 4px; padding: 0.1em 0.35em; font-size: 0.9em;
  }
  .doc-prose pre {
    margin-top: 1rem; overflow-x: auto; border-radius: 8px;
    border: 1px solid var(--color-edge); background: var(--color-surface); padding: 1rem;
  }
  .doc-prose pre code { border: 0; background: none; padding: 0; }
</style>
```

- [ ] **Step 3: Write `src/pages/docs/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import Doc from '../../layouts/Doc.astro';

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<Doc title={entry.data.title} description={entry.data.description}>
  <Content />
</Doc>
```

- [ ] **Step 4: Write `src/pages/docs/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';

const docs = (await getCollection('docs')).sort((a, b) => a.data.order - b.data.order);
---
<Base title="Documentation — EverythingBox" description="Getting started with EverythingBox, and what to do when something is not working.">
  <section class="pt-20 pb-10">
    <h1 class="display text-5xl">Documentation</h1>
  </section>
  <div class="grid gap-4 pb-20 md:grid-cols-2">
    {docs.map((d) => (
      <a href={`/docs/${d.id}`} class="rounded-lg border border-edge bg-surface p-5 hover:border-accent">
        <h2 class="font-semibold">{d.data.title}</h2>
        <p class="mt-1 text-sm text-muted">{d.data.description}</p>
      </a>
    ))}
  </div>
</Base>
```

- [ ] **Step 5: Write the six docs pages**

`src/content/docs/getting-started.mdx`:

````mdx
---
title: Getting started
description: Install EverythingBox and open your first file.
order: 1
---

## Install it

Pick your platform on the [download page](/download).

- **Windows** — unzip anywhere and run the application inside. There is no installer; the
  folder *is* the application.
- **macOS** — the build is unsigned, so the first launch needs a right-click on the app and
  **Open** rather than a double-click. After that it opens normally.
- **Linux** — mark the AppImage executable and run it:

  ```bash
  chmod +x ./*.AppImage
  ./*.AppImage
  ```

- **Android and Android TV** — sideload the APK. It is not distributed through Google Play,
  because the app downloads emulator cores at runtime and Play's policy does not allow that.
- **iOS and iPadOS** — the build is unsigned. Sideload it with AltStore or Sideloadly, which
  re-sign it with your own Apple ID.

## Open something

Everything is reachable from the home screen. Open a video, an audio file, a game, or a
document, and the right view takes over — the same application, not a separate player.

## Next

- [Your first run](/docs/first-run)
- [Adding your library](/docs/your-library)
````

`src/content/docs/first-run.mdx`:

````mdx
---
title: Your first run
description: What to expect the first time you open EverythingBox.
order: 2
---

## Nothing is configured for you

EverythingBox arrives empty on purpose. It ships no media, no games, no BIOS files, and it is not
pointed at any source. What it shows you is what you give it.

## Pick a theme

Six themes ship with the app and you can change between them whenever you like — a cross-media
bar, a poster grid, a three-pane browser, and others. None of them changes what the app can do,
only how it looks and how you move around it.

## Everything works with a remote

The whole interface is navigable with a D-pad, which is what makes the app usable on a
television. A keyboard, a mouse, a game controller and a TV remote are all first-class.

## Next

- [Adding your library](/docs/your-library)
- [Artwork and metadata](/docs/metadata)
````

`src/content/docs/your-library.mdx`:

````mdx
---
title: Adding your library
description: Point EverythingBox at the files you already have.
order: 3
---

## Files stay where they are

EverythingBox scans folders in place. It does not rename your files, move them, or reorganise
them into a structure of its choosing. If you stop using the app, your library is exactly as you
left it.

## Point it at your folders

In settings, add the folders holding your video, music, books and games. The app scans them and
builds a library, matching entries against catalog metadata so a directory of filenames becomes
something you can browse by poster.

## Games

ROMs live in your ROMs folder. The app identifies the system from the file, then loads the right
core — downloading it if you do not have it yet.

For modern consoles the app instead installs the established standalone emulator from its own
official source and launches your game with it. See [Emulation](/emulation) for the full list of
systems and which route each one takes.

## PC games you already own

Installed titles from Steam, Epic, GOG and Battle.net can be imported so they appear beside
everything else, launched from the same interface.
````

`src/content/docs/metadata.mdx`:

````mdx
---
title: Artwork and metadata
description: Turn a folder of files into a library with posters and descriptions.
order: 4
---

## Where artwork comes from

Posters, logos, banners and descriptions arrive through catalog addons rather than being built
into the app. EverythingBox ships with a catalog addon covering films, shows, games and music.

## Adding your keys

Those catalog services require your own API keys, which are free to obtain. Open the addon's
configuration screen and paste them in. Until you do, the app works fine — you simply see
filenames instead of artwork.

Your keys are stored in the app's own configuration and are never sent anywhere except to the
service they belong to.

## Matching

Once keys are in place, the app matches your local files against catalog entries. A matched item
gains its artwork, description and season or track structure, while continuing to play the file
on your own disk.
````

`src/content/docs/on-a-tv.mdx`:

````mdx
---
title: On a television
description: Running EverythingBox on Android TV, Shield and Google TV.
order: 5
---

## The same app

The Android build carries a TV launcher entry alongside the phone one, so it appears on the home
screen of Android TV devices, Shield and Google TV, and it is driven entirely with the remote.

## What runs on a TV

The media hub in full — video, audio, comics, books, PDFs, and the addon catalog — plus emulator
cores loaded in-process. Game controllers work over Bluetooth.

## What does not

The standalone emulators for modern consoles are desktop-only. Android cannot launch downloaded
desktop executables, so those systems are unavailable there. Everything the built-in cores cover
still works.

## Getting it installed

Sideload the APK. It is not on Google Play: the app downloads emulator cores at runtime, which
Play's policy does not permit.
````

`src/content/docs/troubleshooting.mdx`:

````mdx
---
title: Troubleshooting
description: What to check when something is not working.
order: 6
---

## macOS refuses to open it

The build is unsigned. Right-click the application and choose **Open**, then confirm. A
double-click will keep being refused until you have done this once.

## A game will not start

Two usual causes:

- **The core is missing.** Cores download on demand; check the machine has network access the
  first time you open a given system.
- **The dump is wrong.** Some systems are strict about the file being a correct dump. A file
  that plays elsewhere but not here is usually a format the core does not accept rather than a
  fault in the app.

Systems needing BIOS files will not run without them. EverythingBox does not supply them.

## No artwork, just filenames

The catalog addon needs your own API keys. See [Artwork and metadata](/docs/metadata).

## A video plays with no sound, or the wrong track

Files with multiple audio tracks default to the first. Switch tracks from the playback controls.

## Reporting a problem

Open an issue on the
[GitHub repository](https://github.com/cubman3134/EverythingBox/issues), and say which platform
and which version you are on — the version is shown on the download page and in settings.
````

- [ ] **Step 6: Write the failing test `tests/docs.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';

describe('docs', () => {
  const dir = 'src/content/docs';
  const files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));

  it('has all six pages', () => {
    expect(files).toHaveLength(6);
  });

  it('gives every page a unique order', () => {
    const orders = files.map((f) => {
      const m = readFileSync(`${dir}/${f}`, 'utf8').match(/^order:\s*(\d+)$/m);
      if (!m) throw new Error(`${f} has no order`);
      return Number(m[1]);
    });
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('builds a page for every doc', () => {
    for (const f of files) {
      const slug = f.replace(/\.mdx$/, '');
      expect(existsSync(`dist/docs/${slug}/index.html`), `dist/docs/${slug}`).toBe(true);
    }
  });

  it('never tells the reader an unverified feature works', () => {
    for (const f of files) {
      const body = readFileSync(`${dir}/${f}`, 'utf8').toLowerCase();
      expect(body, `${f} discusses casting`).not.toMatch(/\bchromecast\b|\bdlna\b/);
      expect(body, `${f} discusses netplay`).not.toMatch(/\bnetplay\b/);
    }
  });
});
```

- [ ] **Step 7: Run to verify it fails, then passes**

```bash
npx vitest run tests/docs.test.ts
```

Expected: FAIL on the `dist/docs/...` assertion (nothing built yet).

```bash
npm test
```

Expected: PASS, all suites.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: docs collection and six documentation pages"
```

---

## Task 14: Link checking, README, and final verification

**Files:**
- Create: `tools/check-links.mjs`, `README.md`
- Modify: `package.json` scripts

**Interfaces:**
- Consumes: the built `dist/`.
- Produces: `npm run check` — the single command that decides whether the site is shippable.

- [ ] **Step 1: Write `tools/check-links.mjs`**

```js
// Post-build link check. Internal links must resolve to a built file; external
// links are checked for reachability but only warn, since the network is not
// this repo's responsibility.
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
const internal = new Set();
const external = new Set();

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/href="([^"#?]+)/g)) {
    const href = m[1];
    if (href.startsWith('http')) external.add(href);
    else if (href.startsWith('/')) internal.add(href);
  }
}

let broken = 0;
for (const href of internal) {
  const clean = href.replace(/\/$/, '');
  const candidates = [
    join(DIST, clean, 'index.html'),
    join(DIST, clean),
    join(DIST, `${clean}.html`),
  ];
  if (!candidates.some(existsSync)) {
    console.error(`BROKEN internal link: ${href}`);
    broken++;
  }
}

console.log(`checked ${internal.size} internal links across ${files.length} pages`);

for (const url of external) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (!res.ok) console.warn(`WARN external ${res.status}: ${url}`);
  } catch (err) {
    console.warn(`WARN external unreachable: ${url} (${err.message})`);
  }
}

if (broken > 0) {
  console.error(`\n${broken} broken internal link(s)`);
  process.exit(1);
}
console.log('links ok');
```

- [ ] **Step 2: Wire the scripts in `package.json`**

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "gen": "node tools/gen-catalog.mjs",
  "test": "astro build && vitest run",
  "check": "astro build && astro check && vitest run && node tools/check-links.mjs"
}
```

- [ ] **Step 3: Run the check and fix what it finds**

```bash
npm run check
```

Expected: `astro check` reports 0 errors, every Vitest suite passes, and the link checker prints `links ok`. Fix any broken internal link rather than deleting the assertion.

- [ ] **Step 4: Write `README.md`**

````markdown
# EverythingBox website

The showcase site for [EverythingBox](https://github.com/cubman3134/EverythingBox), a native
cross-platform media hub.

Astro 5, Tailwind v4, static output. No host-specific configuration — `dist/` deploys anywhere.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
```

## Verify

```bash
npm run check      # build + astro check + tests + link check
```

`npm run check` is the gate. It must pass before anything ships.

## Regenerating content

The systems and emulator lists are generated from the app repository so they cannot drift:

```bash
npm run gen        # reads $EB_APP_REPO, defaults to C:/Users/cubma/Project Goliath
```

Screenshots are captured from the running application. See [tools/README.md](tools/README.md).

## Rules this repo holds itself to

- Every factual claim traces to the app repository.
- Casting and LAN netplay are built but untested on hardware, and are labelled as such. Do not
  quietly promote them.
- The addon system is described as extensibility. No indexer, tracker, or debrid provider is named.
- No API key, token, or personal library path ever enters this repository.
````

- [ ] **Step 5: Verify the privacy gate holds across the whole tree**

```bash
git grep -inE "apikey|api_key|refresh_token|client_secret|C:\\\\Users\\\\cubma" -- . ':!docs/superpowers' ':!README.md' || echo "clean"
```

Expected: `clean`, or only matches inside `tools/gen-catalog.mjs` and `tools/capture.py` where a **path** to the app repo is a documented default. No key, token, or secret may appear.

- [ ] **Step 6: Final visual pass**

```bash
npm run dev
```

Walk every page at a desktop width and at 375px: `/`, `/features`, `/download`, `/emulation`, `/addons`, `/screenshots`, `/docs` and one docs page. Confirm no page scrolls horizontally, the gold glow appears at most once per section, and every screenshot loads.

- [ ] **Step 7: Commit and push**

```bash
git add -A
git commit -m "feat: link checking, README, and the check gate"
git push
```

---

## Verification checklist

The site is done when all of these hold:

- [ ] `npm run check` exits 0.
- [ ] `dist/` contains all seven pages plus six docs pages.
- [ ] Every download link resolves to a real release asset; no `-pdb.zip` is offered.
- [ ] Every screenshot in `screenshots.ts` exists and renders.
- [ ] No page mentions `MyMediaVault` outside a release asset filename.
- [ ] Casting and netplay appear only with their untested-on-hardware caveat.
- [ ] No indexer, tracker, or debrid provider is named anywhere.
- [ ] No API key, token, or personal path is present in the committed tree.
- [ ] No page scrolls horizontally at 375px.

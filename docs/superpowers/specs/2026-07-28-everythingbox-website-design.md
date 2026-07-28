# EverythingBox website — design

Date: 2026-07-28
Status: approved (design), pending implementation plan

## Goal

A showcase website for **EverythingBox**, the Qt6/C++ cross-platform media hub. It has to make
a stranger understand what the app is within one screen, show them it is real via screenshots
of the running app, and get them to a download that works on their platform.

The site covers the **app only**. EverythingBoxServer and Allarr are separate projects and get
no pages here; the app's own addon documentation may link to the server repo where relevant.

Working locally is the immediate target. Deployment is deliberately deferred, and nothing in the
build may assume a particular host.

## Non-goals

- Light mode. The site is dark-only in v1. Adding a light theme doubles the screenshot treatment
  work for no clear gain on a media-hub site.
- A blog, changelog, or news feed. GitHub Releases already carries that.
- Any server-rendered or dynamic behaviour. The output is static files.
- Pages for EverythingBoxServer or Allarr.

## Source of truth

Content is derived from the app repo at `C:\Users\cubma\Project Goliath`, not invented:

| Claim on the site | Where it comes from |
|---|---|
| Feature list | `README.md`, `native/README.md` |
| Platform matrix + install caveats | `README.md` download table |
| Systems list (~70) | `native/src/core/SystemCatalog.h` |
| Standalone emulators (15) | `native/src/core/EmulatorRegistry.h` |
| Themes (6) | `native/registry/everythingbox-themes/themes2/` |
| Addon contract | `native/README.md`, `native/addons/aiocatalog/` |
| Product name | `native/src/core/AppBrand.h` (`EverythingBox`; the `MyMediaVault` rename is complete) |
| Release assets + version | GitHub Releases for `cubman3134/EverythingBox` |

### Accuracy rule

Every claim traces to one of the above. Features that are built but **not verified on hardware** —
casting (Chromecast/DLNA) and LAN netplay — are either omitted or explicitly marked as
unverified. The site does not claim they work.

### Framing rule

The addon system is presented as **extensibility**: sandboxed JavaScript media-source addons, a
bundled AIO Catalog addon for metadata/artwork, and the ability to install your own. Following the
stance EverythingBoxServer's README already takes, the site states plainly that the project ships
the engine and not the sources. No indexer, tracker, or debrid provider is named as a selling point.

## Information architecture

Seven pages.

### `/` — Home
Hero (looping capture + headline + primary download CTA) → a short "one app, every
medium" strip → six feature blocks, each anchored by one real screenshot (Video · Games · Music ·
Books & comics · Addons · Everywhere/TV) → theme showcase → download CTA → condensed FAQ → footer.

### `/features`
The full inventory, grouped: Playback · Library · Emulation · Reading · Extensibility ·
Sync & social · Platforms. Rendered from `src/data/features.ts`.

### `/download`
One card per platform (Windows x64, macOS arm64, Linux x86_64, Android/Android TV arm64,
iOS arm64) carrying the release asset link, version, date, size, and the honest install caveat
(unsigned macOS needs right-click → Open; iOS needs AltStore/Sideloadly; Android is sideload).
A build-from-source section reproduces the CMake invocation from `native/README.md`.

### `/emulation`
The systems table, an explainer on in-process libretro cores versus the auto-downloaded standalone
emulators (and why standalone is desktop-only), controllers (remapping, ports 1–4, rumble, turbo),
save states and cloud saves, and RetroAchievements. States plainly that the app ships no ROMs
and no BIOS files.

### `/addons`
What an addon is; the sandbox (Duktape, per-call execution timeout, invocations off the GUI
thread); the bundled AIO Catalog; how to install a `.addon`; and a short guide to writing one
(`manifest.json` + `main.js`, the host API surface, catalogs and drill-down).

### `/screenshots`
The full gallery. Filterable by theme and by media type, with a lightbox.

### `/docs`
MDX with a sidebar: getting started · first run · pointing it at your library · metadata API keys ·
using it on a TV/with a remote · troubleshooting · FAQ.

## Architecture

**Stack:** Astro 5 with static output, Tailwind v4, MDX for docs. Node 24 / npm 11 are present.

**Two content mechanisms:**

- `src/content/docs/*.mdx` — a typed Astro content collection with a frontmatter schema
  (`title`, `description`, `order`). Drives `/docs` and its sidebar.
- `src/data/*.ts` — typed modules, each a single exported array, for `features`, `platforms`,
  `systems`, `emulators`, `themes`, and `screenshots`. Pages render from these. The systems list
  alone is ~70 entries; embedding that in markup guarantees it goes stale.

**Download links.** Hybrid, chosen over two alternatives:

- *Chosen:* hrefs point at GitHub's `/releases/latest/download/<asset>` permalinks — never stale,
  no JS, no API dependency at request time. A **build-time** call to the Releases API fills in the
  version string, publish date, and asset sizes, and its result is cached to
  `src/data/release.fallback.json`, which is committed. If the API is unreachable at build time the
  fallback is used, so the build never fails offline.
- *Rejected:* hardcoding version numbers (goes stale on every release); client-side fetch
  (needs JS, flashes empty state, fails without network).

**Images.** Astro's `<Image>` component emits AVIF/WebP with responsive `srcset`; everything below
the fold is lazy. Source captures live in `src/assets/shots/`.

**Client JS.** Five small vanilla islands only: gallery lightbox, gallery filter, mobile nav, hero
playback control, and platform detection for the hero CTA. No framework runtime ships to the browser.

The hero CTA renders, with no JavaScript, as **"Download"** linking to `/download` — correct for
every visitor. The platform island only *upgrades* that label to the visitor's platform (e.g.
"Download for Windows") and points it straight at that asset. Detection failure or a disabled-JS
visitor is not a broken state; it is the default.

### Component boundaries

Each of these has one job, a defined prop interface, and can be understood without reading the
others:

- `layouts/Base.astro` — head, fonts, nav, footer, theme tokens.
- `layouts/Doc.astro` — wraps `Base`, adds the docs sidebar and prose styles.
- `components/Hero.astro` — the looping capture, headline, and download CTA.
- `components/FeatureBlock.astro` — one screenshot-anchored feature section (alternating side).
- `components/PlatformCard.astro` — one download card; takes a `platforms.ts` entry.
- `components/SystemsTable.astro` — renders `systems.ts`.
- `components/Gallery.astro` + `components/Lightbox.astro` — the screenshots page.
- `components/Glow.astro` — the signature gold radial, so its usage stays countable.

## Visual system

Direction A ("Cinema"), derived from the app icon: a dark navy box with warm gold light spilling
out and cream lettering.

- Tokens: base `#0d1424`, surface `#131c33`, accent `#e8b13a`, text `#f6f1e4`, muted `#a9b3c9`.
- One self-hosted variable sans. Tight negative letter-spacing at display sizes only; body text
  keeps normal tracking.
- The gold radial glow is the signature motif: once behind the hero shot, and at most once per
  feature section. Long-form pages (`/docs`, the systems table) drop it entirely, widen
  line-height, and use gold only for links and active nav state.
- Screenshots sit on the navy surface with a thin `#2c3856` border and no drop shadow, so the app's
  own art supplies the contrast.

## Screenshot and video pipeline

`tools/capture.py`, living in the **website** repo, drives the already-deployed app through its
UI-test channel: the app is launched with `EB_UITEST=1`, then the script issues scripted `keys` and
`shot` commands. This captures the window while it is occluded, so it never steals focus and never
uses synthetic keystrokes.

**Target captures (~18):** the six theme homes (Default/XMB, Grid, Lumen, Midnight, Channels,
Triple); a movie detail with real artwork; a show drilled into its episodes; now-playing audio with
the playlist panel; video playback showing the subtitle chip; the emulator grid; a game actually
running; the book, comic, and PDF readers; downloads; settings; controller remap.

Raw captures land in `src/assets/shots/`, are cropped and resized with `sharp`, and are committed.

**Hero loop.** `ffmpeg` is not installed on this machine. The default plan is to capture a frame
sequence (~6–8s) and encode it to an **animated WebP via `sharp`**, which adds no system
dependency. It ships with a static poster fallback and respects `prefers-reduced-motion`. If the
result is visually poor or too heavy, that is escalated to the user before installing ffmpeg to
produce mp4/webm instead.

### Privacy gate

`C:\EverythingBox-app\everythingbox.ini` contains live TMDB, IGDB, SteamGridDB, ScreenScraper, and
Comic Vine API keys, a TorBox token, and a Google OAuth refresh token. **No part of that file, and
no secret from it, may be copied into the website repo.** The capture script reads it only in place,
as the running app's own config. Every capture is reviewed for personal library paths, filenames,
and account names before it is committed.

## Repository and local development

- Location: `C:\Users\cubma\source\repos\EverythingBoxWebsite`.
- `git init`, then a **private** GitHub repo `cubman3134/EverythingBoxWebsite`.
- `npm run dev` serves on `localhost:4321`; `npm run build` emits static `dist/`.
- `.gitignore`: `node_modules/`, `dist/`, `.astro/`, `.superpowers/`.
- Deployment is deferred. The static `dist/` suits Cloudflare Pages, GitHub Pages, or any static
  host; `astro.config.mjs` keeps `site` configurable and sets no host-specific adapter.

## Error handling

The site is static, so runtime error handling is minimal by construction. The failure modes that
matter are at build time and in the capture tooling:

- **Releases API unreachable at build time** → fall back to the committed
  `release.fallback.json` and emit a build warning. Never fail the build.
- **A screenshot referenced by `screenshots.ts` is missing** → fail the build loudly. A silently
  missing image is worse than a broken build.
- **Capture script cannot reach the uitest pipe** (app not running, or not launched with
  `EB_UITEST=1`) → exit with a clear message naming the fix. It must not fall back to synthetic
  input or foreground automation.
- **Capture produces an unexpected UI state** (the scripted key sequence drifted) → the script
  asserts on the state JSON before each `shot` and reports which target failed, rather than
  committing a wrong screenshot.

## Verification

Done means all of:

1. `npm run build` completes green.
2. `astro check` reports no errors.
3. Every internal link resolves against the built `dist/`, and every release permalink returns 200.
4. Every image referenced by data has a file on disk (enforced by the build, per above).
5. A visual pass at desktop and mobile widths.
6. No secret, token, or personal library path appears anywhere in the committed tree.

## Open questions

None blocking. Two deferred by decision: light mode (out of scope for v1) and the deployment
target (chosen when the site is actually deployed).

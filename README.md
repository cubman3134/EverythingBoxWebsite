# EverythingBox website

The showcase site for [EverythingBox](https://github.com/cubman3134/EverythingBox), a native
cross-platform media hub.

Astro 7, Tailwind v4, static output. No host-specific configuration — `dist/` deploys anywhere.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
```

## Verify

```bash
npm run check
```

That is the gate: build → type check → tests → link check. It must pass before anything ships.

## Deploy

Pushing to `main` publishes to GitHub Pages at <https://everything-box.com> via
`.github/workflows/deploy.yml`. The workflow runs `npm run check` first, so a failing
gate blocks the deploy rather than shipping a broken site.

The domain is bound by `public/CNAME`; deleting that file would move the site back to
`cubman3134.github.io/EverythingBoxWebsite`. DNS lives at GoDaddy: four apex `A` records
pointing at GitHub's Pages IPs, plus `www` as a `CNAME` to `cubman3134.github.io`.

## Layout

| Path | What it is |
|---|---|
| `src/pages/` | The seven pages. Thin — they render from `src/data/`. |
| `src/data/` | Typed content modules. One source of truth per list. |
| `src/content/docs/` | The docs pages, as MDX. |
| `src/assets/shots/` | Screenshots captured from the running app. |
| `src/lib/` | Release resolution and the screenshot loader. |
| `tools/` | Capture harness, catalog generator, hero encoder, link checker. |

## Regenerating content

The systems and emulator lists are generated from the app repository so they cannot drift:

```bash
npm run gen        # reads $EB_APP_REPO, defaults to C:/Users/cubma/Project Goliath
```

The generated files are committed, so the site build never needs the app repo present.

Screenshots and the hero animation are captured from the running application — see
[tools/README.md](tools/README.md).

## Things that will surprise you

- **`npm run build` wraps `astro build`.** On Node 24 + Windows, astro writes a correct `dist/`
  and then dies in libuv teardown, poisoning the exit code. `tools/build.mjs` forgives that exit
  *only* when astro reported `Complete!` and `dist/` is intact; a real build break still fails.
  `npm run build:raw` is the unwrapped command.
- **Download links are resolved at build time** by matching the release asset *suffix*
  (`-windows-x64.zip`), not the whole filename. The published v0.5.0 assets are still named
  `MyMediaVault-*` because the app's rename landed after that release was cut; suffix matching
  keeps the site correct before and after the next release. A missing asset renders a
  "see all releases" card, never a broken link.
- **A screenshot named in `screenshots.ts` but missing on disk fails the build**, by design, from
  `src/lib/shots.ts`. The whole manifest is validated at module load, not lazily per lookup.

## Rules this repo holds itself to

- Every factual claim traces to the app repository.
- Casting and LAN netplay are built but untested on hardware, and are labelled as such. Do not
  quietly promote them.
- Two themes ship with the app. The other four live in the theme registry and are installed from
  the in-app gallery — do not claim six are bundled.
- The addon system is described as extensibility, and the site states that the project ships the
  engine and not the sources. No indexer, tracker, or debrid provider is named.
- No API key, token, or personal library path ever enters this repository.

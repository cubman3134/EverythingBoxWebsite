# Website tooling

## `capture.py` — screenshots

The app screenshots itself over its UI-test channel, so no window ever needs focus and
nothing synthesises keystrokes at the OS level.

1. Launch the deployed app with the test channel enabled:

   ```powershell
   $env:EB_UITEST = "1"; Start-Process "C:\EverythingBox-app\EverythingBox.exe"
   ```

2. Check the channel is live before capturing anything:

   ```bash
   python tools/capture.py --state
   ```

3. Capture:

   ```bash
   python tools/capture.py               # every target
   python tools/capture.py movie-detail  # one target
   python tools/capture.py --frames      # the hero-loop frame sequence
   ```

Output lands in `src/assets/shots/`.

### Review every image before committing

The running app is pointed at a real library and a real account. Check each capture for
filesystem paths, personal filenames, account names and email addresses before it goes
into git. The Appearance settings screen in particular renders the themes folder path
and the theme author's account name — do not capture it.

### The target paths are stateful and fragile

`TARGETS` encodes the navigation to each screen, but the app's home screen remembers
where you last were, and **the two installed themes have completely different layouts**
(Channels is a tile grid with corner buttons; Triple is an XMB cross with categories in
a row). A sequence derived under one theme will not work under the other.

Each target asserts on the app's reported state before shooting, so a drifted sequence
prints `SKIP` instead of writing the wrong screenshot. Treat a SKIP as "re-derive this
path", not as a flake.

To derive a path by hand, drive the app and watch the state:

```bash
python "$EB_APP_REPO/native/tools/uitest.py" key right
python "$EB_APP_REPO/native/tools/uitest.py" state
```

### Not yet automated

`NOT_YET_AUTOMATED` in `capture.py` lists the screens the plan wanted that this harness
cannot yet reach — mostly views that need media actually playing (video, music,
a booted ROM) or readers that did not open from the home column. The list is in the
code so the gap stays visible.

## `gen-catalog.mjs` — systems and emulators

Regenerates `src/data/systems.ts` and `src/data/emulators.ts` from the app repo, so the
site's lists cannot drift from the application.

```bash
npm run gen        # reads $EB_APP_REPO, defaults to C:/Users/cubma/Project Goliath
```

The output is committed. The site build never needs the app repo present.

## `make-hero-loop.mjs` — the hero animation

Encodes `src/assets/hero-frames/*.png` into an animated WebP with sharp. `ffmpeg` is
deliberately not a dependency.

```bash
node tools/make-hero-loop.mjs
```

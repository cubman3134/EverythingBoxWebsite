// Frame sequence -> animated WebP, using sharp's multi-page ("toilet roll") input.
// ffmpeg is deliberately NOT a dependency of this project.
//
//   node tools/make-hero-loop.mjs
//
// Produces public/hero-loop.webp and public/hero-still.webp (the poster fallback).
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = 'src/assets/hero-frames';
const OUT = 'public/hero-loop.webp';
const STILL = 'public/hero-still.webp';
const WIDTH = 1100;
// The app's navigation is discrete — a selection stepping across a grid — so the loop
// reads as deliberate movement rather than video. One frame per step, held long enough
// to register. (The capture takes several identical frames per step; they are deduped
// below, because libwebp would silently collapse them anyway and leave the timing wrong.)
const DELAY = 520; // ms per distinct step
const MAX_BYTES = 2 * 1024 * 1024;

const frames = readdirSync(SRC)
  .filter((f) => f.endsWith('.png'))
  .sort();
if (frames.length < 10) throw new Error(`only ${frames.length} frames in ${SRC}`);

// Normalise every frame to the same width and decode to RAW pixels. The frames are
// then concatenated into one tall "toilet roll" buffer, which sharp reads back as an
// animation given `pages` + `pageHeight`. This has to be RAW: an encoded PNG cannot
// carry the n-pages metadata sharp looks for, and passing one fails with
// `vips_image_get: field "n-pages" not found`.
const resized = await Promise.all(
  frames.map((f) =>
    sharp(join(SRC, f))
      .resize({ width: WIDTH })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ),
);

const height = resized[0].info.height;
const channels = resized[0].info.channels;
if (resized.some((r) => r.info.height !== height)) {
  throw new Error('frames differ in height after resize — the window was resized mid-capture');
}

// Drop consecutive identical frames. The capture holds each navigation step for several
// shots; without this, libwebp collapses them itself and the per-frame delay no longer
// corresponds to anything, so the loop plays far faster than intended.
const distinct = resized.filter(
  (r, i) => i === 0 || !r.data.equals(resized[i - 1].data),
);
console.log(`${resized.length} frames captured, ${distinct.length} distinct`);
if (distinct.length < 4) {
  throw new Error(
    `only ${distinct.length} distinct frames — the capture did not move. ` +
      `Re-run tools/capture.py --frames with navigation between shots.`,
  );
}

const stacked = Buffer.concat(distinct.map((r) => r.data));

// pageHeight goes INSIDE raw — as a sibling option it is ignored and the encode fails
// with `vips_image_get: field "n-pages" not found`.
await sharp(stacked, {
  raw: { width: WIDTH, height: height * distinct.length, channels, pageHeight: height },
})
  .webp({ quality: 60, effort: 5, loop: 0, delay: DELAY })
  .toFile(OUT);

// Poster fallback: the first frame, shown when motion is not wanted.
await sharp(join(SRC, frames[0])).resize({ width: WIDTH }).webp({ quality: 80 }).toFile(STILL);

const bytes = statSync(OUT).size;
console.log(
  `wrote ${OUT} — ${distinct.length} frames at ${WIDTH}px, ${(bytes / 1024 / 1024).toFixed(2)} MB`,
);
console.log(`wrote ${STILL}`);

if (bytes > MAX_BYTES) {
  console.error(
    `\n[hero] ${(bytes / 1024 / 1024).toFixed(2)} MB exceeds the ${MAX_BYTES / 1024 / 1024} MB ` +
      `budget. Lower WIDTH or quality, drop frames, or escalate to ffmpeg/mp4.`,
  );
  process.exit(1);
}

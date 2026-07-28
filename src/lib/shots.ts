import type { ImageMetadata } from 'astro';
import { screenshots } from '../data/screenshots';

// Eager glob: a screenshot named in the manifest but absent on disk must fail the
// BUILD. A silently missing image is worse than a broken build.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/shots/*.png', {
  eager: true,
});

const key = (file: string) => `../assets/shots/${file}`;

// Validate the WHOLE manifest at module load, not lazily per lookup. Checking only the
// shots a page happens to request means an entry no page references yet can name a file
// that does not exist and still build clean — which defeats the point of the guard.
const missing = screenshots.filter((s) => !files[key(s.file)]);
if (missing.length > 0) {
  throw new Error(
    `[shots] ${missing.length} screenshot(s) named in screenshots.ts are not on disk:\n` +
      missing.map((s) => `  - "${s.id}" -> src/assets/shots/${s.file}`).join('\n') +
      `\nCapture them with tools/capture.py, or remove the entries.`,
  );
}

export function shotById(id: string): { src: ImageMetadata; caption: string } {
  const meta = screenshots.find((s) => s.id === id);
  if (!meta) throw new Error(`[shots] no screenshot with id "${id}"`);
  const mod = files[key(meta.file)];
  if (!mod) throw new Error(`[shots] "${id}" points at ${meta.file}, which is not on disk`);
  return { src: mod.default, caption: meta.caption };
}

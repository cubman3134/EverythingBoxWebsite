import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { mediaKinds } from '../src/data/mediaKinds';
import { features } from '../src/data/features';

// This suite exists because the site shipped advertising six kinds of media while the
// app shipped eight — Audiobooks and Manga were missing from every page. The generated
// list is now the source of truth; these tests make sure the prose keeps up with it.
describe('media kinds', () => {
  it('carries every catalog the bundled addon ships', () => {
    expect(mediaKinds).toHaveLength(8);
  });

  it('includes the two that were missing', () => {
    const names = mediaKinds.map((k) => k.name);
    expect(names).toContain('Audiobooks');
    expect(names).toContain('Manga');
  });

  it('has no duplicate types', () => {
    expect(new Set(mediaKinds.map((k) => k.type)).size).toBe(mediaKinds.length);
  });
});

function allHtml(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) allHtml(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

describe('the site actually says so', () => {
  it('names audiobooks and manga on the home page', () => {
    const home = readFileSync('dist/index.html', 'utf8').toLowerCase();
    expect(home, 'home page never mentions audiobooks').toContain('audiobook');
    expect(home, 'home page never mentions manga').toContain('manga');
  });

  it('names them in the feature inventory too', () => {
    const all = features.map((f) => `${f.title} ${f.body}`).join(' ').toLowerCase();
    expect(all).toContain('audiobook');
    expect(all).toContain('manga');
  });

  it('never advertises a count that contradicts the generated list', () => {
    // The home page prints mediaKinds.length; guard against someone hardcoding it back.
    const home = readFileSync('dist/index.html', 'utf8');
    expect(home).toContain(`>${mediaKinds.length}</p>`);
    expect(home).not.toMatch(/>6<\/p>\s*<p[^>]*>\s*kinds of media/);
  });


  it('says plainly that addons can add catalogs beyond the eight', () => {
    const home = readFileSync('dist/index.html', 'utf8').toLowerCase();
    // The point the home page has to land: the shipped set is not the ceiling.
    expect(home).toContain('podcasts');
    expect(home).toContain('magazines');
    expect(home).toMatch(/any.{0,12}catalog/);
  });

  it('does not claim live TV or sports, which no bundled catalog provides', () => {
    // The app has home tiles for these, but they are filled by addons the user installs —
    // nothing ships that provides them, so the site must not advertise them.
    const types = mediaKinds.map((k) => k.type);
    expect(types).not.toContain('livetv');
    for (const f of allHtml('dist')) {
      const html = readFileSync(f, 'utf8').toLowerCase();
      expect(html, `${f} advertises live TV`).not.toMatch(/\blive tv\b/);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { features } from '../src/data/features';

describe('feature inventory', () => {
  it('uses only the agreed groups', () => {
    const groups = new Set(features.map((f) => f.group));
    expect([...groups].sort()).toEqual([
      'Emulation',
      'Extensibility',
      'Library',
      'Platforms',
      'Playback',
      'Reading',
      'Sync & social',
    ]);
  });

  it('marks casting and netplay as unverified', () => {
    const unverified = features.filter((f) => f.unverified).map((f) => f.title);
    expect(unverified).toContain('Cast to a TV');
    expect(unverified).toContain('Local netplay');
  });

  it('never claims an unverified feature works', () => {
    for (const f of features.filter((x) => x.unverified)) {
      expect(f.body.toLowerCase(), f.title).toMatch(/not yet been tested/);
    }
  });

  it('names no indexer, tracker or debrid provider', () => {
    const all = features
      .map((f) => `${f.title} ${f.body}`)
      .join(' ')
      .toLowerCase();
    for (const banned of ['real-debrid', 'torbox', 'prowlarr', 'jackett', 'torznab', 'torrent']) {
      expect(all, `mentions ${banned}`).not.toContain(banned);
    }
  });

  it('states the verified counts', () => {
    const all = features.map((f) => f.body + f.title).join(' ');
    expect(all).toContain('63 systems');
    expect(all).toContain('16 modern systems');
  });

  it('claims two bundled themes, not six', () => {
    const themeFeature = features.find((f) => f.title === 'Themes');
    expect(themeFeature?.body).toContain('Two themes ship');
  });

  it('never uses the pre-rename product name', () => {
    const all = features.map((f) => `${f.title} ${f.body}`).join(' ');
    expect(all).not.toMatch(/My ?Media ?Vault/i);
  });
});

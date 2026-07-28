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

  it('lists only the themes that actually ship with the app', () => {
    expect(themes.map((t) => t.id).sort()).toEqual(['channels', 'triple']);
  });

  it('writes a caption for every screenshot', () => {
    for (const s of screenshots) expect(s.caption.length).toBeGreaterThan(10);
  });

  it('covers every media category the site advertises', () => {
    const cats = new Set(screenshots.map((s) => s.category));
    for (const c of ['video', 'games', 'music', 'reading', 'system']) {
      expect(cats, `no screenshot for ${c}`).toContain(c);
    }
  });
});

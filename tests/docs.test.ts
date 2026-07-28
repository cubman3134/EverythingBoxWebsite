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

  it('claims two bundled themes, not six', () => {
    const firstRun = readFileSync(`${dir}/first-run.mdx`, 'utf8');
    expect(firstRun).toContain('Two themes ship');
  });
});

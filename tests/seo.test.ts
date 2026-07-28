import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ORIGIN = 'https://everything-box.com';

function allHtml(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) allHtml(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

describe('production metadata', () => {
  const files = allHtml('dist');

  it('gives every page a canonical URL', () => {
    for (const f of files) {
      const html = readFileSync(f, 'utf8');
      expect(html, `${f} has no canonical`).toMatch(/<link rel="canonical" href="https:\/\//);
    }
  });

  it('gives every page an absolute og:image', () => {
    for (const f of files) {
      const html = readFileSync(f, 'utf8');
      expect(html, `${f} has no og:image`).toContain(`property="og:image" content="${ORIGIN}/og.png"`);
    }
  });

  it('declares the large-image twitter card', () => {
    const home = readFileSync('dist/index.html', 'utf8');
    expect(home).toContain('name="twitter:card" content="summary_large_image"');
  });

  it('points canonical at the page it is on, not always the home page', () => {
    const dl = readFileSync('dist/download/index.html', 'utf8');
    expect(dl).toContain(`<link rel="canonical" href="${ORIGIN}/download`);
  });

  it('ships the social card image', () => {
    expect(existsSync('dist/og.png'), 'dist/og.png missing').toBe(true);
  });

  it('ships robots.txt pointing at the sitemap', () => {
    const robots = readFileSync('dist/robots.txt', 'utf8');
    expect(robots).toContain('Sitemap: https://everything-box.com/sitemap-index.xml');
  });

  it('generates a sitemap covering the real pages', () => {
    expect(existsSync('dist/sitemap-index.xml'), 'no sitemap index').toBe(true);
    const sitemap = readdirSync('dist')
      .filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'))
      .map((f) => readFileSync(join('dist', f), 'utf8'))
      .join('');
    for (const path of ['/download', '/features', '/emulation', '/addons', '/screenshots', '/docs']) {
      expect(sitemap, `sitemap omits ${path}`).toContain(`${ORIGIN}${path}`);
    }
  });

  it('keeps the 404 page out of the sitemap', () => {
    const sitemap = readdirSync('dist')
      .filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'))
      .map((f) => readFileSync(join('dist', f), 'utf8'))
      .join('');
    expect(sitemap).not.toContain('/404');
  });

  it('builds both OAuth landing pages', () => {
    expect(existsSync('dist/auth/success/index.html'), 'no auth success page').toBe(true);
    expect(existsSync('dist/auth/error/index.html'), 'no auth error page').toBe(true);
  });

  it('keeps the OAuth landing pages out of search and the sitemap', () => {
    for (const p of ['dist/auth/success/index.html', 'dist/auth/error/index.html']) {
      expect(readFileSync(p, 'utf8'), `${p} is indexable`).toContain('name="robots" content="noindex');
    }
    const sitemap = readdirSync('dist')
      .filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'))
      .map((f) => readFileSync(join('dist', f), 'utf8'))
      .join('');
    expect(sitemap).not.toContain('/auth/');
  });

  it('never tells the user sign-in worked on the error page', () => {
    const err = readFileSync('dist/auth/error/index.html', 'utf8');
    expect(err).toContain("Sign-in didn't complete");
    expect(err).not.toMatch(/You'?re signed in/);
    expect(err).toContain('Nothing was connected');
  });

  it('builds a branded 404 page that offers a way back', () => {
    expect(existsSync('dist/404.html'), 'no dist/404.html').toBe(true);
    const notFound = readFileSync('dist/404.html', 'utf8');
    expect(notFound).toContain('EverythingBox');
    expect(notFound).toContain('That page does not exist');
    expect(notFound).toContain('href="/download"');
  });
});

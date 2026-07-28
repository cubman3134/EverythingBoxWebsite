import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function allHtml(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) allHtml(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

describe('built site shell', () => {
  const files = allHtml('dist');

  it('produces at least one page', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('never leaks the old product name', () => {
    for (const f of files) {
      const html = readFileSync(f, 'utf8');
      expect(html, `${f} mentions the pre-rename product name`).not.toMatch(/My ?Media ?Vault/i);
    }
  });

  it('renders the nav and the licence line', () => {
    const home = readFileSync('dist/index.html', 'utf8');
    expect(home).toContain('EverythingBox');
    expect(home).toContain('General Public License v3.0');
  });
});

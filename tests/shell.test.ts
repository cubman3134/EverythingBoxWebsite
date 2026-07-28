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

  it('never leaks the old product name outside release filenames', () => {
    for (const f of files) {
      const html = readFileSync(f, 'utf8')
        // Release asset filenames come from the GitHub API and legitimately carry the
        // pre-rename name until the next release is cut. Everything else must not.
        .replace(/MyMediaVault-[a-z0-9._-]+/gi, '');
      expect(html, `${f} mentions the pre-rename product name`).not.toMatch(/My ?Media ?Vault/i);
    }
  });

  it('renders a resolvable download link for every platform', () => {
    const html = readFileSync('dist/download/index.html', 'utf8');
    for (const suffix of [
      'windows-x64.zip',
      'macos-arm64.dmg',
      'linux-x86_64.AppImage',
      'android-arm64.apk',
      'ios-arm64.ipa',
    ]) {
      expect(html, `no link ending ${suffix}`).toContain(suffix);
    }
  });

  it('never offers the debug-symbol archive', () => {
    const html = readFileSync('dist/download/index.html', 'utf8');
    expect(html).not.toContain('-pdb.zip');
  });

  it('never names an indexer, tracker or debrid provider anywhere', () => {
    for (const f of files) {
      const html = readFileSync(f, 'utf8').toLowerCase();
      for (const banned of ['real-debrid', 'torbox', 'prowlarr', 'jackett', 'torznab']) {
        expect(html, `${f} mentions ${banned}`).not.toContain(banned);
      }
    }
  });

  it('renders the nav and the licence line', () => {
    const home = readFileSync('dist/index.html', 'utf8');
    expect(home).toContain('EverythingBox');
    expect(home).toContain('General Public License v3.0');
  });
});

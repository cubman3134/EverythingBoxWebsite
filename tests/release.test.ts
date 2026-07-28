import { describe, it, expect } from 'vitest';
import { matchAssets, formatSize } from '../src/lib/release';

// Real asset names from EverythingBox v0.5.0, which predates the product rename.
const v050 = [
  { name: 'MyMediaVault-android-arm64.apk', size: 34623858, browser_download_url: 'https://x/a' },
  { name: 'MyMediaVault-android-armv7.apk', size: 31121968, browser_download_url: 'https://x/b' },
  { name: 'MyMediaVault-android-x86_64.apk', size: 36442197, browser_download_url: 'https://x/c' },
  { name: 'MyMediaVault-ios-arm64.ipa', size: 28255979, browser_download_url: 'https://x/d' },
  { name: 'MyMediaVault-linux-x86_64.AppImage', size: 129718776, browser_download_url: 'https://x/e' },
  { name: 'MyMediaVault-macos-arm64.dmg', size: 94842308, browser_download_url: 'https://x/f' },
  { name: 'MyMediaVault-windows-x64-pdb.zip', size: 11288895, browser_download_url: 'https://x/g' },
  { name: 'MyMediaVault-windows-x64.zip', size: 113840490, browser_download_url: 'https://x/h' },
];

// The same release after the rename lands.
const renamed = v050.map((a) => ({ ...a, name: a.name.replace('MyMediaVault', 'EverythingBox') }));

describe('matchAssets', () => {
  it('resolves all five platforms from pre-rename assets', () => {
    const got = matchAssets(v050);
    expect(got.map((a) => a.platformId).sort()).toEqual([
      'android',
      'ios',
      'linux',
      'macos',
      'windows',
    ]);
  });

  it('resolves all five platforms from post-rename assets', () => {
    expect(matchAssets(renamed)).toHaveLength(5);
  });

  it('never offers the debug-symbol archive as the Windows download', () => {
    const win = matchAssets(v050).find((a) => a.platformId === 'windows');
    expect(win?.name).toBe('MyMediaVault-windows-x64.zip');
    expect(win?.size).toBe(113840490);
  });

  it('picks arm64 for Android, not armv7 or x86_64', () => {
    const android = matchAssets(v050).find((a) => a.platformId === 'android');
    expect(android?.name).toContain('arm64');
  });

  it('omits a platform whose asset is absent rather than inventing a link', () => {
    const partial = v050.filter((a) => !a.name.includes('ios'));
    expect(matchAssets(partial).map((a) => a.platformId)).not.toContain('ios');
  });

  it('carries the real download URL through', () => {
    const win = matchAssets(v050).find((a) => a.platformId === 'windows');
    expect(win?.url).toBe('https://x/h');
  });
});

describe('formatSize', () => {
  it('renders megabytes', () => {
    expect(formatSize(113840490)).toBe('109 MB');
  });
});

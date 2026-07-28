import { platforms } from '../data/platforms';
import fallback from '../data/release.fallback.json';

export interface ResolvedAsset {
  platformId: string;
  name: string;
  url: string;
  size: number;
}

export interface Release {
  version: string;
  publishedAt: string;
  assets: ResolvedAsset[];
}

interface ApiAsset {
  name: string;
  size: number;
  browser_download_url: string;
}

const API = 'https://api.github.com/repos/cubman3134/EverythingBox/releases/latest';

export function matchAssets(assets: ApiAsset[]): ResolvedAsset[] {
  const out: ResolvedAsset[] = [];
  for (const p of platforms) {
    const hit = assets.find((a) => p.assetPattern.test(a.name));
    // A missing asset yields no card, never a broken link.
    if (!hit) continue;
    out.push({ platformId: p.id, name: hit.name, url: hit.browser_download_url, size: hit.size });
  }
  return out;
}

/**
 * Build-time only. Falls back to the committed snapshot so the build never fails
 * offline or when the API rate-limits.
 */
export async function resolveRelease(): Promise<Release> {
  try {
    // Unauthenticated calls are rate-limited to 60/hr PER IP, and CI runners share
    // addresses — so without a token a rate-limited build falls back silently and the
    // site keeps advertising an old version after a release. A token raises this to
    // 1000/hr for the repo. Optional: local builds work fine without one.
    const token = process.env.GITHUB_TOKEN;
    const res = await fetch(API, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'everythingbox-website',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      throw new Error(
        res.status === 403 || res.status === 429
          ? `GitHub API rate-limited (${res.status})${token ? '' : ' — no GITHUB_TOKEN was set'}`
          : `GitHub API returned ${res.status}`,
      );
    }
    const json = (await res.json()) as {
      tag_name: string;
      published_at: string;
      assets: ApiAsset[];
    };
    const assets = matchAssets(json.assets);
    if (assets.length === 0) throw new Error('no assets matched any platform');
    return { version: json.tag_name, publishedAt: json.published_at, assets };
  } catch (err) {
    console.warn(
      `[release] live lookup failed (${(err as Error).message}); using committed fallback`,
    );
    return fallback as Release;
  }
}

export function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

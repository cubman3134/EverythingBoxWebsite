import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { coreModels, retroparkAbiVersion, retroparkCores } from '../src/data/retropark';

describe('retropark data', () => {
  it('lists every core in the RetroPark tree', () => {
    expect(retroparkCores.map((c) => c.id).sort()).toEqual([
      'dolphin_present',
      'libretro_shim',
      'refcore_driven',
      'refcore_present',
      'refcore_present_vk',
      'refcore_rollback',
      'rpcs3_present',
    ]);
  });

  it('splits them across both core models', () => {
    expect(retroparkCores.filter((c) => c.model === 'driven')).toHaveLength(3);
    expect(retroparkCores.filter((c) => c.model === 'presenting')).toHaveLength(4);
  });

  it('describes exactly the two models', () => {
    expect(coreModels.map((m) => m.name)).toEqual(['Driven', 'Presenting']);
  });

  it('pins the ABI version', () => {
    // include/retropark/retropark_abi.h -> RETROPARK_ABI_VERSION
    expect(retroparkAbiVersion).toBe(5);
  });

  it('marks the two externally-built cores', () => {
    const external = retroparkCores.filter((c) => c.external).map((c) => c.id);
    expect(external.sort()).toEqual(['dolphin_present', 'rpcs3_present']);
  });
});

describe('the retropark page is honest about integration', () => {
  const page = 'dist/retropark/index.html';

  it('builds', () => {
    expect(existsSync(page)).toBe(true);
  });

  it('says plainly that it is not in the shipping app yet', () => {
    // The whole reason this test exists: RetroPark is NOT wired into EverythingBox (a grep
    // of the app repo finds no reference). If someone later softens this line, the page
    // starts advertising a feature the download does not have.
    const html = readFileSync(page, 'utf8');
    expect(html).toContain('not wired into the shipping app yet');
  });

  it('never claims today’s builds use it', () => {
    const html = readFileSync(page, 'utf8').toLowerCase();
    for (const claim of [
      'everythingbox uses retropark',
      'powered by retropark',
      'built on retropark',
      'runs on retropark',
    ]) {
      expect(html, `page claims "${claim}"`).not.toContain(claim);
    }
  });

  it('does not claim macOS or iOS support, which is designed but unbuilt', () => {
    const html = readFileSync(page, 'utf8');
    expect(html).toContain('designed but not yet built');
  });

  it('covers the three things the page is for', () => {
    const html = readFileSync(page, 'utf8');
    expect(html).toContain('libretro'); // the comparison
    expect(html).toContain('EverythingBox'); // the integration story
    expect(html).toMatch(/your frontend|other frontend/i); // portability to other hosts
  });
});

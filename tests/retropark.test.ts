import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import {
  coreModels,
  integration,
  retroparkAbiVersion,
  retroparkCores,
} from '../src/data/retropark';

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

  it('says it IS integrated', () => {
    // Slice 2a landed in the app repo: permanent submodule dep, EmuBackend seam, per-game and
    // per-system backend selection, a RetroParkView play surface, and a CI job.
    const html = readFileSync(page, 'utf8');
    expect(html).toContain('wired into EverythingBox');
  });

  it('says no ROM goes through it yet', () => {
    // This is the line that keeps the page honest now. RetroParkView loads the reference
    // DRIVEN core statically — an animated test pattern. Real ROMs are the next slice
    // (libretro_shim + fceumm). Softening this advertises a feature that does not exist.
    const html = readFileSync(page, 'utf8');
    expect(html).toContain('no ROM goes through it today');
  });

  it('says libretro is still the default', () => {
    // EmuBackend.h: until a user opts in, every launch resolves to Libretro and behaves
    // byte-identically to before.
    const html = readFileSync(page, 'utf8').toLowerCase();
    expect(html).toMatch(/libretro stays the default|libretro is still the default/);
  });

  it('never claims games or heavy emulators already run through it', () => {
    const html = readFileSync(page, 'utf8').toLowerCase();
    for (const claim of [
      'play your games through retropark',
      'dolphin now renders inside',
      'powered by retropark',
      'every game runs through retropark',
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

describe('integration checklist', () => {
  it('marks the five landed steps and the three that have not', () => {
    expect(integration.filter((s) => s.done)).toHaveLength(5);
    expect(integration.filter((s) => !s.done)).toHaveLength(3);
  });

  it('keeps ROMs, presenting cores and mobile on the not-yet side', () => {
    const pending = integration.filter((s) => !s.done).map((s) => s.text.toLowerCase());
    expect(pending.some((t) => t.includes('rom'))).toBe(true);
    expect(pending.some((t) => t.includes('presenting'))).toBe(true);
    expect(pending.some((t) => t.includes('ios'))).toBe(true);
  });
});

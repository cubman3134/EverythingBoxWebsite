import { describe, it, expect } from 'vitest';
import { systems } from '../src/data/systems';
import { emulators } from '../src/data/emulators';

describe('catalog data', () => {
  it('carries every system from the app catalog', () => {
    expect(systems).toHaveLength(63);
  });

  it('carries every standalone emulator', () => {
    expect(emulators).toHaveLength(15);
  });

  it('marks exactly the externally-backed systems', () => {
    const external = systems.filter((s) => s.externalEmulator);
    expect(external).toHaveLength(16);
  });

  it('points every external system at a real emulator', () => {
    const ids = new Set(emulators.map((e) => e.id));
    for (const s of systems.filter((x) => x.externalEmulator)) {
      expect(ids, `${s.id} -> ${s.externalEmulator}`).toContain(s.externalEmulator);
    }
  });

  it('gives every emulator a homepage', () => {
    for (const e of emulators) expect(e.homepage).toMatch(/^https:\/\//);
  });

  it('has no duplicate system ids', () => {
    expect(new Set(systems.map((s) => s.id)).size).toBe(systems.length);
  });

  it('gives every system at least one core or an external emulator', () => {
    for (const s of systems) {
      expect(s.cores.length > 0 || s.externalEmulator !== '', `${s.id} has neither`).toBe(true);
    }
  });
});

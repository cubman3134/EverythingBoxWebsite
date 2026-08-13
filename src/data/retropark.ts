/**
 * Facts about RetroPark, the emulation runtime being built for EverythingBox.
 *
 * SOURCE OF TRUTH: the RetroPark repo's own README and headers
 * (github.com/cubman3134/RetroPark). Every claim below traces to one of:
 *   - README.md — the two-core model, the shared-texture handoff, the Status section
 *   - include/retropark/retropark_abi.h — RETROPARK_ABI_VERSION (currently 5)
 *   - cores/ *\/core.json — the core list and each core's type/graphics API
 *
 * INTEGRATION STATUS — this is the part that is easy to overstate.
 *
 * RetroPark IS now integrated into EverythingBox (Slice 2a, app repo): a permanent
 * submodule dependency linked into the app, an `EmuBackend` seam that resolves every
 * launch to libretro or RetroPark, a per-game override plus per-system/global defaults in
 * settings, a real `RetroParkView` play surface beside the libretro one, and a CI job that
 * builds the submodule and runs its probes.
 *
 * What it does NOT do yet, and the page must not imply otherwise:
 *   - No game runs through it. `RetroParkView` loads the reference DRIVEN core as a static
 *     core — an animated test pattern, no ROM. Real ROMs are Slice 2b (libretro_shim +
 *     fceumm).
 *   - No presenting cores in-window. Dolphin and RPCS3 still launch as separate
 *     applications from EverythingBox; the shared-texture path is not wired into the app.
 *   - libretro remains the default. Per EmuBackend.h: until a user opts a game or system
 *     in, every launch resolves to Libretro and behaves byte-identically to before.
 */

export const retroparkRepo = 'https://github.com/cubman3134/RetroPark';
export const retroparkAbiVersion = 5;

export interface RetroparkCore {
  id: string;
  name: string;
  model: 'driven' | 'presenting';
  graphics: string;
  blurb: string;
  /** Built from a git-ignored emulator checkout under external/, not vendored. */
  external?: boolean;
}

export const retroparkCores: RetroparkCore[] = [
  {
    id: 'refcore_driven',
    name: 'Reference driven core',
    model: 'driven',
    graphics: '—',
    blurb:
      'The reference driven core. Doubles as the static-core example — compiled in, no dlopen, for locked-down platforms.',
  },
  {
    id: 'refcore_present',
    name: 'Reference presenting core',
    model: 'presenting',
    graphics: 'D3D11',
    blurb: 'The reference presenting core on Direct3D 11.',
  },
  {
    id: 'refcore_present_vk',
    name: 'Reference presenting core',
    model: 'presenting',
    graphics: 'Vulkan',
    blurb: 'The same, on Vulkan.',
  },
  {
    id: 'refcore_rollback',
    name: 'Reference rollback core',
    model: 'driven',
    graphics: '—',
    blurb: 'Exercises rollback netplay and resimulation.',
  },
  {
    id: 'libretro_shim',
    name: 'libretro shim',
    model: 'driven',
    graphics: '—',
    blurb:
      'Wraps a real libretro core behind the RetroPark ABI. Runs real NES ROMs with audio, savestates and rewind — so the existing core ecosystem keeps working.',
  },
  {
    id: 'dolphin_present',
    name: 'Dolphin',
    model: 'presenting',
    graphics: 'Vulkan',
    blurb:
      'Dolphin built from source, rendering real GameCube and Wii titles into RetroPark’s shared Vulkan image — with audio, input, savestates, and Dolphin’s own netplay driven headless.',
    external: true,
  },
  {
    id: 'rpcs3_present',
    name: 'RPCS3',
    model: 'presenting',
    graphics: 'Vulkan',
    blurb:
      'RPCS3 as a cross-process frame producer, handing PS3 frames across a process boundary into the same shared image.',
    external: true,
  },
];

export interface CoreModel {
  name: string;
  owner: string;
  summary: string;
  gains: string[];
}

export const coreModels: CoreModel[] = [
  {
    name: 'Driven',
    owner: 'The host owns the frame clock',
    summary:
      'The core runs exactly one frame per call and hands back a framebuffer and audio. This is the libretro shape, and it is the right one for retro systems.',
    gains: [
      'Host-owned rewind',
      'Savestate scrubbing',
      'Deterministic lockstep netplay',
      'Rollback netplay',
    ],
  },
  {
    name: 'Presenting',
    owner: 'The core keeps its own clock',
    summary:
      'The core keeps its own loop, threads and GPU device, and renders into a shared surface the host provides. The host still owns the final composite and input routing — but not the clock, so a heavy emulator runs at its own full speed with nothing forcing it into lockstep.',
    gains: [
      'Host-owned overlays and filters',
      'Host-owned input routing',
      'No forced lockstep',
      'Emulators that own their threads',
    ],
  },
];

/** One step of the EverythingBox integration, and whether it has landed. */
export interface IntegrationStep {
  text: string;
  done: boolean;
}

/**
 * Traceable to the app repo: the Slice 2a commits (a2e416c permanent dependency, 3562c54
 * EmuBackend + resolveBackend, f750d24 RetroParkView, 2c93d58 backend picker, 5d83ae0 CI)
 * and to docs/superpowers/specs/2026-08-12-retropark-backend-beside-libretro-design.md
 * for what is explicitly out of scope so far.
 */
export const integration: IntegrationStep[] = [
  { text: 'A permanent dependency — RetroPark is a submodule, built and linked into the app', done: true },
  { text: 'A backend seam: every launch resolves to libretro or RetroPark', done: true },
  { text: 'Pick the backend per game, or set a default per system', done: true },
  { text: 'A RetroPark play surface in the app, beside the libretro one', done: true },
  { text: 'Continuous integration builds the runtime and runs its probes', done: true },
  { text: 'Real ROMs through RetroPark, via the libretro shim', done: false },
  { text: 'Presenting cores in-window — Dolphin and RPCS3 under the app’s own overlay', done: false },
  { text: 'macOS and iOS, via Metal and the static-core path', done: false },
];

/**
 * Facts about RetroPark, the emulation runtime being built for EverythingBox.
 *
 * SOURCE OF TRUTH: the RetroPark repo's own README and headers
 * (github.com/cubman3134/RetroPark). Every claim below traces to one of:
 *   - README.md — the two-core model, the shared-texture handoff, the Status section
 *   - include/retropark/retropark_abi.h — RETROPARK_ABI_VERSION (currently 5)
 *   - cores/ *\/core.json — the core list and each core's type/graphics API
 *
 * IMPORTANT: RetroPark is NOT yet wired into the shipping EverythingBox app — a grep of
 * the app repo finds no reference to it. The page must describe the relationship in the
 * future tense and must not imply today's builds use it. Today's emulation is libretro
 * cores plus standalone emulators; that is what /emulation documents.
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

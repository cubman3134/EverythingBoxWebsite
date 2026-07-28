export interface GameSystem {
  id: string;
  name: string;
  extensions: string[];
  cores: string[];
  /** Non-empty => runs in a standalone emulator (Emulator.id), not an in-process libretro core. */
  externalEmulator: string;
}

export interface Emulator {
  id: string;
  name: string;
  homepage: string;
}

export interface Platform {
  id: string;
  name: string;
  note: string;
  /** Matches the release asset filename by suffix, tolerating either brand prefix. */
  assetPattern: RegExp;
}

export interface Feature {
  group: string;
  title: string;
  body: string;
  /** Built but not verified on hardware — rendered with an explicit caveat. */
  unverified?: boolean;
}

export interface Theme {
  id: string;
  name: string;
  blurb: string;
  /** Screenshot id from screenshots.ts. */
  shot: string;
}

export interface Screenshot {
  id: string;
  file: string;
  caption: string;
  theme: string | null;
  category: 'video' | 'games' | 'music' | 'reading' | 'system';
}

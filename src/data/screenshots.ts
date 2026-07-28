import type { Screenshot } from './types';

// Every entry corresponds to a PNG in src/assets/shots/, captured from the running app
// by tools/capture.py. A missing file fails the build (see src/lib/shots.ts).
export const screenshots: Screenshot[] = [
  {
    id: 'home-channels',
    file: 'home-channels.png',
    caption: 'The Channels theme — the whole library as tiles, one press from anything.',
    theme: 'channels',
    category: 'system',
  },
  {
    id: 'home-triple',
    file: 'home-triple.png',
    caption: 'The Triple theme — a dark cross-media bar, built for a big screen across the room.',
    theme: 'triple',
    category: 'system',
  },
  {
    id: 'movies-browse',
    file: 'movies-browse.png',
    caption: 'Browsing films. Artwork and titles come from the catalog addon, not from filenames.',
    theme: 'channels',
    category: 'video',
  },
  {
    id: 'movie-detail',
    file: 'movie-detail.png',
    caption:
      'A film in full: poster, tagline, runtime, rating and genres, with play and source options.',
    theme: 'channels',
    category: 'video',
  },
  {
    id: 'video-library',
    file: 'video-library.png',
    caption: 'The same library in the dark theme, with backdrop art and the synopsis alongside.',
    theme: 'triple',
    category: 'video',
  },
  {
    id: 'show-episodes',
    file: 'show-episodes.png',
    caption: 'A series drilled down to a season, every episode with its own still and title.',
    theme: 'channels',
    category: 'video',
  },
  {
    id: 'games-library',
    file: 'games-library.png',
    caption:
      'The games library, with box art, a logo, screen art and how long you have played each one.',
    theme: 'triple',
    category: 'games',
  },
  {
    id: 'emu-systems',
    file: 'emu-systems.png',
    caption: 'Games organised by system — dozens of consoles and computers, side by side.',
    theme: 'channels',
    category: 'games',
  },
  {
    id: 'game-detail',
    file: 'game-detail.png',
    caption: 'A game in full: developer, publisher, player count, genre and age rating.',
    theme: 'channels',
    category: 'games',
  },
  {
    id: 'remap',
    file: 'remap.png',
    caption:
      'Input mapping — per player, per profile, with separate controller and keyboard bindings and turbo.',
    theme: 'channels',
    category: 'games',
  },
  {
    id: 'music-library',
    file: 'music-library.png',
    caption: 'Albums and playlists, with cover art pulled in automatically.',
    theme: 'triple',
    category: 'music',
  },
  {
    id: 'reading-library',
    file: 'reading-library.png',
    caption: 'Books and comics sit in the same library as everything else.',
    theme: 'triple',
    category: 'reading',
  },
  {
    id: 'reading-detail',
    file: 'reading-detail.png',
    caption: 'A book with its author, publisher, page count, categories and description.',
    theme: 'triple',
    category: 'reading',
  },
  {
    id: 'settings',
    file: 'settings.png',
    caption:
      'Settings: cloud sync, achievements, standalone and built-in emulators, BIOS checks, input mapping.',
    theme: 'channels',
    category: 'system',
  },
];

import type { Feature } from './types';

// Every entry traces to README.md / native/README.md in the app repo, or to behaviour
// observed in the running app. `unverified: true` is reserved for casting and netplay,
// which are built but have never been tested on real hardware.
export const features: Feature[] = [
  // ---- Playback ----
  {
    group: 'Playback',
    title: 'Plays essentially anything',
    body: 'Video runs on libmpv, the engine behind mpv — MKV, HEVC, AV1, AC3 and the rest, including large files streamed rather than copied first.',
  },
  {
    group: 'Playback',
    title: 'Music with real playlists',
    body: 'MP3, FLAC, OGG, WAV and more, with folder queueing, previous and next, and automatic advance at the end of a track.',
  },
  {
    group: 'Playback',
    title: 'Subtitles',
    body: 'Fetches and caches subtitles, with per-file offset adjustment for when a track drifts out of sync.',
  },
  {
    group: 'Playback',
    title: 'Skip intros and recaps',
    body: 'Chapter and segment data let you jump past an intro or a recap without hunting for the timestamp.',
  },
  {
    group: 'Playback',
    title: 'Resume where you stopped',
    body: 'Per-file resume across video, books and PDFs, remembered per profile.',
  },

  // ---- Library ----
  {
    group: 'Library',
    title: 'Your own files, scanned in place',
    body: 'Point it at folders and it builds a library. Nothing is renamed, moved or reorganised — stop using the app and your files are exactly as you left them.',
  },
  {
    group: 'Library',
    title: 'Artwork and metadata',
    body: 'Posters, logos, banners, backdrops and descriptions arrive through catalog addons, so a shelf of filenames becomes something you can browse by cover.',
  },
  {
    group: 'Library',
    title: 'Drill down properly',
    body: 'A series opens to its seasons and then to individual episodes, each with its own still and title. An album opens to its tracks.',
  },
  {
    group: 'Library',
    title: 'PC game libraries',
    body: 'Imports installed titles from Steam, Epic, GOG and Battle.net so they sit alongside everything else.',
  },
  {
    group: 'Library',
    title: 'Profiles and a parental lock',
    body: 'Separate profiles with their own progress and history, and a PIN-protected lock.',
  },
  {
    group: 'Library',
    title: 'Favourites, history and stats',
    body: 'Recently played, favourites, and per-item play statistics — how long ago you played something, and for how long.',
  },

  // ---- Emulation ----
  {
    group: 'Emulation',
    title: '63 systems',
    body: 'From the Atari 2600 and the ZX Spectrum through to the Xbox 360 and the Switch, organised by system and by console maker.',
  },
  {
    group: 'Emulation',
    title: 'Cores run in-process',
    body: 'libretro cores load directly into the application — including hardware-rendered ones, which get a real OpenGL context. No second window, no separate configuration.',
  },
  {
    group: 'Emulation',
    title: 'Standalone emulators, installed for you',
    body: 'For 16 modern systems the app fetches the established standalone emulator from its own official source and launches it with the right arguments: Dolphin, PCSX2, RPCS3, Ryujinx, Xenia and ten more.',
  },
  {
    group: 'Emulation',
    title: 'Controllers done properly',
    body: 'SDL2 gamepads with hot-plug, four player ports, independent per-port remapping for pad and keyboard, rumble, and adjustable turbo per button.',
  },
  {
    group: 'Emulation',
    title: 'Save states and cloud saves',
    body: 'Save and load states while you play, with saves syncable between your machines.',
  },
  {
    group: 'Emulation',
    title: 'RetroAchievements',
    body: 'Sign in and earn achievements on supported cores.',
  },

  // ---- Reading ----
  {
    group: 'Reading',
    title: 'EPUB reader',
    body: 'Parses the spine and table of contents, renders page by page, with adjustable text size and per-book resume.',
  },
  {
    group: 'Reading',
    title: 'PDF reader',
    body: 'Rendered with PDFium: page navigation, zoom and fit-to-width.',
  },
  {
    group: 'Reading',
    title: 'Comics and manga',
    body: 'CBZ and CBR, page by page, in the same library as everything else.',
  },

  // ---- Extensibility ----
  {
    group: 'Extensibility',
    title: 'Addons are sandboxed JavaScript',
    body: 'Each addon is a manifest and a script running in an isolated interpreter, with a per-call execution timeout so a runaway addon cannot hang the interface.',
  },
  {
    group: 'Extensibility',
    title: 'They never block the interface',
    body: 'Addon calls run off the interface thread, each in a fresh context, so no addon can freeze the app while it waits on the network.',
  },
  {
    group: 'Extensibility',
    title: 'Catalogs, search and drill-down',
    body: 'An addon declares catalogs per media type and supports search, pagination and drill-down. Each source can be enabled or disabled on its own.',
  },
  {
    group: 'Extensibility',
    title: 'Themes',
    body: 'Two themes ship with the app and more install from the theme gallery. A theme is a JSON file you can edit — colours, layout and artwork.',
  },

  // ---- Sync and social ----
  {
    group: 'Sync & social',
    title: 'Cloud sync',
    body: 'Progress, saves and settings sync between your own machines.',
  },
  {
    group: 'Sync & social',
    title: 'Trakt',
    body: 'Scrobble what you watch.',
  },
  {
    group: 'Sync & social',
    title: 'Cast to a TV',
    body: 'Chromecast and DLNA targets are implemented, but have not yet been tested against real hardware.',
    unverified: true,
  },
  {
    group: 'Sync & social',
    title: 'Local netplay',
    body: 'Two-player lockstep netplay over a LAN is implemented, but has not yet been tested end to end.',
    unverified: true,
  },

  // ---- Platforms ----
  {
    group: 'Platforms',
    title: 'Five platforms, one codebase',
    body: 'Windows, macOS, Linux, Android including Android TV, and iOS — a native Qt6 and C++ application on each.',
  },
  {
    group: 'Platforms',
    title: 'Built for a remote',
    body: 'Every screen is navigable with a D-pad, which is what makes it work on a television. Keyboard, mouse, controller and TV remote are all first-class.',
  },
  {
    group: 'Platforms',
    title: 'Free software',
    body: 'GPLv3. Use it, study it, change it, share it — including commercially.',
  },
];

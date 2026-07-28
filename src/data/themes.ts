import type { Theme } from './types';

// The themes actually bundled with the app. NOTE: only these two ship in the build —
// `native/themes2/` in the app repo contains Channels and Triple and nothing else.
// Four more (Default, Grid, Lumen, Midnight) live in the separate theme-registry repo
// and are installed from the in-app theme gallery, so the site must not claim they
// ship with the app.
export const themes: Theme[] = [
  {
    id: 'channels',
    name: 'Channels',
    blurb:
      'Your library as a wall of channels. Bright, high-contrast tiles, a clock, and everything one press away.',
    shot: 'home-channels',
  },
  {
    id: 'triple',
    name: 'Triple',
    blurb:
      'A dark cross-media bar. Categories run across, the active one drops down, and the artwork for whatever you are on fills the right.',
    shot: 'home-triple',
  },
];

/**
 * The public community registries the app's built-in gallery browses (RegistryBrowser):
 * each is an index.json plus raw files, and users can add registries of their own.
 * Rendered as prose on the site, never as a bundled claim.
 */
export const themeRegistryUrl = 'https://github.com/cubman3134/everythingbox-themes';
export const addonRegistryUrl = 'https://github.com/cubman3134/everythingbox-addons';

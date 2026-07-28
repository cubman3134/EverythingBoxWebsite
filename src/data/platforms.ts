import type { Platform } from './types';

// assetPattern matches the platform SUFFIX only, never the whole filename, so it holds
// across the app's in-flight MyMediaVault -> EverythingBox asset rename. The published
// v0.5.0 assets still carry the old prefix; the next release will not.
export const platforms: Platform[] = [
  {
    id: 'windows',
    name: 'Windows',
    // Deliberately does not name the .exe: the v0.5.0 archive still carries the
    // pre-rename executable name, so naming it would be wrong for today's build.
    note: 'Unzip anywhere and run the application. There is no installer.',
    assetPattern: /-windows-x64\.zip$/,
  },
  {
    id: 'macos',
    name: 'macOS (Apple Silicon)',
    note: 'Unsigned build — on first launch, right-click the app and choose Open.',
    assetPattern: /-macos-arm64\.dmg$/,
  },
  {
    id: 'linux',
    name: 'Linux (x86_64)',
    note: 'Mark it executable with chmod +x, then run it.',
    assetPattern: /-linux-x86_64\.AppImage$/,
  },
  {
    id: 'android',
    name: 'Android & Android TV',
    note: 'Sideload the APK. Runs on phones, tablets and TV devices. Standalone emulators are desktop-only.',
    assetPattern: /-android-arm64\.apk$/,
  },
  {
    id: 'ios',
    name: 'iOS / iPadOS',
    note: 'Unsigned — sideload with AltStore or Sideloadly. Emulation is unavailable on iOS.',
    assetPattern: /-ios-arm64\.ipa$/,
  },
];

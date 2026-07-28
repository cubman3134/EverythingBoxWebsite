#!/usr/bin/env python3
"""Capture EverythingBox screenshots for the website.

Drives the ALREADY-RUNNING app over its uitest channel. The app must have been
launched with EB_UITEST=1. Nothing here steals focus or synthesises keystrokes:
the app screenshots itself, even while occluded.

Usage:
    python tools/capture.py               # capture every target
    python tools/capture.py xmb-home      # capture one target by id
    python tools/capture.py --frames      # capture the hero loop frame sequence
    python tools/capture.py --state       # print the app's current UI state and exit
"""
import json
import os
import pathlib
import subprocess
import sys
import time

APP_REPO = pathlib.Path(os.environ.get("EB_APP_REPO", r"C:\Users\cubma\Project Goliath"))
UITEST = APP_REPO / "native" / "tools" / "uitest.py"
OUT = pathlib.Path(__file__).resolve().parent.parent / "src" / "assets" / "shots"

# (id, keys-to-get-there, expected substring in the state JSON before shooting)
#
# `keys` is a space-separated sequence; "3*down" repeats. `expect` is asserted against
# the state JSON before the shot, so a drifted sequence SKIPS rather than committing a
# wrong screenshot.
#
# IMPORTANT: these sequences are relative to the app sitting on its home screen in the
# theme named in the comment, and the app's home is stateful (it remembers where you
# were). Always run with --home first, and treat a SKIP as "re-derive this path", not
# as a transient failure. Paths below were derived by hand against v0.5.0; the two
# themes have different layouts and therefore different sequences.
#
# The `state` fields worth asserting on are themedView ("home" | "browse" | "detail"),
# themedSelection, and pageName ("themedPanelHost" for settings).
TARGETS = [
    # --- Channels theme (light; the app's default in this deployment) ---
    ("home-channels", "", '"themedView": "home"'),
    ("movies-browse", "enter 2*down", '"themedView": "browse"'),
    ("movie-detail", "enter down right enter", '"themedView": "detail"'),
    # Settings has no D-pad route in Channels — its gear is a corner button, so this
    # one target uses a synthetic touch tap instead (see capture_settings).
    ("settings", "@tap-settings", '"pageName": "themedPanelHost"'),
    # --- Triple theme (dark XMB cross) ---
    # Categories run left/right: Video, Games, Audio, Reading, Profile, Settings.
    ("video-library", "enter 4*down", '"themedView": "home"'),
    ("games-library", "right enter", '"themedView": "home"'),
    ("music-library", "2*right enter", '"themedView": "home"'),
    ("reading-library", "3*right enter", '"themedView": "home"'),
    ("reading-detail", "3*right enter 2*down", '"themedView": "home"'),
    ("home-triple", "", '"themedView": "home"'),
]

# Targets the plan called for that are NOT yet automated. Each needs media to be
# playing or a view that this harness has not been taught to reach. Listed here so the
# gap is visible in the tooling rather than only in a commit message.
NOT_YET_AUTOMATED = [
    "video-playing",   # needs a local video actually playing
    "music-playing",   # needs the now-playing view with the queue panel
    "emu-running",     # needs a ROM booted in a libretro core
    "reader-book",     # enter on a book did not open the reader from the home column
    "reader-comic",
    "reader-pdf",
    "downloads",       # reachable from Settings > Downloads; path not yet derived
    "remap",           # reachable from Settings > Input Mapping; path not yet derived
    "show-episodes",   # a series drilled down to episodes
]


def ui(*args: str) -> str:
    r = subprocess.run(
        [sys.executable, str(UITEST), *args], capture_output=True, text=True
    )
    if r.returncode != 0:
        raise SystemExit(
            f"uitest failed ({' '.join(args)}): {r.stderr.strip() or r.stdout.strip()}\n"
            f"Is the app running with EB_UITEST=1?"
        )
    return r.stdout.strip()


def capture_frames(count: int = 90, delay: float = 0.08) -> None:
    """Capture a frame sequence for the website hero loop."""
    dest = pathlib.Path(__file__).resolve().parent.parent / "src" / "assets" / "hero-frames"
    dest.mkdir(parents=True, exist_ok=True)
    # Drift slowly across the home screen so the loop has motion in it.
    for i in range(count):
        if i and i % 10 == 0:
            ui("key", "right")
        ui("shot", str(dest / f"f{i:03d}.png"))
        time.sleep(delay)
    print(f"wrote {count} frames to {dest}")


def main() -> int:
    if not UITEST.exists():
        raise SystemExit(f"uitest client not found at {UITEST}; set EB_APP_REPO")

    wanted = sys.argv[1:]

    if wanted == ["--state"]:
        print(ui("state"))
        return 0
    if wanted == ["--frames"]:
        capture_frames()
        return 0

    OUT.mkdir(parents=True, exist_ok=True)
    targets = [t for t in TARGETS if not wanted or t[0] in wanted]
    if wanted and not targets:
        raise SystemExit(f"no target matches {wanted}")

    for tid, keys, expect in targets:
        print(f"--> {tid}")
        if keys == "@tap-settings":
            # Channels puts settings behind a corner button with no D-pad route.
            # Coordinates are LOGICAL window coords, as reported by state's "size".
            ui("touch", "tap", "107", "958")
        elif keys:
            for tok in keys.split():
                n, _, k = tok.partition("*")
                for _ in range(int(n) if k else 1):
                    ui("key", k or n)
                    time.sleep(0.18)
        time.sleep(0.6)  # let the view settle before shooting
        state = ui("state")
        if expect not in state:
            print(f"    SKIP {tid}: state did not contain {expect!r}\n    state={state[:200]}")
            continue
        dest = OUT / f"{tid}.png"
        ui("shot", str(dest))
        if not dest.exists():
            print(f"    FAILED {tid}: no file written")
        else:
            print(f"    wrote {dest.name} ({dest.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

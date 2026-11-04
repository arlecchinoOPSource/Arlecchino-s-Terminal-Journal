# T-31 and T-32 validation — November 4, 2026

Scope: the startup screen and startup sound ([#45](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/45)), and startup readiness, settings and failure recovery ([#46](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/46)). Built last, on the sound branch, after themes, motion and sound were in place.

## What changed

- **`src/ui/StartupScreen.tsx`**: the overlay.
  - It contains the ARLECCHINO label, the TERMINAL wordmark as focal point, a 12-segment indeterminate meter, and one line of real status.
  - It sits in a bracketed frame in the chosen theme.
  - It takes no focus. Any key or click skips it.
  - An error boundary removes it if it fails.
- **`src/domain/startup.ts`**: pure rules.
  - The screen leaves when the journal is ready. With full motion it also waits for the 1.4 s sequence, which runs while the journal opens.
  - It leaves at once on an initialization error or a skip, and always by 10 s.
  - "Still opening" text appears after 4 s. No percentages.
- **`App.tsx` / `WritingWorkspace`**: readiness comes from the journal controller: ready, or an error, including the safe-closing setup error.
- **`SoundManager.playStartup()`**: once per launch, honouring the Sound, Startup and volume settings. If the system keeps audio suspended, the sound is skipped rather than played late.
- **Settings → Interface → Startup screen** (On/Off, stored locally as `terminal.startup`; applies from the next launch).
- **Motion levels:** OS reduced motion, and the in-app Reduced and Off levels, show a static screen only until ready.
- **`tauri.conf.json`**: the main window's `backgroundColor` is `#050706`, so the first native frame is never white.
- **Motion tokens:** `--motion-startup` and `--motion-startup-exit`, tested equal to the TypeScript constants.

## Checks

| Check | Result |
| --- | --- |
| `npm run check` (lint, typecheck, 82 unit tests, build, 86 UI tests in Chromium + WebKit, fmt, clippy, 31 native tests, 3 schema checks) | pass |
| `tests/startup.test.mjs` | pass |
| — when the screen leaves: ready, sequence, error, skip, timeout | pass |
| — messages, with no digits or percentages | pass |
| — setting parsing; CSS timings equal the TypeScript ones | pass |
| — startup sound once, honouring the settings, skipped on a suspended device | pass |
| `tests/ui/startup.spec.ts` (Chromium and WebKit) | pass |
| — shows the wordmark, then leaves for the editor within 1.4–4 s, with nothing animating afterwards | pass |
| — a 5 s journal shows STILL OPENING and the screen waits for it | pass |
| — a journal that fails to open shows its error and **Retry** within 1.4 s, with no splash | pass |
| — a 20 s journal: the screen closes itself by about 10 s and the app shows Loading… | pass |
| — any key skips the screen | pass |
| — reduced motion and Off: static screen, leaves on readiness | pass |
| — startup screen Off opens straight to the editor, and the setting persists | pass |
| — Amber theme colours from the first frame | pass |
| — the startup sound starts at most once and never later on a click or keystroke | pass |
| Native release launches (`scripts/measure_release.py`, Apple M5, macOS 26.5.1, 7 launches each, empty journal and 5,000 entries) | 14 of 14 reached the interface. No unexpected stderr. Database integrity ok after a forced kill; permissions 0700/0600. |
| — page loaded / journal requested (median) | 218 / 300 ms empty, 224 / 307 ms with 5,000 entries; the motion branch measured 215 / 291 and 215 / 299 ms the same day |
| — memory (RSS after 5 s, all processes) | 218–248 MB empty and 263–273 MB with 5,000 entries; the motion branch measured 216–239 and 234–259 MB. About 10–15 MB higher, not investigated further. |
| — release binary | 14.7 MB (13.5 MB before sound); bundled sounds account for the increase |

## Not verified

- **Startup sound on a native launch:** only the owner can confirm it plays audibly. WKWebView and WebView2 may keep audio suspended without a user gesture. In that case the sound is skipped by design, and the browser tests cannot show which happens natively.
- **The screen on a native launch:** the `startup-metrics` milestones mark page load and the journal request, not the moment the screen closes.
- **Windows:** WebView2 startup and its first frame were not tested.
- **Real storage failures:** a corrupt or locked database was simulated only through the UI mock. The native error path itself is unchanged and covered by the existing Rust tests.

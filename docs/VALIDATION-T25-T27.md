# T-25–T-27 validation — November 4, 2026

Scope: the audio manager and sound preferences ([#39](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/39)), keyboard sound packs ([#40](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/40)), and interface sounds ([#41](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/41)). Built on the T-28–T-30 branch, at the product owner's request after motion.

## Product-owner direction

- Sound has its own **Sounds** rail panel between Themes and New entry; it is not in Settings.
- Arlecchino's WAVs are used for startup (stored for T-31), close and error. No confirmation/success sound was supplied, so none plays.
- Keyboard sounds use a thocky/clicky set found online. Clicks are three distinct sounds, also from online sources: icon menus, typesetting, and text edit.
- The owner approved downloading the three sources (OpenGameArt ×2, Kenney via GitHub mirrors) before anything was fetched.

## What changed

- **`src/audio/soundManager.ts`** — the single Web Audio manager:
  - Master, keyboard and interface gains.
  - At most 6 keystroke voices; a repeat of an interface sound replaces the one playing.
  - Lazy audio context and decoding.
  - Immediate mute, and silent failure.
  - A close sound that reports how long the app should stay alive.
- **`src/audio/sounds.ts`**: bundled asset map. **`src/audio/regions.ts`**: click regions. **`src/audio/useTypingSounds.ts`**: keystroke-to-text-change matching.
- **`src/domain/sound.ts`**: settings with field-by-field safe parsing, sound off by default, and key classification that keeps only the kind of key.
- **`src/ui/SoundPanel.tsx`** and the Sounds rail button; `data-sound` regions on the rail, panels, toolbar, writing area, and Settings data section; credits in Settings → About.
- **`src/assets/sounds/`**: 25 WAV files, 2.7 MB in all, of which Arlecchino's three originals are 2.4 MB. Provenance, licences and changes are in [AUDIO-ASSETS-v2.0.md](AUDIO-ASSETS-v2.0.md); licence texts are in `docs/licenses/`.
- **Native:** `journal_finish_exit(lingerMs?)` hides the window and exits after at most 6.5 s. It is called only after the journal is saved.
- **Content security policy:** `connect-src 'self'` added so Web Audio can read the app's own files. External hosts are still blocked.

## Checks

| Check | Result |
| --- | --- |
| `npm run check` (lint, typecheck, 76 unit tests, build, 68 UI tests in Chromium + WebKit, fmt, clippy, 31 native tests, 3 schema checks) | pass |
| `tests/sound.test.mjs` (unit) | pass |
| — sound off by default; invalid or missing settings fall back field by field | pass |
| — key classification: letters, accents, emoji, space, return, delete; shortcuts, modifiers, navigation and IME are silent | pass |
| — no audio context or decoding while sound is off; Startup is never preloaded | pass |
| — pack, per-sound switches, and Silent are honoured | pass |
| — keystroke voices capped at 6; error sounds do not stack | pass |
| — muting stops sounds that are playing and prevents ones still decoding | pass |
| — no device, a throwing device, a failed decode, or a refused resume fail silently | pass |
| — the close-sound wait is capped and matches the native cap | pass |
| — every bundled file is a WAV within its size limit and listed in the asset record | pass |
| `tests/ui/sound.spec.ts` (Chromium and WebKit, Web Audio observed in the page) | pass, 30 of 30 over 3 repeats |
| — sound is silent until switched on, and the setting persists | pass |
| — previews play | pass |
| — rail, toolbar, font select, Delete, and dialog Cancel each play their own sound; shortcuts make no click | pass |
| — letters, space, return and delete sound; formatting shortcuts, arrows, Shift and undo are silent; the title sounds too | pass |
| — Silent and the master switch silence everything | pass |
| — a failed save plays the error sound once, and typing continues | pass |
| Privacy test | pass; `fetch` is allowed only in the sound manager, and sound sources must be local |
| Foundation test (CSP) | pass; `connect-src` adds only `'self'` |

Found while testing:

- **Enabling sound was silent:** the settings update ran inside a React state updater, so the click that turned sound on was not heard. Settings are now applied synchronously.
- **Fast clicks could be lost (existed before this work):** a panel's scrim appeared a frame before its close listener attached, so a very fast second click on the scrim was ignored. The scrim now closes the panel itself.
- **Two motion tests were timing-sensitive under parallel load:**
  - The error-blink check now reads the keyframes instead of sampling the clock.
  - The rapid-toggle test now requires the toolbar and the text to agree, because a key press can be dropped under heavy CPU load.

## Not verified

- **Native playback:** the browser tests prove which file starts, not that it is heard. Audible playback, latency, and the close sound in a hidden window need a listen in the native app on macOS, and on Windows (not tested at all).
- **Close sound:** while it plays, the app keeps running for up to 6.5 s with no window. Relaunching during those seconds was not tested.
- **IME:** composition sounds once when committed (code path); not exercised with a real IME.
- **Assistive input:** dictation and Voice Control fire no key events, so they are silent; not tested with real tools.
- **Startup sound:** stored and previewable only; it is played by the startup screen in T-31.
- **Repository size:** the owner's 6-second WAVs are 1 MB each. Compressing them was not done, to avoid encoder delay and codec differences between WebKit and WebView2.

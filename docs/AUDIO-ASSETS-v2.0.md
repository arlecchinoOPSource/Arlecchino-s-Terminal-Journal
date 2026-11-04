# Terminal 2.0 — audio assets

Every sound Terminal plays is bundled under `src/assets/sounds/` and loaded from the app itself; nothing is downloaded at runtime. `tests/sound.test.mjs` fails if a bundled file is missing from this record. All files are 16-bit PCM WAV, which every target webview decodes and which starts instantly (compressed formats add encoder delay that would make typing feel late).

## Original sounds by Arlecchino

Composed and exported by Arlecchino (product owner) in Ableton Live and supplied on November 4, 2026 for redistribution in Terminal. Bundled **unmodified**; only the file names changed. Masters stay with the owner outside the repository.

| Bundled file | Supplied as | Format | Length | Peak | Size | SHA-256 (first 16) | Used for |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `arlecchino/startup.wav` | `startup - t.wav` | 44.1 kHz stereo 16-bit | 6.0 s | −5.6 dBFS | 1,058,480 B | `12be25273665b8ac` | Startup screen (T-31); stored and previewable now, not yet played at launch |
| `arlecchino/close.wav` | `endup - t.wav` | 44.1 kHz stereo 16-bit | 6.0 s | −6.2 dBFS | 1,058,480 B | `1888b65106658cd4` | Closing Terminal |
| `arlecchino/error.wav` | `error.wav` | 44.1 kHz stereo 16-bit | 2.0 s (0.6 s audible) | −5.9 dBFS | 352,880 B | `fb25807b67c3f529` | Failed save, export, backup or restore |

No confirmation/success sound was supplied; none is played.

## Keyboard pack "Thock"

- **Source:** [Keyboard Soundpack #1 (Typing and Single Keystrokes)](https://opengameart.org/node/122745) by unicaegames on OpenGameArt; downloaded file `unicae_games_keyboard_soundpack_1_0.zip` (8,515,609 B) on November 4, 2026.
- **Licence:** CC0 on the page; the pack's readme says "Free to use however you like" (kept in [`licenses/unicaegames-keyboard-soundpack-readme.txt`](licenses/unicaegames-keyboard-soundpack-readme.txt)). No attribution is required; Terminal credits the author anyway.
- **Recording:** Cherry KC 1000 keyboard, Shure SM7B.
- **Modifications:** trimmed to the keystroke (≤ 260 ms), 12 ms fade-out, peak-normalized to −6 dBFS, mono 44.1 kHz. Three outliers were not used: 008 and 026 (10 kHz noise) and 020 (very quiet).

| Bundled file | From | | Bundled file | From |
| --- | --- | --- | --- | --- |
| `keys/thock/key-01.wav` | keypress-001 | | `keys/thock/key-05.wav` | keypress-019 |
| `keys/thock/key-02.wav` | keypress-004 | | `keys/thock/key-06.wav` | keypress-029 |
| `keys/thock/key-03.wav` | keypress-013 | | `keys/thock/key-07.wav` | keypress-007 |
| `keys/thock/key-04.wav` | keypress-017 | | `keys/thock/key-08.wav` | keypress-027 |
| `keys/thock/space.wav` | keypress-012 | | `keys/thock/enter.wav` | keypress-006 |
| `keys/thock/backspace.wav` | keypress-030 | | | |

## Keyboard pack "Clicky"

- **Source:** [Single Key Press Sounds](https://opengameart.org/content/single-key-press-sounds) on OpenGameArt; downloaded file `eklee-KeyPresses-cc0-opengameart.zip` (2,339,648 B) on November 4, 2026. Based on [freesound.org/people/eklee/sounds/158058](http://freesound.org/people/eklee/sounds/158058/) and [158057](http://freesound.org/people/eklee/sounds/158057/).
- **Licence:** [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). The page lists CC-BY 3.0 although the file name says "cc0", so CC BY 3.0 is followed. Full text: [`licenses/CC-BY-3.0-eklee-key-presses.txt`](licenses/CC-BY-3.0-eklee-key-presses.txt).
- **Required attribution** (shown in Settings → About and here): "Copyright 2012 eklee (freesound.org/people/eklee) · Copyright 2012 qubodup (freesound.org/people/qubodup), extraction of single sounds · CC BY 3.0. Modified for Terminal: trimmed and levelled."
- **Modifications:** trimmed to the keystroke (≤ 260 ms; space ≤ 300 ms), 12 ms fade-out, peak-normalized to −6 dBFS, downmixed to mono.

| Bundled file | From | | Bundled file | From |
| --- | --- | --- | --- | --- |
| `keys/clicky/key-01.wav` | eklee-KeyPressMac01 | | `keys/clicky/key-04.wav` | eklee-KeyPressMac05 |
| `keys/clicky/key-02.wav` | eklee-KeyPressMac03 | | `keys/clicky/key-05.wav` | eklee-KeyPressMac07 |
| `keys/clicky/key-03.wav` | eklee-KeyPressMac04 | | `keys/clicky/space.wav` | eklee-KeyPressMac02 |
| `keys/clicky/enter.wav` | eklee-KeyPressOld04 | | `keys/clicky/backspace.wav` | eklee-KeyPressMac06 |

## Interface clicks

By Kenney ([kenney.nl](https://kenney.nl)), **CC0**, taken as single files from the CC0 Godot mirrors [Calinou/kenney-interface-sounds](https://github.com/Calinou/kenney-interface-sounds) and [Calinou/kenney-ui-audio](https://github.com/Calinou/kenney-ui-audio) of Kenney's *Interface Sounds* and *UI Audio* packs. Licence texts: [`licenses/Kenney-Interface-Sounds-CC0.txt`](licenses/Kenney-Interface-Sounds-CC0.txt), [`licenses/Kenney-UI-Audio-CC0.txt`](licenses/Kenney-UI-Audio-CC0.txt). Each was trimmed, faded, peak-normalized to −8 dBFS and made mono. They were chosen to sound clearly different from one another:

| Bundled file | From | Character | Plays for |
| --- | --- | --- | --- |
| `ui/icon-menu.wav` | Interface Sounds `switch_002` | low, chunky, ~150 ms | Rail buttons, panel rows and panel close buttons |
| `ui/typesetting.wav` | Interface Sounds `tick_002` | tiny, bright, ~20 ms | Toolbar (font, size, style, format, align, table, undo/redo) and Settings writing controls |
| `ui/text-edit.wav` | UI Audio `click1` | mid-range click, ~50 ms | Export, Delete, dialogs, notices, backup and restore |

## Rules

Bundle only reviewed, licensed exports. No runtime downloads and no sound marketplace. Keep the source zips and owner masters outside the repository. Any new sound needs a row here, its licence text in `docs/licenses/` when one is required, and its credit in Settings → About when attribution is required.

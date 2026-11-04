# Changelog

All notable changes to Terminal. Versions follow the app version in `package.json`, `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml`.

## 2.0.0 — The Sensory Update (release candidate, not yet published)

**Themes**
- Four interface themes: Terminal Mint (the original, unchanged), Blue Monitor, Ember Orange and Amber Display, chosen from the new **Themes** button in the left rail. Your writing is never recoloured or rewritten.
- The chosen theme is remembered and applied before the window appears.

**Sound** (off until you switch it on, including after upgrading)
- A **Sounds** button in the rail: master switch and volume, keyboard sounds (Silent, Thock or Clicky) with typing volume, and switches with previews for each interface sound.
- Distinct clicks for icon menus, typesetting controls and text editing; original startup, close and error sounds by Arlecchino.
- Typing sounds follow actual text changes. Only the kind of key is used; what you type is never recorded.

**Motion**
- Short, mechanical animations for buttons, panels, dialogs and the save meter. The writing page is never animated.
- Settings → Interface → **Motion**: Full, Reduced or Off. Your system's reduced-motion setting always wins.

**Startup**
- A branded startup screen while the journal opens, with an honest indicator (no fake percentages). Any key skips it, it never stays longer than 10 seconds, and opening errors are shown at once. Switch it off in Settings → Interface.

**Compatibility**
- 1.0 journals, backups and writing preferences open unchanged; the journal database and backup format are the same as 1.0.
- Closing with the close sound on hides the window at once and lets the sound finish (at most 6.5 seconds) after your writing is saved.

**Credits**
- Thock keyboard sounds by unicaegames (CC0); Clicky keyboard sounds by eklee, extracted by qubodup (CC BY 3.0); interface clicks by Kenney (CC0). Details in docs/AUDIO-ASSETS-v2.0.md.

**Known limitations**
- Installers are not signed or notarized unless signing secrets are configured (see docs/RELEASE.md).
- Windows, Intel Macs, screen readers, IME input and dictation have not been verified by hand.
- On Windows, the Microsoft Edge WebView2 component that runs Terminal's interface opens its own HTTPS connections to Microsoft. Terminal's code makes no network requests (see docs/RELEASE.md).
- Whether the startup sound plays depends on the system allowing audio before the first click; if not, it is skipped.

## 1.0.0 — November 4, 2026

**Writing**
- Distraction-free editor with headings, lists, quotes, bold/italic/underline/strikethrough, alignment, fonts, sizes and tables.
- Automatic saving with an honest save status; pending writes flush before switching or closing; forced termination can interrupt an uncommitted edit.
- Entry numbers that are never reused.

**Finding entries**
- Archives, newest first, and title search as you type.

**Your data**
- Everything is stored locally in SQLite on this device. No accounts, network or tracking.
- Full journal backup and restore, with validation and a safety copy before replacing anything.
- Export a single entry as a web page or plain text.

**Comfort**
- Settings for font, text size, writing width and line spacing.
- Keyboard shortcuts on macOS and Windows; accessible names and focus handling.
- "Terminal 84" retro-futuristic look and a new app icon.

**Known limitations**
- Installers are not yet signed or notarized unless signing secrets are configured (see docs/RELEASE.md).
- Windows, Intel Macs and screen readers have not been verified by hand.

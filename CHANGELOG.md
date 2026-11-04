# Changelog

All notable changes to Terminal. Versions follow the app version in `package.json`, `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml`.

## Unreleased — 0.1.0 (first preview)

**Writing**
- Distraction-free editor with headings, lists, quotes, bold/italic/underline/strikethrough, alignment, fonts, sizes and tables.
- Automatic saving with an honest save status; nothing is lost when switching entries or closing.
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

# T-15 validation — November 4, 2026

Scope: complete journal backup and restore. Only synthetic entries and in-memory or disposable databases were used. No real journal or backup was opened.

## What changed

- Settings has a **DATA** section with **Export backup…** and **Restore backup…**.
- Export saves pending writing, then opens a native save dialog (suggested name `Terminal backup YYYY-MM-DD.json`) and writes a versioned JSON backup. The file is written next to its destination and renamed, so an interrupted write never leaves half a file.
- Restore opens a native file dialog, validates the whole file, and shows a confirmation with the backup's date and entry count and the number of entries that will be replaced. Cancel is focused by default.
- On confirmation, the current journal is first copied to `backups/before-restore-<time>.json` in the app-data folder, then everything is replaced in one SQLite transaction. The journal reloads and a notice says where the previous journal was saved.
- Format, validation rules, restore steps and compatibility rules: `docs/BACKUP-FORMAT.md`.
- Native: new `backup.rs`; commands `backup_export`, `backup_choose`, `backup_restore`, `backup_cancel`, granted to the main window and nothing else. Dialogs are opened from Rust (`tauri-plugin-dialog`); the webview never handles file paths. Entry validation is shared with saving.

## Checks

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck` | pass |
| `npm test` (38 tests) | pass |
| `npm run build:web` | pass (existing 500 kB chunk advisory only) |
| `cargo test --locked` (25 tests), `cargo clippy --all-targets`, `cargo fmt --check` | pass / clean |

New native tests: export then restore preserves IDs, numbers, titles, rich text (tables, fonts, alignment, Unicode), timestamps, revisions and preferences, and the next new entry never reuses a deleted number; ten kinds of invalid file (not JSON, wrong format, newer version, unsupported content, bad timestamps, zero entry number, duplicates, invalid preferences, unknown fields) are refused and leave the journal untouched; a restore that fails mid-way rolls back completely; an empty journal round-trips.

New controller tests: restore saves pending edits before replacing and reloads afterwards; a failed restore leaves the open draft as it was; restore is not attempted when pending edits cannot be saved.

Interactive check in the Vite dev server with mocked native commands: export saved pending writing before exporting; the confirmation showed the real counts with Cancel focused; cancelling changed nothing; confirming reloaded the journal and Archives listed the restored entries; the notice showed where the previous journal was saved. The native dev build compiled and ran with the dialog plugin.

## Not verified

- The native save and open dialogs were not driven by hand (they cannot be automated here). Please export, then restore that file, in the desktop app.
- Windows, and very large real-world journals (performance).

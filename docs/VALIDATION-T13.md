# T-13 validation — November 4, 2026

Scope: application preferences. Only synthetic entries, disposable databases and a disposable app-data folder were used. No real journal was opened.

## What changed

- The rail's bottom button is now **Settings** (it was About). The popover holds the writing preferences and keeps the About text below them.
- Preferences and defaults:

| Setting | Choices | Default |
| --- | --- | --- |
| Font | IBM Plex Sans, IBM Plex Serif, Literata, IBM Plex Mono (all bundled locally) | IBM Plex Sans |
| Text size | 14–22 px | 17 px |
| Writing width | Narrow 560, Medium 640, Wide 720, Extra wide 840 px | Wide (720 px) |
| Line spacing | Compact 1.4, Comfortable 1.65, Relaxed 1.8, Double 2.0 | Comfortable (1.65) |

- Defaults are listed in `src/domain/preferences.ts` and `src-tauri/src/preferences.rs` and shown in the panel (`(default)` / `default: …`). **Reset to defaults** is disabled when nothing differs.
- Changes apply immediately through CSS variables on the writing column (title and body font, body size and line height, column width). Headings scale with the chosen size. Formatting applied with the toolbar (T-09) still overrides the default font and size for that text; the toolbar's font/size menus now show **Default** for unformatted text.
- Storage: one validated JSON record under `preferences` in the existing `settings` table — no migration. Two new native commands, `preferences_get` and `preferences_set`, are added to the app manifest and the main window's capability; nothing else is granted. Saving refuses values outside the allowlist without writing. A missing or unreadable record yields the defaults and is left untouched.
- Saves are serialized so the last change made is the one stored. A failed save is reported in the panel (`Settings could not be saved. They apply until Terminal closes.`) and the change stays applied for the session.
- Preferences load on launch. Until they arrive, the defaults are shown briefly.

## Checks

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck` | pass |
| `npm test` (31 tests) | pass |
| `npm run build:web` | pass (existing 500 kB chunk advisory only) |
| `cargo test --locked` (21 tests), `cargo clippy --all-targets`, `cargo fmt --check` | pass / clean |

New tests: defaults stored after closing and reopening a database file; invalid values refused without writing; unreadable stored record falls back to defaults without being overwritten; TypeScript parser accepts only complete allowed records; CSS variable output; the TypeScript and Rust allowlists and defaults match; the capability grants exactly the journal and preference commands.

Interactive check in the Vite dev server with an in-memory mock of the native commands: stored preferences (Literata, 19 px, Medium, Relaxed) applied on launch; each change applied immediately and was saved, with the final stored record matching the last change; a simulated save failure showed the error and kept the change applied; Reset restored the defaults and disabled itself. The panel fits and scrolls internally at 480 × 400.

## Not verified

- Settings surviving a real quit and relaunch in the native app by hand (covered by the native reopen test).
- VoiceOver, Windows, and 200% text enlargement.

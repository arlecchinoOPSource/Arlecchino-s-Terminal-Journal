# T-11 validation — November 4, 2026

Scope: archive popover. Only synthetic entries were used. No real journal was opened.

## What changed

- The rail's Archives button is enabled once storage is ready and opens a popover beside the rail (`src/ui/ArchivePanel.tsx`), reusing the existing popover's Escape, outside-click and focus-return behaviour. Opening Archives closes About and vice versa.
- Rows show title (or `Untitled`), real entry number and modification date (`HH:MM` for today, otherwise `YYYY-MM-DD`, local time), most recently modified first. The open entry is inverted to mint and carries a `▶` marker and `aria-current`, not colour alone.
- Opening focuses the open entry's row (or the first row) and scrolls it into view. Arrow keys, Home and End move between rows; Enter or click opens the entry and closes the panel. Selecting goes through `JournalController.switchTo`, so pending edits are flushed first.
- Long lists scroll inside the panel; the panel is clamped to the window. Empty journals show a short plain-language message.
- The interim OPEN ENTRY dropdown from T-07 is removed; Archives and New entry replace it. Delete entry is unchanged.
- The shared close icon's SVG path was malformed and drew a broken glyph; fixed.

## Checks

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck` | pass |
| `npm test` (22 tests) | pass |
| `npm run build:web` | pass (existing 500 kB chunk advisory only) |
| `cargo test --locked` (17 tests), `cargo clippy --all-targets`, `cargo fmt --check` | pass / clean |

New tests: ordering by modification date with entry-number tie-break and no mutation; 2,000 entries all retained; date display; native `list` order against fixed timestamps.

Interactive check in the Vite dev server with an in-memory mock of 60 synthetic entries: the panel opens with the open entry focused and marked, Arrow/Home/End move focus and scroll the list, selecting an entry loads it and closes the panel, the marker follows the new entry, Escape closes and returns focus to Archives, the empty state shows for an empty journal, and the panel fits at 480 × 400.

## Not verified

- Archive selection in the native app with real SQLite storage by hand (the controller path is the same one T-07/T-08 already cover).
- VoiceOver, Windows, and 200% text enlargement.

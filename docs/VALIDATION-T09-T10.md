# T-09–T-10 validation — November 3, 2026

Scope: formatting toolbar (T-09) and basic table editing (T-10). Only synthetic text and a disposable app-data folder were used. No real journal was opened.

## What changed

- `src/editor/extensions.ts` enables headings 1–3, bullet/numbered lists, blockquotes, text alignment (left/center/right), a local font family/size extension limited to the bundled IBM Plex faces and four sizes, and Tiptap tables (no column resizing).
- `src/editor/FormattingToolbar.tsx` replaces the disabled preview controls with a segmented strip: font/size; bold/italic/underline/strikethrough; paragraph style, lists, quote; alignment; table. Active formatting uses `aria-pressed` with a mint fill. Table row/column controls (`+ROW −ROW +COL −COL DEL`) appear only while the caret is inside a table. Tab/Shift+Tab move between cells; Tab in the last cell adds a row.
- `src-tauri/src/journal.rs` accepts the new node types and marks, and checks each attribute against an allowlist (alignment values, heading level 1–3, font values identical to the editor's, cell spans/widths). Unknown nodes, marks, attributes or style values are still refused without writing.
- Schema version stays 1: the change only adds node types and attributes, and entries saved before T-09 load unchanged.

## Checks

| Check | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm test` (18 tests) | pass |
| `npm run build:web` | pass (existing 500 kB chunk advisory only) |
| `cargo test --locked` (16 tests) | pass |
| `cargo clippy --all-targets`, `cargo fmt --check` | clean |

New regression tests: a synthetic fixture (`tests/fixtures/formatted-entry.json`) with every supported format and a table round-trips exactly through the editor schema (JS) and through native save/reload (Rust); legacy unformatted entries still open; editor font/alignment values match the native allowlist; unknown fonts, colors, heading levels, attributes and links are rejected natively; pasted list types are accepted.

## Interactive check (Vite dev server, in-memory mock of the native commands)

Verified in the browser against the real editor and toolbar: heading conversion keeps text; bold on a selection; toolbar reflects bold/italic, heading, list and alignment at the caret; font family and size apply to a selection and are reflected back; insert a 3 × 3 table, Tab through cells, add/delete row and column, delete table. Pasting HTML with an unbundled font, colour, link, image, `h5` and `<ol type="disc">` produced only allowed content. No horizontal scrolling at 480 × 400, 760 × 600 and 1100 × 780; the toolbar wraps and compacts at narrow widths.

Found and fixed during this session: the native validator initially rejected the table cell `align` attribute and pasted list types such as `disc`, which would have shown Save failed.

## Not verified

- Formatting and tables surviving a real app restart were checked by the native round-trip test, not by hand. A manual pass in `npm run dev` is still needed: format text, insert a table, quit, relaunch.
- Windows, keyboard shortcuts on Windows, VoiceOver, and 200% text enlargement.
- Only regular weights are bundled, so bold text uses synthesized bold.

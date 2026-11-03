# T-16 validation — November 4, 2026

Scope: individual entry export and deletion safeguards. Only synthetic entries were used. No real journal was opened.

## What changed

- **Export entry…** next to Delete entry saves pending writing, then opens a native save dialog suggesting the entry's title. The person chooses the format by the file type: **Web page (.html)** or **Plain text (.txt)**; a name without a recognised extension is saved as HTML. The button is available once an entry has been saved.
- **HTML** (`src/domain/export.ts`) is a complete, self-contained document: title, written/last-changed dates, headings, bold/italic/underline/strikethrough, fonts and sizes, alignment, lists, quotes and tables, with a simple readable stylesheet. It has no scripts, links, images or external resources, includes a restrictive Content-Security-Policy, escapes all journal text, and passes only allowlisted style values.
- **Plain text** keeps structure with light markers: the title underlined with `=`, `#` headings, `-` and numbered lists, `>` quotes, and `|`-separated table rows.
- File names come from the title with path separators, control characters and `..` fragments removed, both in the webview and again natively. Files are written next to the destination and renamed, so a failed write never leaves half a file.
- **Deletion safeguards**: the confirmation names the entry (“Delete “Lisbon: day 1”?”), says it also leaves Archives and Search and cannot be undone, suggests exporting first, and focuses Cancel. App shortcuts are inactive while it is open. Deleted entries disappear from Archives and Search immediately.
- Native: command `entry_export`, granted to the main window only; the dialog is opened from Rust and the webview never handles paths.

## Checks

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck` | pass |
| `npm test` (44 tests) | pass |
| `npm run build:web` | pass (existing 500 kB chunk advisory only) |
| `cargo test --locked` (26 tests), `cargo clippy --all-targets`, `cargo fmt --check` | pass / clean |

New tests: HTML output contains every format from the shared fixture and nothing executable or remote; hostile titles, text and style values are escaped or dropped; plain text keeps headings, lists, quotes and table rows; untitled and empty entries export; file names cannot contain separators, control characters or `..`; deleting an entry removes it from the archive list and search results.

Interactive check in the Vite dev server with mocked native commands: export saved the pending edit first and the HTML contained it with formatting; the status named the saved file; the delete dialog named the entry with Cancel focused; after deleting, Archives and Search no longer listed it; Export is unavailable for an unsaved draft.

## Not verified

- The native save dialog was not driven by hand; please export an entry as both .html and .txt and open them outside Terminal.
- Opening the exported HTML in other browsers and the text in Windows editors.

# T-06–T-08 validation — November 3, 2026

Scope: native SQLite storage and migrations (T-06), journal entry lifecycle (T-07), automatic saving and save status (T-08). Only synthetic text and disposable databases were used. No real journal was opened.

## Where each check ran

The Mac's terminals and IDE could not be driven by keyboard in this session, so the automated checks and an end-to-end run of the real app ran on Linux (aarch64) against the same source tree. **macOS native launch, Cmd+Q / menu Quit interception and Windows remain unverified** and need a manual pass (see below).

| Check | Result |
| --- | --- |
| `npm run lint` (Oxlint, deny warnings) | pass |
| `npm run typecheck` (strict TS 7) | pass |
| `npm test` (Node test runner, 14 tests) | pass |
| `npm run build:web` | pass (existing 500 kB chunk advisory only) |
| `cargo test --locked` in `src-tauri` (full Tauri crate, 13 tests) | pass |
| `cargo clippy --all-targets`, `cargo fmt --check` | no warnings |
| `python3 tests/sqlite_schema.py` | pass |

Node 22.23 was used for these runs rather than the pinned 24.22.2; no Node 24-specific behaviour is involved.

## T-06 — schema and migrations

- `0001_initial.sql` creates `entries`, `entry_sequence` and `settings`, with JSON validity, positive-number, unique-number and timestamp checks. Migrations run in an immediate transaction keyed by `PRAGMA user_version`.
- Tests: repeated migration preserves data; a newer schema is refused without mutation; a failing migration rolls back completely; SQL-level round trip, invalid JSON rejection and sequence persistence after deletion.
- End-to-end: first launch created `journal.sqlite3` in the app-data folder automatically and showed an empty draft.

## T-07 — entry lifecycle

- Create (first non-blank edit allocates the next number), retrieve/display (OPEN ENTRY selector plus last-opened entry restored at launch), rename/edit (title and body), delete with confirmation dialog.
- Tests: identity, number and `created_at` stay stable across edits; deleting the middle entry leaves #1 and #3 untouched and the next entry is #4; deleting the highest never reuses its number; a blank draft allocates nothing; stale saves/deletes are refused; failed inserts roll back number allocation; unsupported documents are rejected without writing; last-opened entry is remembered and cleared by "New draft".
- End-to-end: created #1 and #2, deleted #2 through the dialog, created the next entry and it received #3. Restart reopened the last entry with title and body intact.

## T-08 — autosave and save status

- Edits debounce for 400 ms; writes are serialized; pending edits flush before switching, deleting and closing. Status shows Unsaved changes → Saving… → Saved, Empty draft, Save failed or Storage unavailable. Saved is only shown after the native commit returns.
- Fixed during this session: async Tauri commands did not compile (missing `State<'_, …>` lifetime); toggling editor editability emitted a Tiptap update that re-saved unchanged entries on every open/switch (bumping `updated_at` and archive order); startup storage failure was labelled "Save failed"; a failed save trapped the window open with no way out, so the error now offers **Close without saving** after a close attempt fails.
- Tests: slow-write serialization keeps latest content; failure retains the draft and blocks switching/closing, retry succeeds; Saved never shows before commit; rapid repeated switching keeps every edit; debounced autosave needs no manual save; close flushes first; opening untouched entries performs no writes; startup failure is reported and editing stays disabled; abrupt process exit keeps committed data only; reopen preserves document and last entry.
- End-to-end: typed and switched entries before the debounce fired — the edit was committed and the opened entry's revision did not change. Closed the window ~100 ms after typing — the edit was committed before the process exited. Injected a SQLite failure: status showed Save failed, the banner explained the draft is retained, closing was refused, Retry succeeded once storage recovered. `kill -9` during a pending edit: committed text survived, the uncommitted last words were lost, `PRAGMA integrity_check` returned ok.

## Known limitations

- A forced termination can lose edits made in the last ~400 ms plus any in-flight save. No recovery for uncommitted text is claimed.
- The OPEN ENTRY selector is an interim control until the archive popover (T-11). A native select popup opened during a pending save can show a stale list until reopened; choosing from it still flushes first.
- Manual pass still needed on macOS: `npm run dev`, write, switch, delete, quit with Cmd+Q and the red close button, relaunch.

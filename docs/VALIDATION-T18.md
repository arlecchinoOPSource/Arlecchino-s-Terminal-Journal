# T-18 validation — November 4, 2026

Scope: performance, privacy and reliability. Only synthetic data, disposable databases and throwaway profiles were used. No real journal was opened.

## Performance

Measured and documented in [PERFORMANCE.md](PERFORMANCE.md):

- **Startup** on a release build: about 160 ms to page load and 237 ms until the interface requests the journal (median of 5), with no difference between an empty journal and 5,000 entries.
- **Memory**: about 213–232 MB RSS across the app and its WebKit helpers.
- **Large data**: listing 5,000 entries takes 3 ms and saving or opening a 1 MB entry about 2 ms natively. In the UI, Archives opens 5,000 rows in about 1 s and a 140,000-word entry opens in 1.3 s and stays responsive.

Regression limits are enforced by `large_journal_stays_responsive` (native) and `tests/ui/quality.spec.ts`.

## Privacy claims verified

| Claim | Evidence |
| --- | --- |
| No network use at runtime | `lsof` showed **no network sockets** in the app or its WebKit helper processes across 10 release launches. A Playwright session blocking every non-local request recorded **none** while writing, formatting, opening panels and switching all four fonts. A test forbids `fetch`, XHR, WebSocket, EventSource, beacons and remote URLs in app source. The production CSP allows only `'self'` and Tauri IPC. |
| No network code in the desktop builds | `cargo tree -i reqwest` / `-i hyper` print nothing for macOS, Windows and Linux targets; Tauri pulls `reqwest` only on mobile targets. Tauri's devtools/HTTP/updater features are off (tested). |
| Journal content never in logs | A test fails if shipped code calls `console.*`, `println!`, `eprintln!`, `print!`, `dbg!`, `log::` or `tracing::`. The only exception is the measurement-only metrics module, which prints milestone names and milliseconds and whose every use is feature-gated (tested). Release runs produced no stderr output besides those milestones. Native error messages are fixed strings; SQL errors are replaced by a generic message. |
| Journal files are private | The app-data folder is now created `0700` and the database, its WAL/shared-memory files and pre-restore copies `0600` on macOS and Linux. Existing looser files are tightened on open. Measured `0700`/`0600` on every release run; tested. Windows relies on per-user profile ACLs. |
| Least-privilege native access | The window may call only Terminal's journal, preference, backup and export commands and listen for its close event. There is no filesystem, shell, HTTP or dialog permission; dialogs are opened from Rust. Tested in `tests/foundation.test.mjs`. |

## Dependencies reviewed

- **Runtime npm packages** (14): IBM Plex and Literata fonts (OFL-1.1), `@tauri-apps/api` (Apache-2.0 OR MIT), Tiptap 3.32.2 (MIT), React 19.3.1 (MIT). `npm audit` reports 0 vulnerabilities, for runtime and for all packages. A test pins the exact runtime set, so additions need review.
- **Direct Rust crates** (5): `rusqlite` 0.41.1 (bundled SQLite), `serde`, `serde_json`, `tauri` 2.12.5, `tauri-plugin-dialog` 2.8.3, all MIT/Apache-2.0. A test pins this set too. `cargo audit` is not installed here and was not run.
- Development-only tools (Vite, TypeScript, Oxlint, Playwright, Tauri CLI) are not shipped.

## Interruption and recovery

| Scenario | Result |
| --- | --- |
| Process killed during an uncommitted save | Committed data kept, uncommitted change discarded (existing test). |
| Process killed at 0, 40 and 400 ms into restoring a 20,000-entry backup | Original journal intact, integrity `ok`. |
| Process killed 6 s in (after the restore committed) | Fully restored, never partial (new test). |
| Release app killed with SIGKILL after startup, 10 times (empty and 5,000-entry journals) | `PRAGMA integrity_check` = `ok`, all entries present. |
| Damaged database file at launch | Reported as unavailable, file left byte-for-byte unchanged (new test); the interface shows "Storage unavailable" and keeps editing disabled (existing test). |
| Interrupted export or backup write | Written to a temporary file next to the destination, then renamed; the destination is never half-written. |
| Save fails while writing | Writing kept, status "Save failed", close refused until resolved (existing UI and unit tests). |

**Critical data-loss issues found: none.** The known limitation from T-08 still applies: a forced termination can lose roughly the last 400 ms of typing, the autosave delay.

## Checks

`npm run check` passes: lint, typecheck, 47 unit tests, web build, 18 UI tests, fmt, clippy `-D warnings`, 31 native tests and the schema check.

## Not verified

- Windows and Intel Mac performance, memory and permissions.
- Long-running sessions (hours) and memory growth over time.
- `cargo audit` advisory scan (tool not installed).
- Behaviour on a full disk.

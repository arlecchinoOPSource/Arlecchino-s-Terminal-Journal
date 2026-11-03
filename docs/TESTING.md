# Testing

Run everything before considering a change complete:

```sh
npm run check
```

`check` stops at the first failure. A change with a failing check is not complete (see CONTRIBUTING.md). The same suite runs in GitHub Actions on every push to `main` and every pull request (`.github/workflows/ci.yml`): one job for lint, types, unit and UI tests, and native tests on Linux, macOS and Windows.

| Command | What it runs | Proves |
| --- | --- | --- |
| `npm run lint` | Oxlint, warnings as errors | Code quality rules |
| `npm run typecheck` | `tsc --noEmit`, strict | Type safety of the app source |
| `npm test` | Node test runner, `tests/*.test.mjs` | Domain logic: entries, autosave, search, archive order, preferences, shortcuts, export, editor schema, capability policy |
| `npm run build:web` | Type check and Vite production build | The frontend bundles |
| `npm run test:ui` | Playwright in Chromium, `tests/ui/*.spec.ts` | Important interactions in the real React/Tiptap interface |
| `npm run test:native` | `cargo fmt --check`, `cargo clippy -D warnings`, `cargo test`, `tests/sqlite_schema.py` | Native SQLite storage, migrations, validation, backup/restore, preferences, crash safety |

First-time setup for UI tests: `npx playwright install chromium` (a development-only browser download).

## Coverage of critical workflows

| Workflow | Native (real SQLite) | Domain (Node) | UI (Playwright) |
| --- | --- | --- | --- |
| Create, number, edit, reopen an entry | journal tests: stable identity, numbering, reopen | autosave tests | new entry autosaves and reopens after relaunch |
| Blank drafts and untouched entries are not written | blank draft allocates nothing | opening entries does not write | blank draft never stored |
| Autosave, save failure and retry, safe close | abrupt process exit keeps committed data | serialized writes, failure retains draft, flush before switch/close | failed save keeps writing; retry succeeds |
| Delete with confirmation; archives and search update | deletion never reuses numbers | deletion removes from list and search | dialog names entry, Cancel default, entry gone from search |
| Formatting and tables persist | formatted fixture round-trips | schema round-trip, allowlist parity | bold/alignment and table editing saved |
| Archives | newest-first order | ordering, 2,000 entries | keyboard navigation, open entry marked |
| Title search | — | case/Unicode matching, 10,000 titles | live filtering, Enter opens, Escape changes nothing |
| Preferences | stored, reopened, invalid refused | parser, CSS variables, allowlist parity | apply immediately, saved, restored on relaunch, reset |
| Keyboard shortcuts and focus | — | modifier mapping | shortcuts, focus return, inactive under dialogs |
| Backup and restore | round-trip preserves everything; invalid files refused; failed restore rolls back | restore flushes first; failure leaves journal | confirmation with counts, Cancel default, journal reloads |
| Entry export | file-name cleaning | HTML/text output, escaping | export includes unsaved edits, escapes markup |

## What the UI tests do not prove

UI tests run in Chromium against the Vite dev server with the native commands replaced by an in-memory stand-in (`tests/ui/native-mock.ts`) that mirrors the native rules. They do not exercise WebKit (macOS) or WebView2 (Windows), real SQLite, native file dialogs, window close handling, or installation. Those are covered by the native tests and by manual desktop checks recorded in the `docs/VALIDATION-*.md` files.

## Writing tests

- Use only synthetic text. Never use real journal content, real backups or personal paths.
- Storage behaviour belongs in Rust tests against in-memory or disposable databases.
- Prefer accessible locators in UI tests (`getByRole`, names users see) and wait on visible outcomes rather than timeouts.

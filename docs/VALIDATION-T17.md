# T-17 validation — November 4, 2026

Scope: automated testing and regression suite. Only synthetic data was used.

## What changed

- **UI tests** (`tests/ui/`, Playwright 1.64.1 in Chromium): 15 tests driving the real interface against the Vite dev server, with native commands replaced by an in-memory stand-in that mirrors the native rules (number allocation, blank drafts not stored, newest-first listing) and survives reloads so relaunch can be tested. They cover:
  - creating, autosaving and reopening an entry;
  - blank drafts and untouched entries not being written;
  - a failed save keeping the writing, with a working retry;
  - formatting and alignment being saved;
  - table editing;
  - delete confirmation, and deleted entries leaving search;
  - archive order, marking and keyboard opening;
  - live, case-insensitive title search;
  - Escape changing nothing and returning focus;
  - shortcuts, including while a dialog is open;
  - accessible names;
  - settings applying immediately and surviving relaunch;
  - the backup restore confirmation flow;
  - backup export flushing first;
  - entry export escaping markup and including unsaved edits.
- **Scripts**: `npm run test:ui`, `npm run test:native` (fmt, clippy with warnings as errors, cargo test, SQLite schema check), and `npm run check`, which runs everything and stops at the first failure.
- **CI** (`.github/workflows/ci.yml`): on pushes to `main` and every pull request, read-only permissions, no secrets. It runs lint, typecheck, unit tests, the web build and UI tests on Ubuntu (uploading the Playwright report on failure), and native fmt/clippy/tests and the schema check on Ubuntu, macOS and Windows.
- **Policy**: CONTRIBUTING.md now requires `npm run check` to pass; a failing check means the change is not complete. `docs/TESTING.md` maps every critical workflow to its native, domain and UI tests and states what the UI tests cannot prove.

## Checks

| Check | Result |
| --- | --- |
| `npm run check` (lint, typecheck, 44 unit tests, build, 15 UI tests, fmt, clippy `-D warnings`, 26 native tests, schema check) | pass, exit 0 |
| UI tests repeated 10× with 6 workers (150 runs) | 150 passed, no flakes |

Two early test-only problems were fixed while writing the suite: option locators also matched toolbar dropdowns, and the segmented settings controls had to be operated through their radio buttons (which is also how assistive technology reaches them).

## Not verified / follow-up

- The CI workflow had not yet run on GitHub when this was written. Its first result appears on the pull request; Windows and macOS native jobs may expose platform-specific test issues.
- Making the CI checks *required* before merging is a repository setting (branch protection on `main`). It was not changed; the owner can enable it under Settings → Branches.
- UI tests do not run in WebKit or WebView2 and do not touch native dialogs, real SQLite or installation (see docs/TESTING.md).

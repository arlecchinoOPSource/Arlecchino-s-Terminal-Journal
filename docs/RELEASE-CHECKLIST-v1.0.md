# Terminal 1.0 — release checklist

Release candidate: branch `feature/T-20-release-acceptance` (PR #34), version 1.0.0, checked on November 4, 2026. Only synthetic data and throwaway profiles were used.

**Status: not yet ready to publish.** Every item that can be verified from the repository and a Mac passes. The remaining blockers need the owner: merging to `main`, Windows and clean-machine installation, and (recommended) signing.

## PRD release acceptance criteria (PRD §11)

| # | Criterion | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Every core functional requirement implemented and tested | ✅ | T-06 to T-19 merged into the candidate. `npm run check`: 51 unit tests, 19 UI tests × 2 engines (Chromium and WebKit), 31 native tests, schema check. CI green on Linux, macOS and Windows. |
| 2 | Entries persist after reopening | ✅ on macOS | Native 1.0 release app: wrote entries, quit from the menu and with the red close button, relaunched; title, body, bold and table reopened. Edits typed just before quitting were saved both ways. `integrity_check` ok. |
| 3 | Search and archives work reliably | ✅ on macOS | Native app: Archives listed entries newest first and opened one. Search matched case-insensitively. UI tests in both engines; 5,000-entry archive performance test. |
| 4 | Backup export and restore verified | ⚠️ partly by hand | Native app: export through the real macOS save panel produced a valid version-1 backup with all entries and settings. Restore through the open panel could not be driven automatically (system panel); restore logic is covered by native tests, including a kill during restore. **Do once by hand.** |
| 5 | No known critical data-loss bug | ✅ | Kill-during-save and kill-during-restore tests; 10 SIGKILLs of the release build left the database intact; quit and close flush pending edits. Known limit: a forced kill can lose about the last 400 ms of typing. |
| 6 | Keyboard and accessibility reviewed | ⚠️ partly | Shortcuts, focus return and accessible names tested in both engines; contrast meets WCAG AA. **VoiceOver/NVDA not run.** |
| 7 | macOS and Windows installations tested | ❌ Windows / ⚠️ macOS | CI built a universal macOS DMG (x86_64 + arm64, 1.0.0) and Windows NSIS/MSI installers. The local 1.0.0 DMG installed and ran on Apple Silicon. **Clean-machine macOS (including Intel) and any Windows install still need doing**: see [RELEASE.md](RELEASE.md#clean-machine-checklist). |
| 8 | Startup and resource use measured | ✅ macOS | ~160 ms to page load and ~237 ms until the journal is requested; ~213–232 MB RSS ([PERFORMANCE.md](PERFORMANCE.md)). Windows not measured. |
| 9 | Privacy documentation and install instructions available | ✅ | README: installation and privacy sections. RELEASE.md: platform notes, storage locations, unsigned-build steps. VALIDATION-T18: verified no network, no logging, private files. |
| 10 | Installable packages published through an official release | ❌ pending owner | No release exists yet. The workflow creates a **draft** release from a `v1.0.0` tag pushed on `main`; the owner publishes it. |

## Repository audit

| Check | Result |
| --- | --- |
| Secrets in tracked files and the whole history (private keys, GitHub/AWS/Slack/API tokens) | none found |
| Journal, database, backup or key files tracked | none (`.gitignore` covers them) |
| Runtime dependencies | 15 npm packages and 5 Rust crates, pinned by tests; `npm audit`: 0 vulnerabilities |
| Version numbers | 1.0.0 in `package.json`, `tauri.conf.json` and `Cargo.toml`; matches tag `v1.0.0` |
| Open issues | only #20 |
| PR stack | #23–#33 open and stacked; #34 (this candidate) targets `main` and contains them all. CI green on #32, #33 and #34; #30/#31's macOS jobs failed only because no GitHub Mac runner was available (re-run). |
| Docs | Stale "preview" and "unverified at this stage" statements in DEVELOPMENT and ARCHITECTURE updated. |

## Fixed during this check

- **Wordmark could stay invisible.** The launch "power-on" flicker started fully transparent, and WebKit pauses animations in inactive windows, so a window opened in the background showed an empty header. It also replayed on every entry switch. It now plays only at launch, and its first frame is dim rather than invisible.
- **WebKit coverage.** UI tests and CI now run in WebKit (the macOS engine) as well as Chromium.

## Known limitations for the 1.0 notes

- Unsigned builds:
  - macOS asks for confirmation on first open (right-click → Open, or Privacy & Security).
  - Windows SmartScreen asks "Run anyway".
  - This applies until signing certificates are configured.
- Not encrypted: the journal relies on OS account permissions and disk encryption.
- A forced quit or crash can lose about the last 400 ms of typing.
- Untested by hand: Windows, Intel Macs, screen readers, 200% text size.
- No automatic updates; new versions are downloaded from Releases.

## Steps to publish (owner)

1. Run the clean-machine checklist (macOS, including restore through the dialog, and Windows) using the installers from the latest **Release builds** run on PR #34. Record results here.
2. Optionally add Apple signing secrets (and later Windows signing) per [RELEASE.md](RELEASE.md).
3. Merge PR #34 into `main`. It contains #23–#33, which can then be closed as merged.
4. Remove the temporary `feature/T-20-release-acceptance` branch trigger from `release.yml`.
5. Tag `v1.0.0` on `main` and push the tag. The workflow re-runs every check and attaches the installers to a draft release.
6. Paste the CHANGELOG section and the known limitations into the draft, and publish.

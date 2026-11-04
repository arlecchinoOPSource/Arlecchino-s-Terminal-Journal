# T-33 validation — November 4, 2026 (in progress)

Scope: v1-to-v2 regression and cross-platform tests ([#47](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/47)). Run on `feature/T-33-verification`, which stacks every 2.0 feature branch (#50–#54) because they are not merged yet. Repeat the release checks on the merged `development/v2.0.0` commit that will be released.

**Status: partly done. Windows, a clean installation from an installer, assistive technology, and the owner's listening and launch checks are still open, so this does not close T-33.**

## Compatibility evidence

| Check | Result |
| --- | --- |
| Native storage, journal, backup, preferences and migration code compared with `v1.0.0` | Byte-identical. 2.0 changes only `journal_finish_exit` (optional close-sound delay) and the window background in `tauri.conf.json`. |
| `backup::tests::a_1_0_backup_restores_exactly` (new) with the fixture `tests/fixtures/v1-backup.json` (synthetic 1.0-format backup: formatted entry with table, headings and alignment, Unicode, numbering gaps, non-default preferences) | IDs, numbers, titles, rich content, timestamps, revisions and preferences restore exactly. The next entry is number 5; numbers 2 and 4, used in 1.0, are not reused. |
| Existing Rust tests (31): migrations, unreadable or future data, crash safety, backup validation, rollback, numbering | pass |
| v2 release binary opening a journal created with the 1.0 schema (5,000 entries, `scripts/measure_release.py`, 7 launches; T-31/T-32 run) | All launches reached the interface; integrity ok after a forced kill |
| `tests/ui/upgrade.spec.ts` (new), first 2.0 launch for a 1.0 user | pass in Chromium and WebKit |
| — the 1.0 entry and its formatting open | pass |
| — 1.0 writing preferences still apply | pass |
| — the theme is Mint and motion is Full | pass |
| — sound is off and no audio context is created | pass |
| — the startup screen shows and gives way | pass |
| — no journal write or preference write at launch | pass |
| `tests/ui/upgrade.spec.ts`, full session: all four themes, Sound on, Motion Off | pass |
| — the entry is unchanged and switching makes zero writes | pass |
| — typing saves | pass |
| — the theme, motion and sound choices persist across a relaunch | pass |

## Platform evidence (macOS only)

Apple M5, macOS 26.5.1.

| Check | Result |
| --- | --- |
| Release `.app` bundle (`tauri build --bundles app`) | 14.71 MiB. `codesign --verify --deep --strict` valid, **ad-hoc** signature (not notarized). Info.plist: `com.arlecchino.terminal`, minimum macOS 11.0. Version **1.0.0** (bump pending, T-34). |
| Bundled app launched with a throwaway home folder | Runs; opens **no network sockets** (`lsof`). Creates the journal folder `0700` and database files `0600`. `integrity_check` ok after a kill. No stderr. |
| Repeated release launches (T-31/T-32 run) | 14 of 14 reached the interface. Startup, memory and idle CPU are recorded in [PERFORMANCE.md](PERFORMANCE.md) and [VALIDATION-T31-T32.md](VALIDATION-T31-T32.md). |
| CI (macOS 15, Windows Server 2025, Ubuntu 24.04 native tests; Chromium + WebKit UI tests) | Passing on #50–#54 at their head commits |

## Still open before T-33 can close

- **Windows:** no native run, installer, WebView2 audio, startup, or close-sound check yet. CI covers Rust only.
- **Clean installation:** neither a `.dmg` nor a Windows installer has been built or installed on a clean machine. The 2.0 installers are T-34, after the version bump.
- **The owner's hands-on checks:**
  - sounds audible, including startup without a gesture and close with the window hidden
  - themes, animations and startup in the native app
  - quitting during the close sound, then relaunching
- **Assistive technology:** VoiceOver, dictation and Voice Control, a real IME, and text scaling were not tested.
- **The merged branch:** every check here ran on a stacked branch. Rerun `npm run check` and CI on the merged release commit.

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

## Release candidate artifacts — `591ff67`

Built by the release workflow from `development/v2.0.0` at `591ff67` (run [41817026766](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/actions/runs/41817026766), manual: workflow artifacts only, no tag or release). The run's CI passed: web checks plus native tests on Ubuntu 24.04, macOS 15 and Windows Server 2025.

| Platform | Artifact | SHA-256 | Size | Tested | Result |
| --- | --- | --- | --- | --- | --- |
| macOS universal | `Terminal_2.0.0_universal.dmg` | `d8fee43d51c602b91876159db375c14091bcd2f9cdb3a5e8719c887b3e0a9a5d` | 13,419,992 B | Apple M5, macOS 26.5.1, Claude Code, Nov 4 | Mounts without prompts with Terminal.app and an Applications link. Binary is `x86_64 arm64`; version 2.0.0; minimum macOS 11.0. Ad-hoc signature valid; Gatekeeper rejects it (not notarized). Launched from the image with a throwaway home folder: no sockets, database integrity ok, no stderr. **Intel hardware not tested.** |
| Windows x64 | `Terminal_2.0.0_x64-setup.exe` (NSIS) | `d5a97c838020e300f1d1fda6dda5ff7e295d85a77b76ccf91776352455022839` | 6,521,274 B | — | **Not tested.** Identified as an NSIS installer only. Unsigned. |
| Windows x64 | `Terminal_2.0.0_x64_en-US.msi` | `d7eba66155b3a9d838ed9ee9c527ee82018b261acb6773cab2ba37127d964515` | 7,909,376 B | — | **Not tested.** Identified as an MSI (author Arlecchino) only. Unsigned. |

The owner's hands-on approval was of the Mac development candidate before these artifacts existed; it is not copied into the rows above. Remaining gates are in [RELEASE-CHECKLIST-v2.0.md](RELEASE-CHECKLIST-v2.0.md) and issue #56.

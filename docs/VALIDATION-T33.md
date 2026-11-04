# T-33 validation — November 4, 2026 (in progress)

Scope: v1-to-v2 regression and cross-platform tests ([#47](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/47)). Run on `feature/T-33-verification`, which stacks every 2.0 feature branch (#50–#54) because they are not merged yet. Repeat the release checks on the merged `development/v2.0.0` commit that will be released.

**Status: partly done. Windows now has a native test run and installer checks. They found WebView2 network connections, which the owner chose to document (see [Windows findings](#windows-findings)). Assistive technology and the owner's listening and launch checks are still open, so this does not close T-33.**

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

## Platform evidence (Windows)

AMD Ryzen 5 3600, Windows 11 Pro 10.0.26200, 15.9 GB RAM, WebView2 Runtime 156.0.4314.58, Node 24.22.2, Rust 1.99.1 (MSVC). Run with Claude Code on Nov 4 at `591ff67` plus the test fix below. The machine had never had Terminal or a Terminal journal installed.

| Check | Result |
| --- | --- |
| lint, typecheck, `build:web`, `cargo fmt --check` | pass |
| `npm test` (82 unit tests) | **3 failed at `591ff67`**: `tests/privacy.test.mjs` built its root from `URL#pathname` (`/C:/…`) and compared paths with `/` separators, so on Windows the no-logging, no-network and dependency checks never ran. Fixed in [#59](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/pull/59) (`fileURLToPath`, forward-slash relative paths); **82/82 pass** after the fix. |
| `cargo clippy -D warnings`, `cargo test` | pass, 31 tests (the Unix-only `0700`/`0600` permission test is compiled out on Windows). Needed a short `CARGO_TARGET_DIR`: in a very deep checkout the MSVC linker hits the 260-character path limit (`LNK1104`). |
| `tests/sqlite_schema.py` (3) | pass (run with `py -3`; `python3` on stock Windows is the Microsoft Store stub) |
| UI tests, Chromium (the engine behind WebView2) | **45/45 pass** with `--workers=1`. With both browsers in parallel, 3 timing-budget tests failed (startup under 1400 ms ×2, typing with motion on vs off); they pass when run alone. |
| UI tests, WebKit | 14 of 45 fail. Playwright's Windows WebKit (27.2) has no Web Audio (`AudioContext` and `BaseAudioContext` are undefined), so every test that installs the audio mock fails; the remaining failures are timing budgets under load. **Not an app result:** the Windows app runs in WebView2, and WebKit is covered on macOS. |
| NSIS `Terminal_2.0.0_x64-setup.exe` | SHA-256 matches the table below; unsigned. Silent install (`/S`) from a non-admin shell: exit 0 in 2–4 s, per-user into `%LOCALAPPDATA%\Terminal\terminal-journal.exe`, uninstall entry "Terminal 2.0.0 by Arlecchino" in HKCU. File and product version 2.0.0. |
| MSI `Terminal_2.0.0_x64_en-US.msi` | SHA-256 matches; unsigned. Needs elevation: per-machine into `C:\Program Files\Terminal`, entry in HKLM, exit 0, about 11 s. Version 2.0.0. |
| Launch (NSIS ×5, MSI ×2) | Window "Terminal — Arlecchino" every time. Time to window, measured on 4 launches: 1.4 s on the very first launch, 0.26–0.58 s on later ones. Process tree: `terminal-journal.exe` plus six `msedgewebview2.exe`. Creates `%APPDATA%\com.arlecchino.terminal\journal.sqlite3` (+ WAL/SHM) and WebView2 data in `%LOCALAPPDATA%\com.arlecchino.terminal\EBWebView`. |
| Forced kill (`Stop-Process -Force`), then relaunch (×5) | Reopens every time; `integrity_check` ok, `user_version` 1, tables `entries`, `entry_sequence`, `settings`. |
| Existing journal under a different installer (NSIS journal opened by the MSI build) | Opens; integrity ok. |
| Uninstall (NSIS `uninstall.exe /S`; `msiexec /x`) | Exit 0; entry and executable removed; journal folder kept, as documented in [RELEASE.md](RELEASE.md). |
| Network | `terminal-journal.exe` opens none. The WebView2 runtime does: see below. |

### Windows findings

- **WebView2 opens HTTPS connections on launch.** On 6 of the 7 sampled launches (NSIS and MSI), the WebView2 browser process (`msedgewebview2.exe`, the main process, no `--type`) in Terminal's process tree opened TCP connections to Microsoft addresses on port 443 within 2–4 s: `40.99.10.114`, `40.99.33.130`, `40.99.33.178`, `40.104.20.2`, `40.104.210.2`, `52.98.189.242`. `terminal-journal.exe` and the renderer opened none; nothing listened locally. Reverse DNS gives no names. This comes from the WebView2 runtime, not Terminal's code, but it contradicted "Terminal itself never uses the network" on Windows. The repo sets no WebView2 browser arguments. **Owner decision, November 4, 2026: document it, without changing WebView2 settings.** RELEASE.md, README.md and the 2.0.0 CHANGELOG known limitations now say that Terminal's own code makes no network requests and that WebView2 can make its own connections to Microsoft.
- **SmartScreen was not exercised.** The installers were downloaded with `gh run download` and installed silently, so they had no Mark of the Web; the "Windows protected your PC" prompt documented in RELEASE.md was not seen.
- **Not checked on Windows:** typing, saving, export, restore, themes, motion and sounds in the native window (no native UI driver here); WebView2 audio, the startup sound and the close sound; Narrator, IME and text scaling.

## Still open before T-33 can close

- **Windows:** the hands-on native checks in the last bullet of Windows findings.
- **Clean installation:** a `.dmg` on a clean Mac. Windows NSIS and MSI clean installs are recorded above.
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
| Windows x64 | `Terminal_2.0.0_x64-setup.exe` (NSIS) | `d5a97c838020e300f1d1fda6dda5ff7e295d85a77b76ccf91776352455022839` | 6,521,274 B | Ryzen 5 3600, Windows 11 Pro 26200, Claude Code, Nov 4 | Checksum matches. Unsigned. Installs per-user without admin; version 2.0.0; launches; integrity ok after forced kills; uninstall keeps the journal. **WebView2 opened HTTPS connections to Microsoft on launch** ([Windows findings](#windows-findings)). |
| Windows x64 | `Terminal_2.0.0_x64_en-US.msi` | `d7eba66155b3a9d838ed9ee9c527ee82018b261acb6773cab2ba37127d964515` | 7,909,376 B | Ryzen 5 3600, Windows 11 Pro 26200, Claude Code, Nov 4 | Checksum matches. Unsigned. Installs per-machine (UAC); version 2.0.0; opens the existing journal; integrity ok after forced kills; uninstall keeps the journal. Same WebView2 connections. |

The owner's hands-on approval was of the Mac development candidate before these artifacts existed; it is not copied into the rows above. Remaining gates are in [RELEASE-CHECKLIST-v2.0.md](RELEASE-CHECKLIST-v2.0.md) and issue #56.

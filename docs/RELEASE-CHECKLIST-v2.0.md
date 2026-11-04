# Terminal 2.0 — release checklist

Target: **2.0.0 — The Sensory Update**. Status, November 4, 2026: **release candidate; not ready to publish.** Items are ticked only with recorded evidence; unticked items block publication. Evidence: [T-22](VALIDATION-T22.md), [T-23/24](VALIDATION-T23-T24.md), [T-25–27](VALIDATION-T25-T27.md), [T-28–30](VALIDATION-T28-T30.md), [T-31/32](VALIDATION-T31-T32.md), [T-33](VALIDATION-T33.md), [performance](PERFORMANCE.md), [audio assets](AUDIO-ASSETS-v2.0.md).

## Compatibility and reliability

- [x] Upgrade a synthetic 1.0.0 journal; preserve IDs, non-reused entry numbers, timestamps, document content, and formatting. *Native storage code is byte-identical to v1.0.0; the release build opened a 1.0-schema journal; a browser test covers the first 2.0 launch. Installing 2.0 over an installed 1.0 is still in the clean-machine list below.*
- [x] Read and restore compatible v1 backups without partial replacement or data loss. *`a_1_0_backup_restores_exactly` plus the existing rollback and crash tests.*
- [x] Missing/invalid new preferences use safe defaults; existing writing preferences remain intact.
- [x] Autosave, switching, close/quit, failure/retry, deletion, search, archive, and export regressions pass. *CI on #50–#55; native close-sound quit still needs a hands-on check.*
- [x] No unnecessary schema change, runtime network dependency, telemetry, or typed-text logging is introduced. *CSP adds only `connect-src 'self'` for bundled sounds; privacy tests enforce this.*

## Sensory features

- [x] Four themes pass component/state coverage and contrast checks; Mint matches the released baseline.
- [x] Theme restoration has no wrong-theme flash; changing themes does not alter content/selection or trigger journal writes. *Browser evidence; native window background set.*
- [ ] Keyboard pack and original click/success/error/startup sounds are complete, licensed, attributed, local, and optimized. *Done for keyboard, clicks, error, close and startup. **No success sound was supplied**: the owner must supply one or drop it from the 2.0 scope.*
- [x] Upgrading users remain silent until opting in; mute and volume settings work immediately and persist.
- [ ] IME/composition, shortcuts, assistive input, and rapid playback remain responsive and bounded. *Shortcuts and rapid playback are tested; a real IME, dictation and Voice Control are not.*
- [x] All effects follow OS/app reduced motion and leave writing clear and undelayed.
- [x] Startup was implemented last, reflects actual readiness, has no artificial delay, honours saved preferences, and recovers from asset failures. *The 1.4 s animated sequence runs during initialization and can be skipped; see T-31/32.*

## Validation and distribution

- [ ] Existing and new unit, browser, native, and schema checks pass in CI at the exact release commit. *Passing at the candidate `591ff67` on `development/v2.0.0` (run 41817026766, including native tests on Windows and macOS). The release commit on `main` still needs its own green run.*
- [ ] Native macOS and Windows upgrade, startup audio, repeated launch, offline, and clean-install checks are recorded. *macOS: repeated launches, offline and the bundle are recorded; audio and clean install pending. Windows: NSIS and MSI clean install, launch, forced-kill integrity and uninstall recorded in [VALIDATION-T33.md](VALIDATION-T33.md); Terminal's process opens no sockets, but WebView2 opens HTTPS connections to Microsoft; documented in RELEASE.md and the changelog by owner decision (Nov 4); audio not checked.*
- [ ] Accessibility and text scaling results identify actual assistive technologies/platforms tested.
- [x] Startup, memory, idle CPU, and input/audio responsiveness are measured against the v1 baseline. *Native audio latency is not measured.*
- [x] Critical data-loss or startup bugs are resolved; remaining limits are explicit. *None known; limits are listed in each validation file and in CHANGELOG.md.*
- [x] Application manifests and lockfiles agree on the candidate version; changelog, privacy, install and signing notes are updated. *2.0.0 in `package.json`, `package-lock.json`, `tauri.conf.json`, `Cargo.toml` and `Cargo.lock`; `check_version.mjs v2.0.0` passes.*
- [ ] macOS universal and Windows installers match the tested tag/commit; signing/notarization status is stated accurately. *Built from `591ff67`, with checksums recorded in [VALIDATION-T33.md](VALIDATION-T33.md). macOS is ad-hoc signed and Windows is unsigned. Rebuild from the final tag after merging to `main`.*
- [ ] The owner explicitly authorizes tagging/publication after reviewing the evidence.
- [ ] Official release downloads are published and verified.

Use [RELEASE.md](RELEASE.md) for the existing pipeline. A CI artifact or draft release is not a published stable release.

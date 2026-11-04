# Terminal 2.0 — release checklist

Target: **2.0.0 — The Sensory Update**. Status: **planning; not ready for release**. Every unchecked item requires implementation and recorded evidence; this setup does not certify a sensory feature.

## Compatibility and reliability

- [ ] Upgrade a synthetic 1.0.0 journal; preserve IDs, non-reused entry numbers, timestamps, document content, and formatting.
- [ ] Read and restore compatible v1 backups without partial replacement or data loss.
- [ ] Missing/invalid new preferences use safe defaults; existing writing preferences remain intact.
- [ ] Autosave, switching, close/quit, failure/retry, deletion, search, archive, and export regressions pass.
- [ ] No unnecessary schema change, runtime network dependency, telemetry, or typed-text logging is introduced.

## Sensory features

- [ ] Four themes pass component/state coverage and contrast checks; Mint matches the released baseline.
- [ ] Theme restoration has no wrong-theme flash; changing themes does not alter content/selection or trigger journal writes.
- [ ] Keyboard pack and original click/success/error/startup sounds are complete, licensed, attributed, local, and optimized.
- [ ] Upgrading users remain silent until opting in; mute and volume settings work immediately and persist.
- [ ] IME/composition, shortcuts, assistive input, and rapid playback remain responsive and bounded.
- [ ] All effects follow OS/app reduced motion and leave writing clear and undelayed.
- [ ] Startup was implemented last, reflects actual readiness, has no artificial delay, honours saved preferences, and recovers from asset failures.

## Validation and distribution

- [ ] Existing and new unit, browser, native, and schema checks pass in CI at the exact release commit.
- [ ] Native macOS and Windows upgrade, startup audio, repeated launch, offline, and clean-install checks are recorded.
- [ ] Accessibility and text scaling results identify actual assistive technologies/platforms tested.
- [ ] Startup, memory, idle CPU, and input/audio responsiveness are measured against the v1 baseline.
- [ ] Critical data-loss or startup bugs are resolved; remaining limits are explicit.
- [ ] Application manifests and lockfiles agree on the candidate version; changelog, privacy, install and signing notes are updated.
- [ ] macOS universal and Windows installers match the tested tag/commit; signing/notarization status is stated accurately.
- [ ] The owner explicitly authorizes tagging/publication after reviewing the evidence.
- [ ] Official release downloads are published and verified.

Use [RELEASE.md](RELEASE.md) for the existing pipeline. A CI artifact or draft release is not a published stable release.

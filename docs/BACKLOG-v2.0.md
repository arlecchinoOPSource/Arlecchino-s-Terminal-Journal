# Terminal 2.0 — development backlog

Target: **2.0.0 — The Sensory Update**. Base: released **v1.0.0**, commit `7071143de813262f5645d766307c36ffeb515c74`.

The T-21–T-34 order and priorities come from the accepted [2.0 specification](TERMINAL_V2_SPEC.md). Detailed tasks, dependencies, and acceptance checks below translate that specification into reviewable work; they are implementation guidance, not additional feature scope. T-numbers are stable identifiers, not GitHub issue numbers.

Use one milestone, **Terminal 2.0.0 — The Sensory Update**, and **Backlog → In Progress → In Review → Done**. Phase labels distinguish Foundation, Themes, Sounds, Motion, Startup, Verification, and Release. P0 is required groundwork/release work; P1 still belongs to the accepted 2.0 scope. Startup implementation is last among feature work; release verification follows it.

## GitHub tracking

[Milestone](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/milestone/6) · [Project board](https://github.com/users/arlecchinoOPSource/projects/2)

| Work item | GitHub issue |
| --- | --- |
| T-21 | [#35](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/35) |
| T-22 | [#36](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/36) |
| T-23 | [#37](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/37) |
| T-24 | [#38](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/38) |
| T-25 | [#39](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/39) |
| T-26 | [#40](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/40) |
| T-27 | [#41](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/41) |
| T-28 | [#42](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/42) |
| T-29 | [#43](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/43) |
| T-30 | [#44](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/44) |
| T-31 | [#45](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/45) |
| T-32 | [#46](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/46) |
| T-33 | [#47](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/47) |
| T-34 | [#48](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/48) |

## T-21 — Create v2.0 development branch, baseline tests, and update project instructions

**Phase:** Foundation · **Priority:** P0 · **Depends on:** published v1.0.0

**Labels:** P0, setup, documentation, testing

### Tasks

- Create development/v2.0.0 from the published v1.0.0 baseline without changing the release tag.
- Import the accepted specification and append v2 rules to AGENTS.md.
- Record a passing baseline, create the ordered issues/milestone, and establish project tracking.

### Acceptance criteria

- The released 1.0.0 commit is recorded and remains intact.
- The existing regression suite passes with its actual platform limits documented.
- The v2 branch, specification, issue tracking, and contribution workflow are reviewable on GitHub.

## T-22 — Audit existing CSS and establish semantic theme tokens

**Phase:** Themes · **Priority:** P0 · **Depends on:** T-21

**Labels:** P0, design, architecture, interface

### Tasks

- Audit current tokens and hardcoded colours in application chrome.
- Map Dominant, Default Line, Background, and Text Drop to a centralized semantic theme contract, including derived text/state tokens.
- Preserve the exact released Mint colours and avoid writing to journal documents.

### Acceptance criteria

- Mint is visually unchanged against v1.0.0 reference screenshots.
- Components use semantic roles rather than scattered theme literals.
- The token mapping, including current surface differences, is documented and tested.

## T-23 — Implement the four themes and local settings persistence

**Phase:** Themes · **Priority:** P0 · **Depends on:** T-22

**Labels:** P0, feature, settings, interface

### Tasks

- Implement Terminal Mint, Blue Monitor, Ember Orange, and Amber Display using the shared token contract.
- Add a Settings selector with immediate local persistence and safe defaults for missing/invalid preferences.
- Restore the selected theme before showing the main interface and apply it to open panels/dialogs.

### Acceptance criteria

- All four themes share the same layout, controls, and typography.
- Selection persists across restart without a flash of the wrong theme.
- Switching theme preserves editor selection, formatting, draft content, and save state; no unnecessary journal write occurs.

## T-24 — Audit theme consistency and contrast

**Phase:** Themes · **Priority:** P1 · **Depends on:** T-23

**Labels:** P1, design, accessibility, quality

### Tasks

- Review toolbar, rail, editor surroundings, panels, dialogs, focus, selection, disabled, save, and error states in every theme.
- Measure text and control contrast and record the results.
- Check small windows, text scaling, and keyboard navigation.

### Acceptance criteria

- All themes meet applicable AA contrast targets and keep status understandable without colour alone.
- No important component retains an unintended Mint-only colour.
- Theme/state coverage and fixes are recorded with actual evidence.

## T-25 — Build the audio playback manager and sound preferences

**Phase:** Sounds · **Priority:** P0 · **Depends on:** T-24

**Labels:** P0, architecture, settings, feature

### Tasks

- Centralize non-blocking local playback, gain controls, bounded voices, and graceful audio failure handling.
- Add master toggle/volume, keyboard toggle/pack/volume, UI toggle/volume, and startup-sound toggle.
- Use silent defaults for upgrading 1.0 users and preserve safe defaults for missing settings.

### Acceptance criteria

- Audio controls persist locally and mute immediately.
- Initialization/decoding does not block writing or saving.
- Unavailable audio fails without crashing or losing text; repeated playback remains bounded.

## T-26 — Integrate licensed keyboard sound packs

**Phase:** Sounds · **Priority:** P1 · **Depends on:** T-25

**Labels:** P1, feature, accessibility, needs-assets

### Tasks

- Obtain at least one complete keyboard pack with documented redistribution rights, source, and attribution.
- Bundle optimized local samples and connect playback to actual text-input operations.
- Handle IME/composition, paste, shortcuts, modifiers, repeated input, and silent selection deliberately.

### Acceptance criteria

- At least one licensed pack and a Silent option work offline.
- Keyboard sounds remain responsive and obey the master/typing controls.
- Composition and assistive input work; no typed characters are recorded, logged, or transmitted.

## T-27 — Integrate original UI click, success, and error sounds

**Phase:** Sounds · **Priority:** P1 · **Depends on:** T-26

**Labels:** P1, feature, needs-assets

### Tasks

- Integrate Arlecchino's supplied original Ableton click, confirmation, and error exports.
- Record authorship, filenames, formats, relative levels, and asset provenance.
- Trigger sounds from real outcomes via the centralized manager; bound overlapping playback.

### Acceptance criteria

- The three original sounds are bundled locally and work offline.
- Click/success/error playback follows real actions/results and honours every relevant mute/volume control.
- Rapid interaction and failed/missing assets never interrupt writing or saving.

## T-28 — Define retro motion tokens and reusable animations

**Phase:** Motion · **Priority:** P0 · **Depends on:** T-27

**Labels:** P0, design, architecture, accessibility

### Tasks

- Centralize button (60–120 ms), state (100–160 ms), popover (120–200 ms), and dialog (140–220 ms) starting timings.
- Create lightweight mechanical/segmented feedback using CSS where sufficient.
- Add local motion preferences with OS reduced-motion respected; avoid perpetual idle effects.

### Acceptance criteria

- Motion tokens and patterns are documented and reusable across themes.
- Effective reduced motion cannot be overridden by a more animated app setting.
- Motion does not animate journal content, delay input, or require an unnecessary dependency.

## T-29 — Animate buttons, sidebar, toolbar, dialogs, and indicators

**Phase:** Motion · **Priority:** P1 · **Depends on:** T-28

**Labels:** P1, interface, feature, design

### Tasks

- Apply shared press, active-control, overlay, formatting, and status transitions.
- Use transform/opacity where appropriate and preserve focus and layout.
- Keep the retro stepped character controlled and disable decorative motion when requested.

### Acceptance criteria

- All themes use consistent motion behaviour.
- Rapid repeat/open/close interactions do not break state or create layout jumps.
- Input and save/error feedback remain immediate; writing stays clear of decorative overlays.

## T-30 — Test performance, reduced motion, and input responsiveness

**Phase:** Motion · **Priority:** P0 · **Depends on:** T-29

**Labels:** P0, testing, performance, accessibility

### Tasks

- Test effects enabled, disabled, and under OS/app reduced motion, across themes.
- Measure startup, memory, idle CPU, typing responsiveness, and audio overlap against the recorded baseline.
- Exercise long entries, rapid actions, IME, shortcuts, and failure paths with synthetic data.

### Acceptance criteria

- Results include device/OS, configuration, and measured baseline comparisons.
- No unnecessary animation or audio work runs while idle.
- Significant responsiveness or accessibility regressions are resolved before startup work begins.

## T-31 — Design the final startup screen and integrate the original sound

**Phase:** Startup · **Priority:** P0 · **Depends on:** T-30

**Labels:** P0, design, feature, needs-assets

### Tasks

- Begin only after themes, audio/settings, and motion are functional and verified.
- Use the centred TERMINAL wordmark, thin framing, and a segmented indeterminate indicator.
- Integrate Arlecchino's original startup export through the shared sound manager and document its provenance.

### Acceptance criteria

- The logo is the focal point and the chosen theme is respected.
- Startup audio plays at most once per launch and honours saved master/startup/volume settings.
- There are no fabricated percentages or artificial waiting periods; assets failing to load cannot block the editor.

## T-32 — Implement startup readiness, settings, and failure recovery

**Phase:** Startup · **Priority:** P0 · **Depends on:** T-31

**Labels:** P0, feature, reliability, settings

### Tasks

- Tie dismissal to actual required local-data and main-window readiness.
- Add startup-animation toggle, safe timeout/error recovery, and an immediate path when disabled.
- Respect OS/app reduced motion and handle missing visual/audio assets without losing initialization errors.

### Acceptance criteria

- Every tested launch reaches the writing interface or a clear recoverable initialization error.
- No infinite splash, persistent blank window, wrong-theme flash, or repeated startup sound occurs.
- Startup works offline and failure cases do not bypass journal error handling or corrupt data.

## T-33 — Complete v1-to-v2 regression and cross-platform tests

**Phase:** Verification · **Priority:** P0 · **Depends on:** T-32

**Labels:** P0, testing, quality, privacy

### Tasks

- Use synthetic v1 journals/backups/preferences to test upgrade compatibility and recovery.
- Run all four themes, audio controls, reduced motion, repeated launches, save/export/restore, and offline checks.
- Verify native macOS and Windows behaviour and packaging; document actual platforms, metrics, and limits.

### Acceptance criteria

- Existing journal IDs, numbers, timestamps, content, formatting, and backups remain compatible.
- No new telemetry, network service, private-text logging, or data collection exists.
- Platform and accessibility results are recorded honestly; unresolved critical data-loss/startup bugs block release.

## T-34 — Package, document, and publish Terminal 2.0.0

**Phase:** Release · **Priority:** P0 · **Depends on:** T-33

**Labels:** P0, release, documentation, automation

### Tasks

- Update all application versions and lockfiles together; prepare changelog, install instructions, release checklist, and asset-license inventory.
- Reuse the existing gated macOS-universal and Windows installer pipeline.
- Verify upgrade/clean-install artifacts and obtain explicit owner instruction before tagging/publishing.

### Acceptance criteria

- All preceding issues and release gates pass, with compatibility, performance, asset licences, and platform evidence recorded.
- Installers and notes reference the exact validated version/commit and state signing limitations.
- The owner explicitly authorizes publication; 2.0.0 is then available from the official repository.

## Definition of done

Meet the assigned acceptance criteria, run appropriate checks and the existing `npm run check` suite, review manually, record actual native/browser/platform evidence, and merge through a reviewed pull request. Preserve existing writing, backups, and save reliability. New issues stay in Backlog until their dependencies and authorization are satisfied. T-21 preparation does not implement T-22–T-34.

## Asset dependencies

T-26 needs a keyboard pack with redistribution rights. T-27 needs original click, confirmation, and error sounds. T-31 needs the original startup sound. Arlecchino will make the original audio in Ableton. No audio files were included in this setup; `needs-assets` identifies those dependencies. Do not substitute unlicensed or invented sounds and call those issues complete.

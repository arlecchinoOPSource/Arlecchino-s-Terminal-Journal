# T-28–T-30 validation — November 4, 2026

Scope: motion tokens and levels ([#42](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/42)), interface animations ([#43](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/43)), and performance and reduced-motion testing ([#44](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/44)). Built on the T-23/T-24 branch.

The sound phase (T-25–T-27) was skipped at the product owner's request, so there is no audio and no audio-overlap measurement. Sound is still required for 2.0 and must be done before startup work (T-31), which plays the startup sound.

## What changed

- **`tokens.css`**: motion durations and step timings inside the specification ranges.
- **`app.css`**:
  - Every existing transition now uses the motion tokens.
  - New patterns: press, control-on, panel and dialog reveals, overlay fades, and save-meter feedback. Patterns and rules are in [UI-DESIGN-SYSTEM-v2.0.md](UI-DESIGN-SYSTEM-v2.0.md#motion-tokens-and-patterns-t-28-t-29).
  - Rules for each motion level.
- **`src/domain/motion.ts`** and the local `terminal.motion` setting, applied before the first render.
- **`SettingsPanel.tsx`**: **Interface → Motion** (Full, Reduced, Off), with a note when the OS asks for reduced motion.
- No dependency was added. Journal storage, preferences, and backups are unchanged.

## Checks

| Check | Result |
| --- | --- |
| `npm run check` (lint, typecheck, 67 unit tests, build, 58 UI tests in Chromium + WebKit, fmt, clippy, 31 native tests, 3 schema checks) | pass |
| `tests/motion.test.mjs`: token ranges, no literal durations, writing page never animated, level and OS rules | pass |
| `tests/ui/motion.spec.ts` (Chromium and WebKit) | pass |
| — panels animate for 160 ms and receive focus immediately, with no layout shift | pass |
| — nothing runs while idle | pass |
| — Reduced keeps fades only, Off stops everything and survives a reload | pass |
| — OS reduced motion overrides Full | pass |
| — all four themes have the same motion | pass |
| — rapid toggling of Archives, Themes, Search, and bold leaves the panels, focus, and text correct | pass, 30 of 30 repeated runs |
| — no animation targets the writing page during typing | pass |
| — the save-failure indicator is fully visible at once | pass |
| — typing time with motion Full is within the bound of motion Off | pass |
| Native release: startup and memory against v1.0.0 measured back to back, plus idle CPU | equal within noise; see [PERFORMANCE.md](PERFORMANCE.md#terminal-20-motion-check-t-30--november-4-2026) |

Found while testing:

- The failure blink first began dimmed, which delayed the error feedback; it now starts lit.
- The press token was defined but unused; it now drives the press highlight.
- In the rapid-toggle test, a bold shortcut could arrive before the editor had focus. That is a test timing issue (the same one T-21 fixed); the test now waits for focus.

## Not verified

- **Sound:** no audio exists yet (T-25–T-27 skipped).
- **Platforms:** Windows was not measured. The native measurements are from one Apple M5 Mac.
- **IME:** composition was not exercised in this change. The editor and its input handling are unchanged, and nothing in the writing page animates.
- **Screen readers:** not tested.
- **GPU load during animations:** not measured; only idle CPU was.
- **Exit animations:** panels close instantly by design, to avoid delaying focus and state.

> Imported from the product owner's Terminal 2.0 planning response in Main Chat on November 4, 2026. This is the accepted target specification. The current setup task authorizes T-21 preparation; feature implementation is tracked separately in T-22–T-34. Microsoft Word support remains deferred to 3.0.

# TERMINAL 2.0 — THE SENSORY UPDATE

**Publisher:** Arlecchino
**Target version:** 2.0.0
**Status:** Approved for development
**Base version:** Terminal 1.0.0

## 1. Project Objective

Terminal 2.0 expands the application's aesthetic and sensory experience through four major features:

1. A multi-theme color system.
2. Optional sound effects for typing and interface interactions.
3. Smooth retro-futuristic interface animations.
4. A branded startup experience.

The release should make Terminal more expressive and satisfying to interact with while preserving the lightweight, private, offline-first journaling experience established in version 1.0.

**Fundamental rule:** New visual and audio features must never compromise journal reliability, readability, responsiveness, or the user's ability to write without distractions.

## 2. Scope

### Included in 2.0

- Three additional color themes: Blue, Orange, and Yellow.
- Preservation of the original Mint theme.
- Theme selection in application settings.
- Keyboard sound-pack support.
- Original button-click, confirmation, and error sound effects.
- Adjustable sound preferences.
- Animated interface controls and transitions.
- Motion accessibility settings.
- Branded startup screen with centered TERMINAL logo.
- Startup loading indicator.
- Original startup sound created by Arlecchino.
- Performance, accessibility, and regression testing.

### Excluded from 2.0

- Microsoft Word DOCX import/export.
- Additional writing or document-formatting tools.
- Cloud synchronization.
- Accounts and online services.
- AI writing features.
- Theme marketplaces or user-created theme editors.
- Sound-pack downloads from an online service.
- New journal database features.

**Microsoft Word integration and editor improvements are deferred to Terminal 3.0.**

---

# FEATURE A — THEMES

## 3. Color Architecture

Implement a centralized theme system based on semantic design tokens.

Every theme must define these four core roles:

### Dominant

The brightest principal theme color.

Used for:
- TERMINAL logo highlights.
- Active toolbar buttons.
- Focus indicators.
- Selection states.
- Primary accents.
- Status lights and active progress segments.

### Default Line

A darker version of the dominant color.

Used for:
- Interface frames.
- Dividers.
- Input outlines.
- Inactive buttons.
- Sidebar borders.
- Secondary technical decorations.

### Background

The dominant dark surface color.

Used for:
- Application background.
- Sidebar.
- Header.
- Toolbar.
- Dialog surfaces, where appropriate.

### Text Drop

The darkest surface color.

Used for:
- Main writing area.
- Recessed editor surfaces.
- Deep inset panels.
- Areas requiring maximum visual contrast.

Additional semantic tokens may be derived for ordinary text, muted text, hover, pressed, disabled, error, focus, and glow effects.

## 4. Theme Selection

Four themes must be available:

1. Terminal Mint — original appearance and default.
2. Blue Monitor — cool blue CRT aesthetic.
3. Ember Orange — warm orange identity.
4. Amber Display — yellow phosphor-monitor aesthetic.

All themes must share:
- Identical layouts.
- Identical controls.
- Identical typography.
- Identical animation behavior.
- Consistent semantic contrast and accessibility.

## 5. Theme Behavior

- Theme selection is available in Settings. *(Amended by the product owner, November 4, 2026: themes have their own Themes rail panel between Archives and New entry instead; see UI-DESIGN-SYSTEM-v2.0.md.)*
- Selecting a theme updates the interface immediately.
- The chosen theme is saved to local preferences.
- The theme is restored before the main interface becomes visible.
- Theme changes must not alter journal content.
- Theme changes must not trigger unnecessary editor data writes.
- Open popovers and dialogs must follow the selected theme.
- No network access is necessary.

Terminal Mint must remain visually consistent with the existing version 1.0 design.

## 6. Theme Acceptance Criteria

- All four themes display correctly.
- No important component retains an unintended hardcoded theme color.
- Theme selection persists after restarting the app.
- All themes remain readable and accessible.
- Switching themes causes no text loss, cursor displacement, or editor interruption.
- No visible flash of an incorrect theme appears at startup.

---

# FEATURE B — SOUND ENGINE

## 7. Sound Categories

Terminal 2.0 introduces optional local sound feedback.

### Keyboard Sounds

Users may select from packaged keyboard sound packs.

Initial requirements:
- At least one complete keyboard sound pack.
- Optional additional keyboard packs.
- Silent option.
- Adjustable typing volume.

Keyboard audio should feel responsive, with minimal latency.

A small number of sample variations may be used to reduce repetitive mechanical playback.

### Interface Sounds

*(Amended by the product owner, November 4, 2026: sound has its own Sounds rail panel; clicks are three distinct sounds for icon menus, typesetting and text editing taken from licensed CC0 packs; Arlecchino supplied the startup, close and error sounds. See UI-DESIGN-SYSTEM-v2.0.md.)*

Arlecchino will create original sounds in Ableton Live for:

- Button activation.
- Confirmation or successful operation.
- Error or failed operation.
- Startup sequence.

These sounds must be stored locally within the application.

## 8. Audio Preferences

Provide:
- Master sound enable/disable.
- Master volume.
- Keyboard sound enable/disable.
- Keyboard pack selector.
- Keyboard volume.
- Interface sound enable/disable.
- Interface volume.
- Startup sound enable/disable.

Sound must be disabled by default for existing 1.0 users upgrading to 2.0, unless they explicitly enable it.

Settings persist locally.

## 9. Audio Implementation Rules

- Sound effects must never block interaction.
- Sound playback must not interrupt writing or saving.
- Keyboard sounds should react to actual text-input operations rather than indiscriminately to every raw key event.
- Avoid unwanted sounds from modifier keys, shortcut combinations, or unrelated keyboard activity.
- Respect accessibility input methods and IME text composition.
- Never record, transmit, or log typed characters.
- Audio decoding and initialization should avoid unnecessary startup delay.
- Sound failures must not crash the application.

### Audio Asset Guidelines

- Prefer short, optimized local audio files.
- Avoid unnecessarily large uncompressed sample libraries.
- Use a consistent naming convention.
- Normalize sounds to comfortable relative levels.
- Prevent uncomfortable overlapping playback.
- Do not clip or distort on repeated interactions.

Externally sourced keyboard packs must have a license permitting redistribution within a publicly released desktop application. Record the source and attribution requirements.

## 10. Sound Acceptance Criteria

- Sound preferences save correctly.
- Sounds work offline on macOS and Windows.
- Typing remains responsive when keyboard audio is enabled.
- Repeated button presses do not produce uncontrolled audio stacking.
- Startup sound obeys the user's preference.
- Muting works immediately.
- No private text is captured or transmitted.
- Third-party audio licensing is documented.

---

# FEATURE C — RETRO ANIMATIONS

## 11. Animation Philosophy

Animations must reflect the existing retro-computer identity.

Desired characteristics:
- Mechanical.
- Robotic.
- Segmented.
- Slightly abrupt in timing.
- Precise and responsive.
- Inspired by early computer interfaces and futuristic control systems.

Animations should feel intentionally digital, rather than soft, bouncy, or organic.

**Important distinction:** The visual style can appear stepped or mechanical while the underlying rendering remains smooth and efficient.

## 12. Planned Animations

### Buttons

- Brief highlight on activation.
- Pressed-state brightness change.
- Optional angular or segmented accent.
- Immediate feedback without input delay.

### Sidebar

- Active control highlights.
- Search panel entrance.
- Archive panel entrance.
- Clear selected-state transitions.

### Toolbar

- Active formatting feedback.
- Compact dropdown transitions.
- Brief visual confirmation of actions.

### Dialogs and Popovers

- Short, controlled entrance/exit transitions.
- Subtle segmented reveal where appropriate.
- No prolonged or decorative movement.

### Status Indicators

- Save indicator transitions.
- Segmented progress animations.
- Error and success state feedback.

## 13. Animation Timing Guidelines

Suggested starting ranges:
- Button feedback: 60–120 ms.
- Control state changes: 100–160 ms.
- Popover entrances: 120–200 ms.
- Dialog entrances: 140–220 ms.

Timing values may be refined through testing.

Use step-based easing selectively for retro character and standard smooth interpolation for position or opacity where appropriate.

## 14. Performance and Accessibility

- Prefer CSS transitions for simple interactions.
- Use a dedicated animation library only where it provides meaningful benefits.
- Prefer transform and opacity for animated movement.
- Avoid costly continuous layout recalculations.
- Support operating-system reduced-motion preferences.
- Offer an in-app motion reduction or disable option.
- Never animate journal text during normal typing.
- Never delay user interactions for animation completion.

## 15. Animation Acceptance Criteria

- Interactions remain responsive.
- Animations are consistent across themes.
- Reduced-motion mode works.
- Popovers do not cause layout jumps.
- Rapid repeated interactions do not break component state.
- CPU and GPU usage remain reasonable when idle.
- The editor remains unaffected by visual effects.

---

# FEATURE D — STARTUP EXPERIENCE

## 16. Priority and Scheduling

**The startup experience must be implemented last.**

All themes, sounds, animations, and related settings must be functional before development of the final startup sequence begins.

## 17. Startup Visual Direction

Terminal displays a branded retro-futuristic initialization screen.

The primary visual composition includes:

- Near-black or theme-colored dark background.
- Centered TERMINAL wordmark.
- CRT-inspired phosphor glow.
- Thin technical framing.
- A segmented loading/progress indicator.
- Minimal initialization text.
- Optional small Arlecchino identity label.

The TERMINAL logo must remain the dominant visual element.

The design should resemble a vintage computer initialization sequence rather than a modern consumer-app loading animation.

## 18. Startup Sound

The startup screen plays an original sound composed by Arlecchino in Ableton Live.

Requirements:
- Plays at most once per application launch.
- Respects startup sound and master volume settings.
- Does not delay startup unnecessarily.
- Does not require network access.
- Does not interfere with later typing or interface sounds.
- Fails gracefully if audio playback is unavailable.

## 19. Loading Behavior

The startup screen must be integrated with real application initialization.

Requirements:
- Avoid artificial loading delays.
- Do not show fabricated loading percentages as if they represent actual initialization.
- A segmented indeterminate animation is acceptable until readiness can be determined.
- Close the startup screen when the main window and required local data are ready.
- Prevent a persistent blank screen or infinite loading state.
- Allow the application to open even if a visual or audio startup asset fails.

The startup sequence must not become an obstacle to journaling.

## 20. Startup Preferences

Provide an option to:
- Enable or disable the startup animation.
- Enable or disable the startup sound.
- Respect reduced-motion settings.

Users who disable the startup sequence should reach the writing interface as quickly as possible.

## 21. Startup Acceptance Criteria

- Centered TERMINAL logo appears correctly.
- Loading indicator behaves correctly.
- Original sound plays when enabled.
- Settings are respected.
- Startup works offline.
- No unnecessary startup delay occurs.
- Windows and macOS launches are tested.
- Invalid or missing sound assets do not prevent launch.
- The user reaches the editor reliably.

---

# 22. QUALITY AND RELEASE REQUIREMENTS

Terminal 2.0 must maintain compatibility with existing journal entries, backups, and preferences.

Before release:
- Test upgrading from version 1.0.0.
- Verify journal content remains unchanged.
- Test all four themes.
- Test audio controls and mute behavior.
- Test reduced-motion behavior.
- Test opening and closing the app repeatedly.
- Test macOS and Windows packaging.
- Measure startup time, memory usage, and idle CPU usage.
- Confirm offline functionality.
- Confirm no new telemetry or data collection.
- Verify third-party asset licenses.

## 23. Completion Criteria

Terminal 2.0 is considered complete when:

1. All four features are fully implemented.
2. No critical data-loss or application-startup bugs remain.
3. Version 1.0 journals remain compatible.
4. Settings persist correctly.
5. The application remains responsive with optional effects enabled.
6. Accessibility preferences are supported.
7. Release builds pass testing.
8. Documentation and release notes are updated.

**The release should add atmosphere, not friction.**

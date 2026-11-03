# TERMINAL — Visual Design System

> Historical specification. Superseded for future UI work by [v0.2 — Personal archive terminal](UI-DESIGN-SYSTEM-v0.2.md), approved November 3, 2026. Retained to explain the original mockup and earlier implementation.
**Design version:** 0.1
**Reference:** Original Terminal interface and Arlecchino identity mockups

## 1. Visual Philosophy

Terminal follows an understated, terminal-inspired aesthetic.

Core visual principles:

- Minimal ornamentation.
- Thin geometric outlines.
- Dark, nearly monochromatic surfaces.
- Mint-green typography and accents.
- Ample breathing space.
- Compact controls.
- Consistent typography.
- Subtle interaction feedback.
- No distracting animations or decorative dashboards.

The interface should feel like a modern writing tool with the atmosphere of vintage computing, not a literal command-line interface.

## 2. Color Palette

### Primary Colors — Sampled from Mockups

- Forest Black: `#16231D` — Main editor and application background.
- Near Black: `#090B0C` — Exterior surfaces and branding.
- Terminal Mint: `#B0E2CC` — Primary text, selected controls, and outlines.

### Supporting Colors — Proposed

- Muted Mint: `#84AC9A` — Secondary labels and inactive controls.
- Raised Surface: `#20332A` — Popovers and hovered surfaces.
- Focus Mint: `#D0F8E7` — Keyboard focus and active input outlines.
- Error Rose: `#F0A6A6` — Save failures and destructive-action warnings.

Supporting colors should remain restrained and consistent with the three original brand colors.

## 3. Typography

### Brand and Interface

Recommended typeface: IBM Plex Sans Condensed, with italic styling for the wordmark, select headings, and decorative labels.

Characteristics:
- Slightly condensed.
- Clean, modern forms.
- Compatible with a technical, terminal-inspired identity.
- Readable in compact controls.

### Writing Editor

Default typeface: IBM Plex Sans, regular.

Optional editor families:
- Sans-serif.
- Serif.
- Monospace.

Actual journal paragraphs should be regular, upright text by default. The italic aesthetic should not be forced onto long-form writing.

Suggested sizes:
- Brand/title display: 28–36 px when displayed prominently.
- Entry title: 24 px.
- Editor body: 16 px.
- Toolbar labels: 13–14 px.
- Metadata and timestamps: 12–13 px.

All sizes must scale appropriately with operating-system accessibility settings.

## 4. Spacing and Layout

Base spacing unit: 4 px.

Common spacing increments: 8, 12, 16, 24, 32, 48 px.

### Desktop Structure

- Outer application padding: 12 px.
- Sidebar width: approximately 76 px.
- Gap between sidebar and workspace: 24 px.
- Toolbar height: approximately 74 px.
- Gap between toolbar and editor: 18–20 px.
- Main editor: fills remaining available width and height.
- Writing column: approximately 680–760 px maximum width.
- Editor content padding: 32 px or more on spacious windows.

The original wireframe's distinct bordered panels should be preserved.

The main writing workspace should remain the dominant visual element.

### Resizing

- Sidebar width remains stable.
- Main workspace expands and contracts.
- The writing column is centered within the workspace.
- Excess toolbar controls collapse into an overflow menu when necessary.
- Popovers stay within the visible window.

## 5. Component Specifications

### A. Left Sidebar

Always visible on desktop.

Top controls:
1. Search.
2. Archives.
3. New entry.

A small settings control may occupy the bottom of the rail.

Each icon should:
- Have a clear hover state.
- Show an accessible tooltip.
- Support keyboard focus.
- Display an active state when its corresponding panel is open.

### B. Search Overlay

Triggered by the search icon or a keyboard shortcut.

Behavior:
- Appears over the upper workspace rather than navigating to a new page.
- Uses the same background and thin-outline visual language.
- Immediately focuses the search field.
- Displays matching titles underneath.
- Shows entry numbers or dates to distinguish similar titles.
- Closes on Escape or selection.

Recommended maximum width: approximately 480 px.

### C. Archive Popover

Triggered by the archive icon.

Behavior:
- Appears immediately to the right of the sidebar.
- Uses a raised dark background with mint outlines.
- Contains a compact list of entries.
- Displays each entry's title and a smaller date label.
- Highlights the currently open entry.
- Scrolls internally when the list becomes long.

Recommended width: 260–300 px.

The archive panel should not permanently reduce the main writing area's width.

### D. Formatting Toolbar

A horizontal panel above the editor.

Suggested groups:
- Font family and size.
- Bold, italic, underline, strikethrough.
- Paragraph styles and lists.
- Text alignment.
- Table insertion.
- Undo and redo.

Use simple icons with minimal labels. Dividers may separate groups.

Avoid large ribbon-style menus or numerous visible submenus.

### E. Journal Editor

- Large, quiet writing surface.
- Entry number shown as subtle metadata.
- Editable title prominently displayed.
- Main text left-aligned by default.
- Comfortable line height around 1.5–1.7.
- Clear paragraph spacing.
- No distracting border around each paragraph.
- No unnecessary controls inside the writing surface.

### F. Save State

A small, unobtrusive indicator displays:
- Saving…
- Saved.
- Save failed.

It may appear in the toolbar's far-right corner.

### G. Dialogs

Used sparingly for destructive or important operations:
- Delete entry.
- Restore backup.
- Confirm replacement of existing journal data.

Dialogs use the existing palette, thin outlines, and simple language.

## 6. Motion and Feedback

- Hover feedback: subtle color or background changes.
- Panels: short fade or minimal slide transitions.
- Avoid bouncing, elaborate loading animations, or decorative particle effects.
- Respect reduced-motion accessibility preferences.
- Never delay typing or saving for animation.

## 7. Branding

Application name: Terminal.

Developer identity: Arlecchino.

Logo: Stylized lowercase italic `t` paired with a terminal prompt-style `>` symbol, inside a square mint outline.

The logo should work in:
- Application icons.
- GitHub profile and repository graphics.
- Small dock and taskbar sizes.
- Dark monochromatic environments.

The interface need not display the full Arlecchino wordmark at all times. Its presence can be reserved for the About window, startup identity, and release materials.

## 8. Accessibility

- Meet WCAG AA text contrast targets where applicable.
- Give keyboard users visible focus indicators.
- Provide accessible names for icon-only buttons.
- Do not use color alone to indicate errors.
- Support text scaling and common keyboard interactions.
- Test behavior with macOS VoiceOver and Windows Narrator.

## 9. Design Constraints

Avoid introducing:
- Cards for every piece of content.
- Large colorful action buttons.
- Gradients and glassmorphism.
- Decorative illustrations inside the editor.
- Excessively rounded controls.
- Animated sidebars.
- Streak counters or productivity dashboards.
- Persistent floating widgets.

Minimalism should never hide essential actions or important error messages.

# TERMINAL — Visual Design System

**Design version:** 0.2  
**Direction:** Personal archive terminal  
**Approved scope:** Documentation and future UI guidance only, November 3, 2026  
**References:** Nine visual references supplied by the product owner in the design revision request.

This specification supersedes [v0.1](UI-DESIGN-SYSTEM-v0.1.md) for future visual implementation. It changes presentation, not product scope, architecture, or data behavior. It does not authorize source changes. Existing application screens may still reflect v0.1 until a separate implementation request.

## 1. Design direction

Terminal should feel like a personal writing console built from an older computer terminal: precise, rectangular, typographic, and slightly industrial. Use the visual structure of archival screens, telecommunications terminals, and restrained science-fiction interfaces.

The interface should have a distinct machine-like identity. Use monospaced labels, narrow title strips, segmented controls, visible rules, aligned metadata, and occasional clipped corners. Place visual detail around the writing area. Keep the writing itself uninterrupted.

The overall composition remains simple: a fixed menu on the left and the dominant text field on the right. The references guide the treatment of those regions; they do not introduce extra dashboards or product features.

### Fixed decisions

- Preserve the left rail and its menu order: Search, Archives, New entry; Settings stays at the bottom. Preserve current action semantics and availability. Restyling must not enable unfinished actions.
- Preserve the main writing field on the right, including title and body editing. It remains the primary destination, not a tab among several dashboards.
- Preserve Forest Black `#16231D`, Near Black `#090B0C`, and Terminal Mint `#B0E2CC` exactly.
- Preserve offline operation, honest save states, keyboard access, readable text, and the existing feature boundaries.
- Redesign the remaining presentation: typography, header, toolbar, borders, spacing, metadata, controls, overlays, status area, and restrained surface detail.

## 2. Reference interpretation

Image numbers refer to the order in the owner's nine-image request. The following descriptions record the visual evidence without claiming an original creator or exact font identification.

| Reference | Adopt | Translate or omit |
| --- | --- | --- |
| 1 — Yellow satellite broadcast console | Rectangular modules, inverse title strips, monospaced labels, ruled divisions, small alignment marks | Convert yellow to Terminal Mint. Omit globe, telemetry, fake connection states, graphs, and measurement clutter. |
| 2 — Identity record with fingerprint and eye | Archive-record hierarchy, aligned label/value rows, fine rules, compact record headings | Omit biometric imagery, policing language, simulated identity data, and tiny pixel text. |
| 3 — Green personal-site window | Strong outer frame, mint header/footer strips, simple inset controls, dark interior | Keep the existing two-region journal layout. Omit the additional profile, image, and memo columns. |
| 4 — Sony telecommunications screen | Bracketed headings, monospaced command labels, framing interrupted by labels | Use Terminal's identity only. Omit third-party logos, payment/phone functions, neon saturation, and chromatic distortion. |
| 5 — Bell Atlantic telecommunications screen | Broad rules, compact labels, carefully aligned modular information | Translate colored blocks into the retained palette. Omit advertisements, hotline data, and oversized brand banners. |
| 6 — Layered science-fiction terminal windows | Framed panel headers, deliberate hierarchy, restrained corner details | Overlays may layer only when opened by the user. Omit decorative wireframes, login simulation, gauges, and colored glow. |
| 7 — Mint-on-black message interface | Primary reference for selected rows, clipped corners, content hierarchy, quiet mint/black contrast | Keep the left rail instead of replacing it with a permanent message list. Omit security levels and game commands. |
| 8 — Green equipment console | Primary reference for header strips, ordered rows, separators, technical typography | Keep the journal dominant. Omit challenge systems, statistics, countdowns, rewards, and physical monitor casing. |
| 9 — Four wireframe consoles | Small geometric accents, bracketed borders, disciplined edge labeling | Omit the wireframe illustrations, multiple bright colors, decorative graphs, and dense competing panels. |

References 7 and 8 set the hierarchy and restraint. References 1, 3, 4, and 5 supply the terminal character. References 2, 6, and 9 contribute occasional framing details. Do not combine every motif in every component.

## 3. Color and surface tokens

| Token | Value | Use |
| --- | --- | --- |
| Forest Black | `#16231D` | Main writing surface, rail interior, input backgrounds |
| Near Black | `#090B0C` | Outer canvas, title-strip recesses, inverse text |
| Terminal Mint | `#B0E2CC` | Main text, borders, active control fills |
| Muted Mint | `#84AC9A` | Secondary metadata and quiet rules |
| Raised Surface | `#20332A` | Hovered controls and overlay interiors |
| Focus Mint | `#D0F8E7` | Keyboard focus outlines |
| Error Rose | `#F0A6A6` | Genuine failure/destructive warnings only |

Supporting colors carry forward from v0.1; they are not a new accent palette. Never import yellow, saturated green, blue, orange, or magenta from the references.

Use flat colors. No glassmorphism, broad gradients, translucent writing panels, colored shadows, or large luminous regions. An active control or selected archive row may invert to Terminal Mint with Near Black text. A whole page must not invert merely for decoration.

Target a mostly dark screen: roughly 85–90% of the visible shell should remain dark at rest. This is compositional guidance, not a runtime calculation. Mint fills identify selected or primary actions.

## 4. Typography

### Interface

- Use **IBM Plex Mono** for navigation labels, toolbar labels, panel titles, entry metadata, status labels, and shortcut hints.
- Use **IBM Plex Sans Condensed**, upright medium or semibold, for the compact TERMINAL wordmark and larger interface headings.
- Remove the default italic treatment from interface headings and metadata. Italics remain available within user-authored writing and in the existing `t >` brand symbol.
- UI section labels use uppercase and approximately `0.06em` letter spacing. Buttons may use uppercase for short verbs. Explanatory copy uses normal sentence case.
- Do not uppercase, track out, or otherwise transform journal titles or body text.
- Use tabular numerals for entry numbers and dates. Decorative leading zeros are optional display formatting; never change stored numbers or imply a number exists for an unsaved draft.

### Writing

- Retain **IBM Plex Sans**, regular, as the default body font. The surrounding console carries the retro character; long-form writing stays readable.
- Title: 24–28 px equivalent, upright, left aligned with the body. Replace the centered, italic-looking entry presentation.
- Body: 16–18 px equivalent; default 17 px, line height 1.65. Paragraph spacing: approximately 1em.
- Existing planned sans, serif, and monospace preferences remain part of the settings backlog. Do not add a font picker solely to demonstrate the redesign.

### Sizes and assets

- Compact brand: 20–24 px equivalent.
- Panel headings: 14–16 px; normal UI labels: 13–14 px.
- Metadata and shortcut hints: at least 12 px. Never reproduce the references' illegible microtext.
- Express implementation sizes in scalable units and test text enlargement. Do not rasterize labels or emulate pixelation on meaningful text.
- IBM Plex Mono is a future font addition, not installed by this documentation update. Verify the exact distribution's license and bundle only required weights locally when implementation is authorized. No runtime font downloads.

## 5. Layout and proportions

Base spacing unit: 4 px. Use 4, 8, 12, 16, 24, 32, and 48 px consistently.

### Desktop composition

1. A narrow left rail contains the existing menu.
2. To its right, a compact identity strip identifies Terminal and the writing workspace.
3. A segmented formatting bar sits below the strip.
4. The writing panel fills the remaining workspace.
5. A narrow status strip sits at the lower edge of that workspace.

The header and status strip belong to the right workspace. Do not add a full-screen control dashboard, permanent second sidebar, bottom navigation menu, or a third content column.

Suggested starting geometry:

- Outer padding: 12 px, reducing to 8 px in compact windows.
- Rail width: 76 px; 60 px in compact windows. Retain the menu's position and order.
- Rail/workspace gap: 12 px; 8 px compact. Replace v0.1's wide 24 px gap.
- Identity strip: approximately 32 px, with content-driven growth under text scaling.
- Formatting bar: approximately 44–48 px for one row. Replace v0.1's 74 px floating panel.
- Workspace panel gaps: 8 px, with aligned edges.
- Writing padding: 32–48 px on a large window, 16–24 px compact.
- Writing column: max-width approximately 720 px, centered inside the right panel. Title and paragraphs align left within it.
- Status strip: approximately 28–32 px, growing if text wraps.

Heights are starting sizes, not clipping constraints. Use flexible layout and natural growth. At desktop sizes, the editor should occupy at least about 70% of the workspace height; controls must not compete with it.

## 6. Frames and decorative details

- Use square corners for ordinary controls and panels. No pills or large rounded cards.
- Standard rules are 1 CSS px. Use a 2 px focus outline, and at most a 2 px external frame when necessary for hierarchy.
- A panel may have one short clipped corner, approximately 6–8 px, or two small corner registration ticks. Do not use both on every panel.
- Clipped decoration must not clip text, reduce the hit target, or cut off focus outlines. Keep the underlying interactive rectangle intact.
- A panel header may interrupt its top rule: `ARCHIVES`, `SEARCH`, or `WRITING TOOLS`. Keep labels descriptive and associated with their content.
- An inverse mint title tab is appropriate for the active overlay or selected item. Do not fill all headers with mint simultaneously.
- Use fine dividers and consistent alignment instead of additional nested boxes. Keep title and body inside one writing panel; do not frame every paragraph.
- Small registration marks may sit in outer gutters. No meaningless serial numbers, fake coordinates, fake logs, security classifications, or decorative paragraphs.

### CRT atmosphere

Use a very faint, static horizontal texture only in the outer canvas and non-text header margins. Starting target: a 1 px line every 4 px at no more than 3% opacity. It must be invisible behind writing, search results, labels, and dialogs. If it reduces clarity or causes moiré at any tested scale, remove it.

Do not blur, distort, flicker, shake, add RGB fringes, simulate screen curvature, animate scanlines, or add a moving scan beam. Do not place a texture layer over the entire app. No artificial typing delay, boot sequence, terminal beep, or ambient animation.

## 7. Component instructions

### Left menu

Preserve Search → Archives → New entry, with Settings below. Use consistent geometric line icons on a 20–24 px grid, not emoji. Each action has at least a 44 × 44 px hit target.

The rail should look like a vertical command strip. Use one outer frame and subtle separators or brackets around controls. Avoid individually floating, rounded tiles. Active action: mint fill and Near Black icon, with an accessible active/expanded state. Disabled actions remain visibly unavailable. Retain accessible tooltips and labels; short visible captions are optional only if they fit without microtext.

### Identity strip

Display `TERMINAL` at the left and a short descriptive label such as `JOURNAL` at the right. Keep Arlecchino credit in About or as quiet footer text. Do not reproduce the references' giant corporate logos. Preserve the recognizable `t >` brand symbol, rendered cleanly without glow.

Do not add simulated online status, battery level, live clock, security clearance, or version-like numbers without a real purpose. App version may appear in About.

### Writing tools

Use a compact strip with thin separators between existing functional groups: font/size; inline formatting; paragraph/list controls; alignment/table controls; undo/redo. Their implementation remains governed by the backlog.

Font fields look like inset rectangular fields with explicit labels. Formatting buttons have clear hover, pressed, disabled, and keyboard-focus states. Active formatting uses a mint fill or a persistent inset marker, not color alone.

At narrow widths, move less-used implemented controls into a labeled `MORE` popover. Keep undo/redo available. Do not shrink controls below their hit target or add nonfunctional controls to fill space.

### Writing panel

A slim panel heading may read `ENTRY` with the real entry number and creation date when available. Unsaved/unallocated drafts read `DRAFT`; no invented entry number or timestamp.

Below that, place the editable title and the body in one column. A restrained horizontal rule may separate metadata from writing, but never separate individual paragraphs. Empty-state wording is brief and neutral: `Untitled` and `Start writing…`.

Keep the body background a solid Forest Black. No grids, wireframes, crosshairs, watermark logos, scanlines, decorative cursors, or bracket marks inside the writing column. Use the platform/editor's normal caret and selection behavior.

### Search

Retain the title-search overlay above the upper writing workspace. Style it as a framed terminal panel, with a `SEARCH TITLES` header and a clearly labeled input. Use aligned result rows with title first and real number/date secondary. Selected results invert to mint with dark text. No fake command prompt or requirement to type commands.

Focus the input on open, support keyboard selection, close on Escape, and return focus appropriately. Dismissing search must preserve writing. Width: up to approximately 480 px, constrained to the viewport.

### Archives

Retain the popover immediately beside the rail. Style it as a compact record index with a header strip and ruled rows. Each row shows title, number, and date; selected/current entry has a clear marker as well as color. Keep modification-date ordering and internal scrolling.

Starting width: 280–320 px, clamped to the visible window. Do not replace the writing area or turn archives into a permanent second column. No collectible-style cards, thumbnails, fake categories, or statistics.

### Status

Place status in the lower strip, with wording that reflects actual storage behavior. Future persisted states: `Saving…`, `Saved`, `Save failed`. The current temporary preview must continue to say `Preview · not saved` or equivalent equally explicit wording.

Save failure uses Error Rose plus an icon/text label and a clear recovery action when supported. Never display `SECURE`, `SYNCED`, `BACKED UP`, or `ENCRYPTED` without that capability and verified state. Do not fake progress percentages. No periodic animation or polling for visual effect.

### Settings and dialogs

Keep current settings and destructive-action flows. Use square framed panels, an upright heading, inset fields, and clearly separated actions. Plain language takes precedence over themed jargon: `Delete entry`, `Restore backup`, `Cancel`.

Destructive actions must not resemble normal mint-filled selection. Use Error Rose sparingly with explicit wording and confirmation. Popovers fit within the window, scroll internally if needed, and restore focus. Modal dialogs require proper focus containment and accessible names.

## 8. Interaction and accessibility

| State | Required treatment |
| --- | --- |
| Rest | Dark fill, readable mint content, quiet border |
| Hover | Raised Surface fill or stronger rule; no movement |
| Active/selected | Mint fill with Near Black content, plus programmatic pressed/selected state |
| Keyboard focus | Distinct 2 px Focus Mint outline with offset, visible beyond clipped decoration |
| Disabled | Muted content, no hover/pressed reaction, actual disabled semantics and understandable availability |
| Error | Error Rose plus explicit text/icon; never color alone |

Use instantaneous state changes by default. Any optional panel fade is at most 100 ms and disappears under reduced motion. Essential state changes never depend on animation.

Verify normal text at 4.5:1 contrast and large text/meaningful UI boundaries at 3:1 where applicable. Decorative rules may be quieter but cannot be the only indication of a control. Test real foreground/background pairs; palette membership alone is not proof of accessibility.

Test at 480 × 400, 760 × 600, and 1100 × 780, plus 200% text enlargement. No horizontal page scrolling, clipped labels, hidden save errors, or inaccessible menu actions. Allow internal scrolling and toolbar reflow. Keep the left menu and right writing field at compact sizes; do not collapse them into an unrelated mobile layout.

Verify keyboard focus, Escape behavior, macOS/Windows shortcuts, VoiceOver and Narrator in the relevant later accessibility task. Do not claim those platform checks from screenshots or browser mocks.

## 9. Scope exclusions

These references are visual inspiration only. Do not copy their names, logos, characters, illustrations, screen text, or implied products. Do not add accounts, network services, payments, games, security levels, biometric data, dashboards, challenges, statistics, streaks, notifications, or background monitoring.

Use original CSS/SVG geometry for future decoration. The reference images are not runtime assets and must not be embedded in the application. Architecture remains Tauri 2 + React + TypeScript + Vite + Tiptap + local SQLite.

## 10. Future implementation acceptance

A separately authorized visual implementation is ready for review only when:

1. The three primary colors remain exact and the left menu order and right editor remain intact.
2. The revised typography, compact strips, segmented toolbar, technical frames, and selection treatment clearly establish this direction.
3. Title/body readability and existing editor behavior remain intact; no decoration sits over writing.
4. Reference-derived detail is restrained and does not invent data or functionality.
5. Responsive, focus, contrast, text-scaling, and reduced-motion checks pass with recorded evidence.
6. Fonts/assets are local, licensed, and documented; no new runtime network dependency appears.
7. Save status is truthful; all existing data and editing regression checks pass.
8. Screenshots at the specified sizes are compared with this document and the reference interpretation table.

This documentation revision does not satisfy those implementation checks. T-04's original shell and this later visual revision must be distinguished in project history.

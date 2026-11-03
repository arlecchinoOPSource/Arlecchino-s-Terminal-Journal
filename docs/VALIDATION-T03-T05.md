# T-03–T-05 validation — November 3, 2026

Scope: authorized desktop foundation, visual shell, and basic editor. Tested on this Apple Silicon Mac. Only synthetic text was used.

## T-03

- Tauri 2, React, strict TypeScript and Vite initialized with separate UI, editor, domain and persistence directories.
- `npm run dev` compiled and launched the native process. The VS Code **Terminal: Run desktop preview** task was also launched successfully and showed the native process running.
- `npm run build` built the native release executable. `npm run tauri -- build --bundles app` built a local macOS app bundle; that bundle visibly opened and rendered at `tauri://localhost`.
- No native logging/SQL/filesystem/shell/HTTP plugins were added. Capability permissions are empty. Production content security policy only permits local assets and Tauri IPC. No remote runtime resources are referenced in source.
- Both npm and Cargo lockfiles are tracked. Dev-only Oxlint was added after typescript-eslint rejected the existing TypeScript 7 peer version; no forced dependency resolution.

## T-04

- Compared the rendered shell with the supplied mockup: outlined rail, separate toolbar/editor, forest black/near black/mint palette, dominant writing surface.
- Approved IBM Plex fonts are bundled locally, with OFL licenses retained.
- Reusable icon buttons and information popover have labels, disabled/hover/focus states. Escape closes the popover and restores trigger focus in browser and native app.
- Browser-rendered layout checked at normal desktop size and 480 × 400. At the latter, document scroll width remained 480 and the popover rectangle stayed inside the viewport (left 76, right 464, top 84, bottom 360).
- Advanced formatting controls collapse at narrow widths. The writing surface scrolls independently. Reduced-motion and relative font-size styles are included; assistive-technology certification and full OS text-scaling review remain T-14.
- Desktop icon generated from the original vector in assets/terminal-icon.svg.

## T-05

- Native production app: edited title and multiple paragraphs; selected text; pasted accented text, Japanese and emoji; copied and pasted multiple paragraphs; cut/pasted rich text; verified bold/italic rich paste visually.
- Native undo/redo verified through toolbar and Cmd+Z/Cmd+Shift+Z. Disabled states update correctly.
- Fresh development preview: title/body editing worked and browser console contained no errors or warnings during the check.
- A dependency hot-reload during integration initially produced an invalid-hook error. Final Vite config prebundles editor dependencies, deduplicates React and ignores native build outputs; fresh launch/editing was verified after the correction.
- Five automated checks pass: independent blank drafts, structured JSON round trip including multiline/Unicode/marks, unsupported media rejection, minimal native capabilities, and production connection policy.
- The schema version is 1; temporary drafts have no persistent ID or entry number. Writing is kept in memory and is never logged. The interface explicitly states it is not saved.

## Commands and limitations

Passed: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build:web`, native build and app bundling, `cargo fmt --check`, and `git diff --check`.

Vite emits a chunk-size advisory for the combined React/editor bundle (approximately 628 kB minified). Builds succeed. No startup, typing-latency, memory, or crash-recovery benchmark is claimed.

Not implemented/tested here: SQLite, autosave, entry management, search/archive data, settings persistence, full formatting toolbar, tables, backup/restore, Windows native execution, Windows shortcuts, clean-machine installation, signing/notarization, screen-reader review, and release distribution. The app must not be used for writing that needs to be kept. This is a local preview, not a v1.0 release.

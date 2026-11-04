# Terminal — AI agent instructions

## Product and current stage

Terminal by Arlecchino is a minimal, offline-first journal for macOS and Windows. Read `docs/PRD-v0.1.md`, `docs/UI-DESIGN-SYSTEM-v0.3.md`, `docs/ARCHITECTURE.md`, and the selected backlog issue before work.

Implementation of T-03 through T-05 was authorized on November 3, 2026. Work on one authorized issue at a time; do not silently implement adjacent issues. Later backlog tasks still require authorization.

Current target: Terminal 2.0.0 — The Sensory Update. Read `docs/TERMINAL_V2_SPEC.md`, `docs/BACKLOG-v2.0.md`, and `docs/DEVELOPMENT-v2.0.md` for this release. The November 4 setup request authorizes T-21 documentation, branch, baseline verification, and GitHub tracking. T-22–T-34 are planned work, not authorization to implement every feature or publish a release.

## Mandatory boundaries

- Use Tauri 2 + React + TypeScript + Vite + Tiptap + local SQLite. Explain and document any proposed architecture change before adopting it.
- Follow the current v0.3 "Terminal 84" design (`docs/UI-DESIGN-SYSTEM-v0.3.md`): green-black framed panels, one phosphor-green accent (amber and rose only for attention and failure), Orbitron display lettering for the wordmark and panel titles, IBM Plex Mono interface labels. Use the colour tokens in `src/styles/tokens.css`; the v0.2 forest/mint palette was retired by the product owner on November 4, 2026.
- Preserve the left menu order (Search, Archives, Themes, Sounds, New entry; Settings below) and dominant right-hand writing field. Keep the writing page clear of scanlines, grids, glow, and decorative overlays (these may appear only in the surrounding chrome). No fake telemetry, network state, security claims, or reference-derived content.
- Visual changes beyond v0.3 require an explicit request from the product owner and an updated design document.
- The accepted 2.0 specification explicitly extends v0.3 with four themes, optional audio, retro motion, and startup (implemented last). Preserve the existing v1.0.0 Mint appearance and layout; see `docs/UI-DESIGN-SYSTEM-v2.0.md`. This release plan does not authorize unrelated visual redesigns.
- No accounts, servers, cloud sync, telemetry, ads, third-party AI processing, streaks, reminders, or unrelated productivity features.
- No network dependency at app runtime. Bundle approved fonts/assets locally. Development dependency downloads do not justify runtime network features.
- Never read, upload, log, or commit real journal content, credentials, signing keys, or backups. Use synthetic fixtures.
- Keep dependencies minimal; justify additions, verify licenses, use official documentation, and commit resolved lockfiles. Do not introduce paid Tiptap services or hosted editor features.

## Coding standards for implementation

- Make small, focused changes. Inspect existing files and preserve unrelated user changes; do not use destructive reset or broad rewrites.
- Use strict TypeScript, explicit boundary types, clear names, and accessible semantic controls. Avoid `any` without a documented reason.
- Keep UI, editor, domain logic, and persistence separated. Route storage through a typed repository boundary; parameterize SQL and validate imported data.
- Store structured Tiptap JSON with a schema version. Preserve immutable IDs, non-reused sequential entry numbers, and creation timestamps.
- Protect autosave: serialize writes, retain dirty state on failure, flush before switching, and display honest save status. Never mark saved before a successful commit.
- Use transactions for multi-step changes and restore. Validate backups before mutation; prevent partial replacement; preserve migration compatibility and test upgrades with synthetic old data.
- Use least-privilege Tauri capabilities and file scopes; do not enable arbitrary filesystem, shell, or network access. Sanitize rich-text paste and HTML exports as needed.
- Support macOS/Windows shortcuts, keyboard focus, accessible labels, reduced motion, and text scaling. Verify popovers at small window sizes.
- Avoid polling, unnecessary background work, and premature abstraction. Measure performance rather than assert it.

## Verification and reporting

Follow the issue acceptance criteria and `CONTRIBUTING.md`. Add meaningful regression checks for data loss, storage, backup/restore, and changed behavior. Test native SQLite in a native/integration context; browser UI mocks alone do not prove desktop persistence. Browser interaction tests do not prove installation or native lifecycle behavior.

At the preparation stage, validate documentation links, backlog coverage, ignored files, and repository state; do not invent app build/test scripts. Once T-03 adds real scripts, use the documented lint, typecheck, test, and build commands and report failures candidly.

Before finishing, inspect the diff, run relevant checks, and report what changed, why, what was actually verified, and remaining limitations. Never claim Windows/macOS installation, release signing, performance, or crash recovery without evidence. Do not publish a release, change visibility, or mark implementation issues done without explicit authorization and completed acceptance criteria.

# AGENTS.md — Terminal 2.0 Addendum

## Current Development Target

Terminal 2.0.0 — The Sensory Update.

Read `docs/TERMINAL_V2_SPEC.md` before implementing any v2 feature.

Preserve all existing Terminal 1.0 functionality unless a task explicitly requires modification.

## General Principles

1. Maintain the local-first, offline-first architecture.
2. Do not change the journal database schema unless absolutely necessary.
3. Never sacrifice saving reliability for visual effects.
4. Avoid unnecessary dependencies.
5. Preserve macOS and Windows compatibility.
6. Keep code modular and maintainable.
7. Test all changes before merging.
8. Do not introduce external telemetry, analytics, or network services.
9. Do not implement features outside the assigned issue.
10. Ask for clarification when a proposed change would materially alter product behavior.

## Theme Development Rules

- Use semantic theme tokens.
- Never scatter hardcoded theme colors across components.
- Preserve the existing original Mint appearance.
- Ensure theme changes affect application chrome, not user-authored rich-text content.
- Make theme transitions compatible with reduced-motion preferences.
- Persist theme selection locally.
- Test all themes before marking changes complete.

## Audio Development Rules

- Centralize sound playback and preferences.
- Do not create independent audio managers in unrelated components.
- Do not record or log typed characters.
- Keyboard effects must not interfere with accessibility input methods.
- Audio must be optional and disabled by default for upgrading users.
- Do not add third-party audio without checking its redistribution license.
- Do not initialize large audio assets unnecessarily.
- Audio failures must never interrupt writing.

## Animation Development Rules

- Preserve the retro-futuristic aesthetic.
- Prefer lightweight CSS animation where sufficient.
- Avoid unnecessary perpetual animations.
- Respect reduced-motion settings.
- Never animate journal content during typing.
- Avoid blocking UI interactions until an animation finishes.
- Keep animation timings centralized and consistent.

## Startup Development Rules

- Startup development occurs only after themes, sounds, and animations are stable.
- The TERMINAL logo is the primary visual focal point.
- The startup indicator must be tied to actual application readiness or clearly presented as indeterminate.
- Avoid artificial delays.
- Respect user audio and motion settings.
- The application must recover gracefully from startup asset failures.
- A startup screen must not interfere with normal window launching or journal initialization.

## Compatibility Rules

- Existing Terminal 1.0 journals must remain readable.
- Existing exports and backups must remain compatible.
- Preferences must use safe defaults when new settings are missing.
- Changes must not alter document formatting or editor behavior unintentionally.
- Any storage migration must have an explicit reason and regression tests.

## Version Control Rules

- Work on dedicated feature branches.
- Keep changes small and focused.
- Reference the relevant GitHub Issue.
- Do not modify unrelated components.
- Run relevant tests and builds before requesting review.
- Record significant design or architecture decisions.
- Never commit secrets, signing credentials, or private journal data.


## Definition of Done for v2

The assigned issue's acceptance criteria and the existing contribution definition of done must pass. Run `npm run check`, review manually, document actual platform coverage and performance evidence, and preserve v1 entries, backups, and settings. An effect is not complete while required audio is missing or its redistribution license is unverified. T-21 setup does not complete any sensory feature. Release publication requires a separate explicit instruction and satisfied release gates.

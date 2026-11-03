# Terminal — AI agent instructions

## Product and current stage

Terminal by Arlecchino is a minimal, offline-first journal for macOS and Windows. Read `docs/PRD-v0.1.md`, `docs/UI-DESIGN-SYSTEM-v0.1.md`, `docs/ARCHITECTURE.md`, and the selected backlog issue before work.

Implementation of T-03 through T-05 was authorized on November 3, 2026. Work on one authorized issue at a time; do not silently implement adjacent issues. Later backlog tasks still require authorization.

## Mandatory boundaries

- Use Tauri 2 + React + TypeScript + Vite + Tiptap + local SQLite. Explain and document any proposed architecture change before adopting it.
- Preserve forest black `#16231D`, near black `#090B0C`, and terminal mint `#B0E2CC`, the thin outlined rail/toolbar/editor structure, and dominant writing surface.
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

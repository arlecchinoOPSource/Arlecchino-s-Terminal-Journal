# Terminal — technical architecture v0.1

Status: accepted stack and product boundaries; implementation details below are guidance for T-03 onward. T-03 initializes the desktop shell; T-06–T-08 add native SQLite persistence (ADR-002).

## ADR-001: Offline desktop architecture

**Decision:** Tauri 2 hosts a React/TypeScript interface built by Vite, with Tiptap for structured rich text and SQLite in the OS application-data directory. Target macOS and Windows. No server, account, cloud database, analytics, or mandatory internet.

**Reason:** This serves private local ownership, a compact writing interface, portable backups, and a modest maintenance burden. Tauri uses system webviews; actual startup, memory use, and packaging behavior must still be measured.

**Consequences:** Rust and native prerequisites are needed. Platform builds require their respective toolchains. SQLite is not encryption; local account and disk protection remain the v1 security boundary. Signing/notarization and trusted Windows distribution require separate release preparation.

## Visual specification

For the 2.0 target, also read [TERMINAL_V2_SPEC.md](TERMINAL_V2_SPEC.md) and [UI-DESIGN-SYSTEM-v2.0.md](UI-DESIGN-SYSTEM-v2.0.md). The existing v1 storage/privacy contract remains the baseline. The sensory extension is planning guidance until its assigned issues are implemented.

[UI design system v0.3](UI-DESIGN-SYSTEM-v0.3.md) is the current presentation specification. Its terminal-console treatment does not change the stack, offline/privacy boundaries, storage contract, or feature scope. The November 3 aesthetic revision is documentation only; implementing it requires separate authorization.

## Planned boundaries

React views (rail, toolbar, editor, overlays, settings) → application/domain operations → typed journal repository → Tauri/native SQLite integration. Tiptap owns editing behavior; its JSON document is persisted, not DOM or editor instances.

The official Tauri SQL plugin with SQLite is the initial integration choice. During T-03/T-06 verify its capabilities and transaction support; if native Rust commands are required for atomic restore or serialized writes, document that boundary in a follow-up ADR. Do not expose unrestricted SQL or arbitrary paths throughout UI components.

## Storage contract

Entry fields: `id`, `entry_number`, `title`, structured `content`, `created_at`, `updated_at`, `schema_version`. Settings persist separately. Use unique constraints for IDs/numbers and an independent monotonic allocation strategy so deleting the highest entry never reuses its number. Decide exact SQL and timestamp representation in T-06; do not present an unimplemented schema as installed.

Search titles case-insensitively; define Unicode behavior in implementation tests. Archives order by modification date descending, with a stable tie-breaker. Do not persist untouched blank drafts. Preserve IDs, numbering, timestamps, and formatting across save/reopen and full backup restoration.

## Reliability and import/export

Debounce autosave briefly; serialize commits and prevent stale writes from overwriting newer content. Flush or safely retain pending edits before switching entries and handling close. A forced process termination can interrupt an uncommitted edit; measure and document the actual recovery window. Retain unsaved content and show failures clearly.

Use versioned migrations. Validate complete versioned JSON backups before mutation, confirm replacement, and restore atomically. Reject unsupported/corrupt input without altering the existing journal. Specify the backup schema and compatibility rules in T-15. HTML/plain-text export must be readable independently of Terminal; sanitize unsafe markup.

## Proposed directory structure after T-03

- `src/`: interface, editor integration, domain operations, persistence boundary.
- `src-tauri/`: desktop configuration, capability scopes, native integration, migrations.
- `tests/`: synthetic fixtures and integration/interaction tests.
- `docs/`: product, design, architecture, development and release evidence.

These boundaries are established by T-03. Feature implementations are added only with their authorized issues.

## Quality and release plan

Node's built-in test runner for domain logic, Rust tests for SQLite, migrations, backup and recovery, and Playwright (Chromium and WebKit) for UI behaviour; see [TESTING.md](TESTING.md). Native lifecycle/installation and assistive technology need platform-specific checks; browser tests cannot establish those claims. T-17 introduces the suite; T-19 introduces macOS/Windows release builds. Publish versioned installers through GitHub Releases only after T-20 acceptance. Automatic updates are deferred.

## References

- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)
- [Tauri SQL plugin](https://v2.tauri.app/plugin/sql/)
- [Vite guide](https://vite.dev/guide/)
- [Tiptap React installation](https://tiptap.dev/docs/editor/getting-started/install/react)

## ADR-002: Native journal repository (T-06–T-08)

Use rusqlite with bundled SQLite behind typed Tauri commands instead of exposing the SQL plugin bridge. This refines ADR-001's explicitly deferred transaction boundary: allocation, creation, last-opened settings, updates and deletion must commit atomically on one owned connection. A mutex serializes native access; frontend writes are additionally serialized. No UI-supplied SQL or filesystem paths are accepted. The unused SQL bridge is removed. rusqlite is MIT licensed; SQLite is public domain. Serde/serde_json (MIT OR Apache-2.0) encode the typed command boundary.

Database: OS application-data directory / journal.sqlite3. Timestamps are UTC Unix milliseconds. Entry IDs originate as UUIDs in the client and are immutable; allocation uses an independent monotonic counter in a transaction. A revision integer detects stale writes. Versioned migrations use PRAGMA user_version in an immediate transaction, reject newer databases, and never reset existing data. SQLite uses WAL and synchronous FULL. Startup errors are returned safely to the UI without logging private writing.

Ordinary edits debounce for 400 ms. A pending draft is not durable until commit succeeds; forced termination before that commit can lose the pending edit. A failed save retains dirty content, blocks entry switching/closing, and offers retry; after a refused close the user may explicitly choose Close without saving. Native window close and application Quit are intercepted so the frontend can flush before exit. No promise of recovery for an uncommitted edit is made.

## ADR-003: 2.0 sensory boundaries (planned)

Keep the Tauri/React/Tiptap/rusqlite architecture and existing journal schema. Add semantic theme definitions, one optional local audio manager, shared motion policy, and a startup readiness presentation as separate concerns. Effects must never own journal writes, block commits, record input text, or bypass initialization errors. New preferences need validated, backward-compatible defaults; upgrading users stay silent. Database-schema changes are not part of 2.0 scope and require a documented necessity and regression evidence.

The interface theme (T-23) is kept in the webview's local storage behind `src/persistence/theme.ts`, not in the SQLite settings table: it must be read synchronously before the first render to avoid a wrong-theme flash, it is not journal data, and keeping it out of `Preferences` leaves the backup format and the v1 settings record unchanged. Losing it only resets the theme to Mint.

Sound (T-25–T-27) is one Web Audio manager, `src/audio/soundManager.ts`, used through the `sounds` instance in `src/audio/sounds.ts`. Its settings are stored like the theme (`terminal.sound`, parsed field by field with safe defaults; missing means off). The audio context is created on the first sound, not at launch, and files are decoded only for what the settings can play. Every call returns at once and failures are silent. To decode bundled files, the content security policy now allows `connect-src 'self'` (the app's own origin only); the privacy test permits `fetch` only in the sound manager and checks that every sound comes from `src/assets/sounds`. The close sound needed one native change: `journal_finish_exit` takes an optional `lingerMs` and, when given, hides the window and exits after at most 6.5 s. The journal is always saved before it is called.

The startup screen (T-31, T-32) is a React overlay in `App`. `WritingWorkspace` reports readiness from the journal controller: ready, or an initialization error. The pure rules in `src/domain/startup.ts` decide when the screen leaves, and the screen never blocks or delays initialization. Its on/off setting is stored locally (`terminal.startup`). The startup sound is requested once in `main.tsx`. The main window's `backgroundColor` prevents a white first frame.

Prefer existing browser/CSS capabilities before adding dependencies; no audio or animation package is selected during setup. Check actual native webview audio behaviour during the assigned issues. A missing effect can degrade to silence/static display; a failed journal initialization must remain a visible recoverable error. Startup is the last feature because it composes the completed theme, audio, and motion systems.

## Issue #60: title formatting

The entry title remains plain searchable text. Whole-title presentation is stored as allowlisted `titleFontFamily`, `titleFontSize`, `titleBold`, `titleItalic`, `titleUnderline`, `titleStrike`, and `titleAlign` attributes on the existing rich-text document root. Body updates preserve these attributes. While the title has focus, the toolbar and its emphasis/alignment shortcuts target the title instead of the body. No SQL migration is needed. Old entries without them retain defaults; new styled backups need this updated reader because older strict validators do not recognize these attributes. Native validation accepts only bundled fonts, supported sizes, boolean emphasis and left/center/right alignment. HTML export escapes text and renders safe title styles; plain-text export stays plain text.

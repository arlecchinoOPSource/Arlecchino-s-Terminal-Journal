# Terminal — technical architecture v0.1

Status: accepted stack and product boundaries; implementation details below are guidance for T-03 onward. T-03 initializes the desktop shell; T-06–T-08 add native SQLite persistence (ADR-002).

## ADR-001: Offline desktop architecture

**Decision:** Tauri 2 hosts a React/TypeScript interface built by Vite, with Tiptap for structured rich text and SQLite in the OS application-data directory. Target macOS and Windows. No server, account, cloud database, analytics, or mandatory internet.

**Reason:** This serves private local ownership, a compact writing interface, portable backups, and a modest maintenance burden. Tauri uses system webviews; actual startup, memory use, and packaging behavior must still be measured.

**Consequences:** Rust and native prerequisites are needed. Platform builds require their respective toolchains. SQLite is not encryption; local account and disk protection remain the v1 security boundary. Signing/notarization and trusted Windows distribution require separate release preparation.

## Visual specification

[UI design system v0.2](UI-DESIGN-SYSTEM-v0.2.md) is the current presentation specification. Its terminal-console treatment does not change the stack, offline/privacy boundaries, storage contract, or feature scope. The November 3 aesthetic revision is documentation only; implementing it requires separate authorization.

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

Vitest for unit logic, native/integration tests for SQLite and migrations, and Playwright for browser-rendered UI behavior. Native lifecycle/installation and assistive technology need platform-specific checks; browser tests cannot establish those claims. T-17 introduces the suite; T-19 introduces macOS/Windows release builds. Publish versioned installers through GitHub Releases only after T-20 acceptance. Automatic updates are deferred.

## References

- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)
- [Tauri SQL plugin](https://v2.tauri.app/plugin/sql/)
- [Vite guide](https://vite.dev/guide/)
- [Tiptap React installation](https://tiptap.dev/docs/editor/getting-started/install/react)

## ADR-002: Native journal repository (T-06–T-08)

Use rusqlite with bundled SQLite behind typed Tauri commands instead of exposing the SQL plugin bridge. This refines ADR-001's explicitly deferred transaction boundary: allocation, creation, last-opened settings, updates and deletion must commit atomically on one owned connection. A mutex serializes native access; frontend writes are additionally serialized. No UI-supplied SQL or filesystem paths are accepted. The unused SQL bridge is removed. rusqlite is MIT licensed; SQLite is public domain. Serde/serde_json (MIT OR Apache-2.0) encode the typed command boundary.

Database: OS application-data directory / journal.sqlite3. Timestamps are UTC Unix milliseconds. Entry IDs originate as UUIDs in the client and are immutable; allocation uses an independent monotonic counter in a transaction. A revision integer detects stale writes. Versioned migrations use PRAGMA user_version in an immediate transaction, reject newer databases, and never reset existing data. SQLite uses WAL and synchronous FULL. Startup errors are returned safely to the UI without logging private writing.

Ordinary edits debounce for 400 ms. A pending draft is not durable until commit succeeds; forced termination before that commit can lose the pending edit. A failed save retains dirty content, blocks entry switching/closing, and offers retry; after a refused close the user may explicitly choose Close without saving. Native window close and application Quit are intercepted so the frontend can flush before exit. No promise of recovery for an uncommitted edit is made.

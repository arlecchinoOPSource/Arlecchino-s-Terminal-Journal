# TERMINAL — GitHub Development Backlog
**Project:** Terminal by Arlecchino
**Target:** v1.0
**Status:** Accepted planning backlog

Source: accepted Main Chat blueprint and the product owner's complete backlog supplied November 3, 2026. Task numbers represent recommended work order; GitHub assigns issue numbers.

Every issue should have:
- One clear objective.
- Explicit acceptance criteria.
- A milestone and relevant labels.
- Tests appropriate to the change.
- No unrelated feature additions.

## M0 — Foundation

### T-01 — Finalize product and design documentation
**Labels:** documentation, P0

**Tasks:**
- Add the Product Requirements Document to `/docs`.
- Add the Visual Design System to `/docs`.
- Record the agreed technical architecture.
- Define the v1.0 feature boundaries.

**Acceptance criteria:**
- Every core feature has documented behavior.
- Major design and architectural decisions are recorded.
- The documentation can guide implementation without significant ambiguity.

### T-02 — Establish GitHub repository and development standards
**Labels:** setup, documentation, P0

**Tasks:**
- Create the Terminal repository.
- Add README, LICENSE, `.gitignore`, and contribution guidelines.
- Define branch naming and commit conventions.
- Add AGENTS.md with project-specific AI instructions.
- Create GitHub milestones and issue labels.

**Acceptance criteria:**
- Repository has a clear structure.
- Local development artifacts and user data are excluded from version control.
- AI coding tools have consistent instructions.

### T-03 — Initialize desktop application architecture
**Labels:** setup, architecture, P0

**Tasks:**
- Initialize Tauri 2, React, TypeScript, and Vite.
- Configure development and production builds.
- Establish application directories.
- Verify local desktop launch.

**Acceptance criteria:**
- Application launches in development mode.
- Initial production build succeeds.
- No unnecessary services or packages are installed.

### T-04 — Implement UI design system and application shell
**Labels:** interface, design, P0

**Tasks:**
- Define global design tokens.
- Create sidebar, toolbar, and editor layout.
- Set up reusable buttons, popovers, and input styles.
- Handle window resizing.

**Acceptance criteria:**
- Interface closely matches the supplied mockups.
- Layout resizes correctly.
- No writing or storage functionality is required yet.
- UI components have consistent states.

## M1 — Writing Engine

### T-05 — Integrate basic rich-text editor
**Labels:** editor, feature, P0

**Tasks:**
- Add Tiptap as the editing engine.
- Enable normal paragraphs and multiline writing.
- Implement editable entry title.
- Support text selection, clipboard operations, undo, and redo.

**Acceptance criteria:**
- Writing works smoothly.
- Standard copy and paste works.
- Content can be represented as structured data.

### T-06 — Implement database schema and migrations
**Labels:** database, architecture, P0

**Tasks:**
- Set up SQLite storage.
- Define entries and settings tables.
- Implement initial database creation.
- Introduce versioned migrations.

**Acceptance criteria:**
- Database initializes automatically.
- Entries can be stored and retrieved.
- Migration behavior is tested.

### T-07 — Implement journal entry lifecycle
**Labels:** database, feature, P0

**Tasks:**
- Create entries.
- Retrieve and display entries.
- Rename and edit existing entries.
- Implement permanent entry numbering.
- Implement deletion.

**Acceptance criteria:**
- Entries survive application restarts.
- IDs and entry numbers remain stable.
- Deleting an entry does not renumber others.
- Empty entry handling follows the specification.

### T-08 — Implement automatic saving and save status
**Labels:** database, reliability, P0

**Tasks:**
- Implement short-delay automatic saving.
- Save pending changes before entry switching.
- Display saving, saved, and error states.
- Handle storage errors safely.

**Acceptance criteria:**
- Ordinary writing requires no manual saving.
- Rapid entry switching does not lose changes.
- Save failures are visible.
- Restart and forced-closure behavior is tested.

### T-09 — Implement formatting toolbar
**Labels:** editor, interface, P0

**Tasks:**
- Add bold, italic, underline, and strikethrough.
- Add headings, lists, and blockquotes.
- Add text alignment.
- Add font controls.
- Connect toolbar controls to editor selection state.

**Acceptance criteria:**
- Formatting changes selected text or paragraphs correctly.
- Toolbar reflects active formatting.
- Formatting survives saving and reopening.

### T-10 — Implement basic table editing
**Labels:** editor, feature, P1

**Tasks:**
- Insert tables.
- Add and remove rows and columns.
- Support keyboard navigation through cells.
- Ensure tables persist in saved entries.

**Acceptance criteria:**
- Tables can be created and edited.
- Tables survive application restarts.
- Table controls remain compact and understandable.

## M2 — Navigation and Ownership

### T-11 — Implement archive popover
**Labels:** navigation, interface, P0

**Tasks:**
- Create sidebar-triggered archive panel.
- Query stored entries.
- Sort by last modification date.
- Highlight active entry.
- Add empty state and scrolling.

**Acceptance criteria:**
- Archives open and close correctly.
- Every saved entry can be selected.
- Long lists remain usable.

### T-12 — Implement title search
**Labels:** navigation, feature, P0

**Tasks:**
- Implement search overlay.
- Query entry titles case-insensitively.
- Update results while typing.
- Support keyboard navigation and Escape.

**Acceptance criteria:**
- Relevant entries appear in results.
- Search is responsive.
- Selecting a result opens the correct entry.
- Closing search does not alter the journal.

### T-13 — Implement application preferences
**Labels:** settings, interface, P1

**Tasks:**
- Add compact settings interface.
- Store font and editor size preferences.
- Store writing width and line spacing preferences.
- Restore settings on launch.

**Acceptance criteria:**
- Settings apply immediately.
- Settings survive application restarts.
- Defaults are clearly defined.

### T-14 — Implement keyboard shortcuts and accessibility
**Labels:** accessibility, quality, P0

**Tasks:**
- Add shortcuts for new entry, search, formatting, and undo/redo.
- Support Escape to dismiss popovers.
- Add keyboard focus indicators.
- Add accessible names to icon buttons.
- Review navigation using keyboard and screen readers.

**Acceptance criteria:**
- Core workflows work without a mouse.
- Keyboard focus is predictable.
- Controls have accessible descriptions.

### T-15 — Implement complete journal backup and restore
**Labels:** data, privacy, P0

**Tasks:**
- Export a versioned JSON backup.
- Validate backups before restoration.
- Provide replacement confirmation.
- Use a safe restoration procedure that avoids partial database replacement.
- Test backup compatibility and data integrity.

**Acceptance criteria:**
- Exported journal can be restored.
- Rich text and timestamps are preserved.
- Invalid backup files do not damage existing data.
- Users receive clear confirmation and error messages.

### T-16 — Implement individual entry export and deletion safeguards
**Labels:** data, feature, P0

**Tasks:**
- Export individual entries as readable files.
- Add confirmation before deletion.
- Ensure deletion updates search and archives.
- Ensure exported text remains usable outside Terminal.

**Acceptance criteria:**
- Exported entries are readable without Terminal.
- Accidental deletion is guarded by confirmation.
- Deleted entries disappear from navigation.

## M3 — Quality Assurance

### T-17 — Implement automated testing and regression suite
**Labels:** testing, quality, P0

**Tasks:**
- Add unit tests for entry and search logic.
- Add integration tests for storage operations.
- Add UI tests for important interactions.
- Include backup and autosave regression tests.

**Acceptance criteria:**
- Critical workflows have repeatable tests.
- Tests can run locally and in CI.
- Test failures block changes from being considered complete.

### T-18 — Validate performance, privacy, and reliability
**Labels:** performance, security, P0

**Tasks:**
- Measure startup time and memory use.
- Test large entries and large archives.
- Verify offline operation.
- Review dependencies and file permissions.
- Verify journal content is never included in logs.
- Test interruption and recovery scenarios.

**Acceptance criteria:**
- Performance results are documented.
- Privacy claims have been verified.
- Critical data-loss issues are resolved.

## M4 — Public Release

### T-19 — Set up automated builds and installers
**Labels:** release, automation, P0

**Tasks:**
- Configure GitHub Actions.
- Build macOS and Windows packages.
- Prepare code-signing and notarization arrangements where applicable.
- Verify clean-machine installation.
- Prepare release notes and artifacts.

**Acceptance criteria:**
- Repeatable release-build process exists.
- Packages install on tested target systems.
- Release artifacts are attached to the correct version.

### T-20 — Complete beta verification and publish v1.0
**Labels:** release, documentation, P0

**Tasks:**
- Run complete release acceptance tests.
- Address critical and high-priority beta issues.
- Finalize README, privacy information, and installation guide.
- Create version tag and GitHub Release.
- Publish the first stable version.

**Acceptance criteria:**
- The release checklist passes.
- Downloads and installation instructions are accessible.
- Known limitations are documented.
- v1.0 is available from the official repository.

## General Definition of Done

Every issue is complete only when:
1. The stated behavior works.
2. Appropriate tests pass.
3. The change has been manually reviewed.
4. Existing features continue to function.
5. No unrelated changes are introduced.
6. The implementation is committed and merged into the stable branch.

## Recommended Workflow

Backlog → In Progress → In Review → Done

Use feature branches for implementation and pull requests for review. Keep the main branch stable.

For AI-assisted work, give the coding assistant one issue at a time, with acceptance criteria and relevant project context.

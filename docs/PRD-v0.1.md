# TERMINAL
## Product Requirements Document (PRD)
**Publisher:** Arlecchino
**Document version:** 0.1
**Target release:** Desktop v1.0
**Status:** Initial specification

### 1. Product Overview

Terminal is a minimalist, offline-first desktop journaling application for macOS and Windows.

It provides a distraction-free writing environment with a small set of rich-text tools, searchable journal titles, and a chronological archive of previous entries.

Terminal is designed for users who want the advantages of digital journaling without accounts, cloud dependencies, notifications, advertising, or unnecessary productivity features.

### 2. Product Objectives

1. Make starting a journal entry effortless.
2. Preserve user writing reliably and locally.
3. Make old entries easy to find.
4. Maintain a consistent, attractive interface without visual clutter.
5. Operate efficiently with modest CPU, memory, and storage use.
6. Make journal data portable through export and backup functions.

### 3. Intended Users

- People beginning a regular journaling habit.
- Students and professionals recording personal thoughts.
- Writers who prefer simple desktop applications.
- Privacy-conscious users who prefer local ownership of their writing.

### 4. Core User Experience

**First launch**

- Open directly into the writing workspace.
- Display a new, untitled entry ready for input.
- Require no registration, setup wizard, or internet connection.

**Subsequent launches**

- Restore the most recently opened entry.
- Place the user in the writing workspace immediately.
- Allow creation of a new entry through the sidebar or keyboard shortcut.

**Typical journaling session**

1. Open Terminal.
2. Create or select an entry.
3. Enter a title and write.
4. Optionally apply formatting.
5. Close the application without needing to save manually.
6. Reopen later to find the writing preserved.

### 5. Functional Requirements

**FR-01 — Entry management**

- Users can create, rename, edit, and delete journal entries.
- Every entry receives a unique ID and a permanent sequential entry number.
- Deleted entry numbers are not reused.
- Entries have automatically recorded creation and modification timestamps.
- An empty new entry should not be permanently stored unless the user begins entering content or a title.

**FR-02 — Writing editor**

- Supports normal paragraphs and multiline text.
- Supports bold, italic, underline, strikethrough, headings, numbered lists, bullet lists, and blockquotes.
- Supports left, center, and right text alignment.
- Supports basic tables, including adding and removing rows or columns.
- Supports undo and redo.
- Supports pasting plain text and standard rich text.
- Does not require a Markdown or programming language.

**FR-03 — Formatting toolbar**

- Located above the main editor.
- Provides formatting controls in compact groups.
- Includes a small selection of font families and font sizes.
- Advanced formatting controls may appear in a dropdown instead of occupying permanent toolbar space.
- Keyboard shortcuts are supported for common operations.

**FR-04 — Search**

- Clicking the magnifying-glass icon opens a search interface above the writing workspace.
- Search matches entry titles, not entry body content.
- Results update while the user types.
- Matching is case-insensitive.
- Selecting a result opens its entry.
- Escape closes the search interface.
- The original writing remains unchanged if search is dismissed.

**FR-05 — Archives**

- Clicking the archive icon opens a compact panel adjacent to the left sidebar.
- Entries are listed with their title, entry number, and date.
- Entries are ordered by most recently modified first.
- The archive is scrollable.
- Clicking an entry loads it in the main editor.
- Empty journals display a simple, friendly empty state.

**FR-06 — Automatic saving**

- Changes save automatically after a brief pause in typing.
- Pending changes are saved before switching entries.
- Save status is communicated unobtrusively.
- Failed saves must be clearly reported, not silently ignored.
- Closing or crashing the application must not routinely result in lost entries.

**FR-07 — Data export and restoration**

- Users can export a complete journal backup to a versioned JSON file.
- Backups preserve rich-text structure, titles, timestamps, and entry IDs.
- Users can restore a compatible backup.
- Restoration validates the file and warns before replacing existing entries.
- Users can export individual entries in a readable format, initially HTML or plain text.
- Deleting an entry requires confirmation.

**FR-08 — Settings**

- The user can change the editor font family and size.
- Writing width and line spacing can be adjusted within reasonable limits.
- Preferences persist between sessions.
- The default Terminal visual theme remains consistent.

**FR-09 — Keyboard accessibility**

- Common shortcuts work on both macOS and Windows.
- Focus indicators appear during keyboard navigation.
- Buttons expose accessible labels.
- The application remains usable without a mouse.

### 6. Data Model

Each journal entry has:

- `id`: Unique internal identifier.
- `entry_number`: Permanent sequential number.
- `title`: User-editable title.
- `content`: Structured rich-text document.
- `created_at`: Creation timestamp.
- `updated_at`: Last modification timestamp.
- `schema_version`: Internal data format version.

An application settings record stores editor preferences.

Entries are stored locally in an SQLite database within the operating system's designated application-data directory.

### 7. Privacy and Security

- No accounts or mandatory cloud storage.
- No analytics, advertising, or behavioral tracking.
- No transmission of journal contents to Arlecchino.
- No third-party AI processing of journal entries.
- Journal content is excluded from diagnostic logs.
- The application operates without network access.
- Users can export and delete their own writing.

**Security limitation:** Local storage does not automatically mean encryption. The initial design relies on the device's operating-system protections, such as disk encryption and user-account permissions. Optional application-level encryption may be investigated for a later version.

### 8. Performance Requirements

Initial engineering targets, to be tested on reference macOS and Windows devices:

- Cold application launch: ideally under 2 seconds.
- Normal editor interactions: no noticeable typing lag.
- Search through 1,000 entries: ideally under 200 milliseconds.
- Very low CPU activity while idle.
- No unnecessary polling, background synchronization, or network requests.
- Comfortable editing of long entries.

These are performance targets, not guaranteed measurements.

### 9. Supported Platforms

- Current supported macOS versions on Apple Silicon and Intel where practical.
- Windows 10/11, with supported WebView runtime requirements verified.
- No Linux or mobile release required for v1.0.

### 10. Explicitly Out of Scope

- User accounts.
- Cross-device synchronization.
- Shared or collaborative journals.
- AI-generated journal content.
- Mood analytics.
- Habit streaks or gamification.
- Notifications or daily reminders.
- Cloud database hosting.
- Plugins and third-party extensions.
- Embedded audio, video, or complex media layouts.

### 11. Release Acceptance Criteria

Terminal v1.0 is considered ready when:

1. Every core functional requirement is implemented and tested.
2. Entries persist correctly after reopening the application.
3. Search and archives work reliably.
4. Backup export and restoration are verified.
5. No known critical data-loss bug remains.
6. Keyboard interaction and accessibility have been reviewed.
7. macOS and Windows installations have been tested.
8. Startup and resource usage have been measured.
9. Privacy documentation and installation instructions are available.
10. Installable packages are published through an official release.

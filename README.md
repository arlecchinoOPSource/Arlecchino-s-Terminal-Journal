# Terminal by Arlecchino

A private, lightweight writing environment that makes journaling effortless.

![Terminal identity](docs/reference/arlecchino-brand-mockup.png)

**Status: T-03–T-05 desktop writing preview. No stable release yet. Writing is temporary and is not saved.**

Terminal is planned as an offline-first desktop journal for macOS and Windows. Open it, write with a compact rich-text toolbar, and find previous entries through title search and a chronological archive. The planned release will store writing in a local SQLite database; this early preview uses memory only. No accounts, cloud dependency, analytics, advertising, or AI processing of journal content.

## Project documents

- [Product Requirements Document v0.1](docs/PRD-v0.1.md)
- [UI Design System v0.2](docs/UI-DESIGN-SYSTEM-v0.2.md)
- [Accepted development backlog](docs/BACKLOG.md)
- [Architecture and decisions](docs/ARCHITECTURE.md)
- [Development environment](docs/DEVELOPMENT.md)
- [Contribution workflow](CONTRIBUTING.md) and [AI agent instructions](AGENTS.md)

Tracking: [20 ordered issues](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues?q=is%3Aissue+sort%3Acreated-asc) · [five milestones](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/milestones) · [Terminal v1.0 project board](https://github.com/users/arlecchinoOPSource/projects/1).

## Technology

Tauri 2, React, TypeScript, Vite, Tiptap, and local SQLite. Distribution is planned through GitHub Releases after cross-platform testing. Supported OS versions and installer trust requirements will be verified before release.

## Design reference

![Original workspace mockup](docs/reference/terminal-workspace-mockup.png)

Forest black `#16231D`, near black `#090B0C`, and terminal mint `#B0E2CC`. The image above is the original layout reference. The current [v0.2 design direction](docs/UI-DESIGN-SYSTEM-v0.2.md) preserves the left menu, right writing area, and palette while specifying monospaced labels, compact technical frames, segmented controls, and restrained CRT atmosphere. This revision is documentation only; it does not change the application.

## Privacy and data ownership

The accepted design includes autosave, full versioned JSON backup/restore, and readable individual-entry export. Local storage is not automatically encrypted; v1 relies on operating-system account permissions and disk protection. No private journal data belongs in this repository or issue reports.

## Development

Open this folder in VS Code and run `npm run dev` in its terminal, or select **Terminal → Run Task → Terminal: Run desktop preview**. Test the title, multiline writing, selection, copy/paste, and undo/redo. **Closing or reloading clears your writing.** Saving begins with later backlog tasks. See [the development guide](docs/DEVELOPMENT.md) for setup, checks, and platform limitations. Work through authorized backlog tasks in order.

## License

[MIT](LICENSE) — Copyright 2026 Arlecchino.

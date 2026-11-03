# Terminal by Arlecchino

A private, lightweight writing environment that makes journaling effortless.

![Terminal identity](docs/reference/arlecchino-brand-mockup.png)

**Status: early desktop development preview. No stable release yet.**

Terminal is planned as an offline-first desktop journal for macOS and Windows. Open it, write with a compact rich-text toolbar, and find previous entries through title search and a chronological archive. Writing stays in a local SQLite database. No accounts, cloud dependency, analytics, advertising, or AI processing of journal content.

## Project documents

- [Product Requirements Document v0.1](docs/PRD-v0.1.md)
- [UI Design System v0.1](docs/UI-DESIGN-SYSTEM-v0.1.md)
- [Accepted development backlog](docs/BACKLOG.md)
- [Architecture and decisions](docs/ARCHITECTURE.md)
- [Development environment](docs/DEVELOPMENT.md)
- [Contribution workflow](CONTRIBUTING.md) and [AI agent instructions](AGENTS.md)

Tracking: [20 ordered issues](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues?q=is%3Aissue+sort%3Acreated-asc) · [five milestones](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/milestones) · [Terminal v1.0 project board](https://github.com/users/arlecchinoOPSource/projects/1).

## Planned technology

Tauri 2, React, TypeScript, Vite, Tiptap, and local SQLite. Distribution is planned through GitHub Releases after cross-platform testing. Supported OS versions and installer trust requirements will be verified before release.

## Design reference

![Original workspace mockup](docs/reference/terminal-workspace-mockup.png)

Forest black `#16231D`, near black `#090B0C`, and terminal mint `#B0E2CC`. These are planning references, not screenshots of a running app.

## Privacy and data ownership

The accepted design includes autosave, full versioned JSON backup/restore, and readable individual-entry export. Local storage is not automatically encrypted; v1 relies on operating-system account permissions and disk protection. No private journal data belongs in this repository or issue reports.

## Development

Open this folder in VS Code and run `npm run dev` in its terminal. See [the development guide](docs/DEVELOPMENT.md) for setup, checks, and platform limitations. Work through authorized backlog tasks in order.

## License

[MIT](LICENSE) — Copyright 2026 Arlecchino.

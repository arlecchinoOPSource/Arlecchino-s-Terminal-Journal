# Contributing to Terminal

Read the PRD, UI design system, architecture, and AGENTS.md before changing behavior. Application implementation is underway for explicitly authorized backlog issues.

1. Select one issue and check its dependencies and acceptance criteria.
2. Branch from current `main`: `feature/T-12-title-search`, `fix/T-08-save-error`, or `docs/T-01-specification`.
3. Make a focused change, preserving user data and the accepted scope.
4. Run checks appropriate to the change. Report commands, results, and any untested platform.
5. Open a pull request referencing the issue; describe behavior, validation, and material limitations.
6. Review manually and merge only when the definition of done passes. Keep `main` stable.

Use descriptive commits such as `docs: add accepted Terminal specification` or `feat: add title search (T-12)`. Do not commit credentials, signing assets, real journals, or generated dependencies. Lockfiles belong in version control once dependencies are initialized.

Workflow: **Backlog → In Progress → In Review → Done**. Priority P0 means required for the first release; P1 is still accepted scope, scheduled after required foundations. Task numbers describe work order, not necessarily GitHub issue numbers.

Every completed issue must satisfy its acceptance criteria, pass appropriate tests, receive manual review, preserve existing features, contain no unrelated changes, and be committed and merged into the stable branch. Never claim a check passed when it was not run.

For bug reports, include app version, OS, reproduction steps, expected and actual behavior, and a synthetic sample if needed. Remove private writing and sensitive paths from logs and screenshots. Propose scope changes before implementing them.

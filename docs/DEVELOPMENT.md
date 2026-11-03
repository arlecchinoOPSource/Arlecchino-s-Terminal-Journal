# Terminal — local development

The T-03 foundation uses Tauri 2, React, strict TypeScript and Vite. Node 24.22.2 and npm 11.19.1 are pinned in the workspace. Install Rust stable and the [Tauri platform prerequisites](https://v2.tauri.app/start/prerequisites/).

## Run from Visual Studio Code

Open this folder, then choose Terminal → New Terminal:

```sh
npm ci
npm run dev
```

On this Mac, the workspace terminal supplies `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`. In another terminal, prefix native commands with that assignment. No global Xcode selection change is needed.

`npm run dev` opens the native desktop window. `npm run dev:web` is a browser-only preview on localhost:1420; do not run both together. Stop development with Control+C in its terminal.

## Checks and builds

```sh
npm run lint
npm run typecheck
npm test
npm run build:web
npm run build
```

`build` creates a native release executable without distributing an installer. Signing, notarization, Windows installation, and release automation remain T-19. `npm run tauri -- build --bundles app` creates a local macOS app bundle for testing only.

Oxlint is an MIT-licensed development-only linter. The existing TypeScript 7.0.2 is beyond typescript-eslint 8.72.1's supported peer range, so no forced peer resolution is used. Tests use Node's built-in test runner for these initial boundary checks; the comprehensive suite remains T-17. Native crates use the generated Cargo.lock. No logging, SQL, shell, filesystem, HTTP, or updater plugin is enabled in the initial native shell.

SQLite remains the approved storage architecture, but native database initialization and migrations belong to T-06. Existing preinstalled SQL and advanced Tiptap packages are not activated by T-03.

## Official references

- [Tauri configuration](https://v2.tauri.app/reference/config/)
- [Vite guide](https://vite.dev/guide/)
- [Tiptap React](https://tiptap.dev/docs/editor/getting-started/install/react)

Windows builds, installation, Intel macOS, performance, persistence and crash recovery are unverified at this stage.

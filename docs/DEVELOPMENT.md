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
npm run check        # everything below except the release build
npm run lint
npm run typecheck
npm test             # domain unit tests
npm run test:ui      # Playwright UI tests (first run: npx playwright install chromium)
npm run test:native  # cargo fmt/clippy/test and the SQLite schema check
npm run build:web
npm run build
```

What each suite covers, and what it cannot prove, is described in [TESTING.md](TESTING.md). CI runs the same suite on every pull request.

`build` creates a native release executable without an installer. Installers for macOS and Windows are built by GitHub Actions from version tags into a draft release; see [RELEASE.md](RELEASE.md) for the procedure, signing and the clean-machine checklist. `npm run tauri -- build --bundles app` creates a local macOS app bundle for testing only.

Oxlint is an MIT-licensed development-only linter. The existing TypeScript 7.0.2 is beyond typescript-eslint 8.72.1's supported peer range, so no forced peer resolution is used. Tests use Node's built-in test runner for these initial boundary checks; the comprehensive suite remains T-17. Native crates use the generated Cargo.lock. No logging, SQL, shell, filesystem, HTTP, or updater plugin is enabled in the initial native shell.

SQLite remains the approved storage architecture, but native database initialization and migrations belong to T-06. Existing preinstalled SQL and advanced Tiptap packages are not activated by T-03.

## Official references

- [Tauri configuration](https://v2.tauri.app/reference/config/)
- [Vite guide](https://vite.dev/guide/)
- [Tiptap React](https://tiptap.dev/docs/editor/getting-started/install/react)

Release status and remaining unverified areas are tracked in [RELEASE-CHECKLIST-v1.0.md](RELEASE-CHECKLIST-v1.0.md).

## Local data while developing

`npm run dev` and an installed Terminal use the same app-data folder (`journal.sqlite3` under the OS application-data directory for `com.arlecchino.terminal`). Use only synthetic writing while developing, or start the dev app with a throwaway `HOME` as described in [PERFORMANCE.md](PERFORMANCE.md). Spellcheck and autocorrect are disabled so writing is not sent through optional OS or browser writing services.

`npm run tauri -- build --bundles app,dmg` builds a local, ad-hoc signed macOS app and disk image under `src-tauri/target/release/bundle/` for testing; it is not a signed or notarized distribution.

See validation evidence for [T-03–T-05](VALIDATION-T03-T05.md) and [T-06–T-08](VALIDATION-T06-T08.md). **Terminal: Native storage tests** runs the Rust SQLite and lifecycle tests. Vite reports a 500 kB chunk-size advisory for the combined editor/React bundle; this is not a failed build or a performance measurement. Splitting an always-needed editor solely to silence this warning is deferred until measurement.

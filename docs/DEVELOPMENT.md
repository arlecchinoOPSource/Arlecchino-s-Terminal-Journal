# Terminal — development preparation

Verified November 3, 2026, on this Apple Silicon Mac. This is an environment baseline, not proof that the future app builds or runs.

## Available tools

| Tool | Verified availability |
| --- | --- |
| Git | 2.50.1; repository cloned and Arlecchino commit identity configured |
| GitHub CLI | 2.103.3; authenticated as arlecchinoOPSource |
| GitHub Desktop | 3.6.10 installed |
| VS Code | 1.144.0 installed |
| Node / npm | 24.22.2 / 11.19.1 |
| Rust / Cargo | 1.99.1 / 1.99.1; stable aarch64-apple-darwin toolchain |
| Apple native tools | Command Line Tools present; Xcode 26.6 at `/Applications/Xcode.app` |
| SQLite CLI | 3.51.0 |
| Local Tauri CLI | 2.12.4 |
| Local Vite / TypeScript | 8.3.5 / 7.0.2 |

A temporary native Rust program compiled, linked, and ran successfully. A synthetic in-memory SQLite create/write/read check passed. No journal database was created.

## Xcode selection

The Mac's system-wide developer selection points at Command Line Tools, so plain `xcodebuild` and an unqualified Tauri environment check fail to recognize full Xcode. The installed Xcode works when selected for the current process:

```sh
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
xcodebuild -version
npx --no-install tauri info
```

The workspace VS Code terminal configuration sets this variable on macOS. Open a fresh integrated terminal after opening the workspace. This avoids requiring a global administrator change. Tauri's environment section reports Xcode and native prerequisites successfully with this selection; the report's app section is not meaningful before T-03.

## Installed workspace dependencies

`package.json` uses exact direct versions and `package-lock.json` records the resolved tree. `node_modules/` is local and ignored. Node 24.22.2 is recorded in `.nvmrc`; the project uses npm. Existing pnpm availability does not change the package-manager choice.

- React and React DOM 19.3.1.
- Tiptap React, PM, Starter Kit, text style, text alignment, and table packages 3.32.2. Verify extension exports when implementing; avoid registering duplicate Starter Kit extensions.
- Tauri API and CLI 2.12.4; SQL plugin JavaScript bridge 2.6.0.
- Vite 8.3.5, React Vite plugin 6.2.1, TypeScript 7.0.2, and matching React type packages.

The native `tauri` and `tauri-plugin-sql` Rust crates, SQLite feature flags, permissions, migrations, and application configuration are deliberately deferred to T-03/T-06. Installing the JavaScript bridge does not install a working native database. Commit `Cargo.lock` when that project is initialized.

VS Code extensions installed: Rust Analyzer, Tauri, ESLint, and Prettier. Recommendations are recorded under `.vscode/`. Lint/format/build/test configurations will be established with the relevant implementation tasks; installing an extension does not make a check exist.

To open the project when the `code` command is absent from PATH, use VS Code → File → Open Folder, or the installed launcher:

```sh
"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" .
```

To reproduce the dependency installation on a connected development machine:

```sh
npm ci
npm ls --depth=0
npx --no-install tauri --version
npx --no-install vite --version
npx --no-install tsc --version
```

No app source, `tauri.conf.json`, Cargo manifest, dev server, or feature tests have been generated. There is intentionally no `npm run dev` or app build command yet. The next implementation task is [T-03](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/3), after separate authorization.

## Remaining platform work

Windows prerequisites (Microsoft C++ build tools and WebView2), Windows builds, Intel macOS builds, native plugin integration, installer signing/notarization, and clean-machine installation require later platform verification. No Windows availability claim is made from this Mac. Performance targets remain unmeasured.

Official setup references: [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/), [Vite](https://vite.dev/guide/), [Tiptap React](https://tiptap.dev/docs/editor/getting-started/install/react), and [Tauri SQL](https://v2.tauri.app/plugin/sql/).

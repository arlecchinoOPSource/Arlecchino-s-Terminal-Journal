# Dependency decisions

T-03 retains the previously approved React (MIT), TypeScript (Apache-2.0), Vite (MIT), Tauri (MIT OR Apache-2.0), and Tiptap (MIT) stack. Native Tauri and tauri-build versions resolve in Cargo.lock. No generated logging plugin is retained.

Oxlint 1.90.0 (MIT) supplies development-only linting compatible with TypeScript 7. The existing TypeScript version is outside typescript-eslint 8.72.1's supported peer range. Node's built-in test runner avoids another dependency for the initial checks.

T-04 adds @fontsource/ibm-plex-sans and @fontsource/ibm-plex-sans-condensed 5.3.0 (OFL-1.1). Only the required Latin regular/upright and condensed italic styles are bundled by Vite. Fonts are loaded from local application assets, never a CDN. Original licenses are in each installed package's LICENSE file; redistributable copies are retained under docs/licenses.

T-09/T-10 enable the previously installed @tiptap/extension-text-align, @tiptap/extension-text-style and @tiptap/extension-table 3.32.2 (MIT), plus the StarterKit heading, list and blockquote nodes. No new packages were added and the lockfile is unchanged. The stock FontFamily/FontSize extensions are not used; a small local extension limits fonts to the bundled faces. No paid Tiptap services or hosted editor features are used.

The authorized v0.2 visual implementation adds @fontsource/ibm-plex-mono 5.3.0 (OFL-1.1), locally bundled for interface labels. Its license is retained in docs/licenses/IBM-Plex-Mono.txt. No runtime network access is added.

The font controls add @fontsource/ibm-plex-serif and @fontsource/literata 5.3.0 (OFL-1.1) so the writing font menu offers serif choices alongside Plex Sans, Plex Mono and Plex Sans Condensed. Only the Latin regular and italic faces are bundled locally by Vite; no runtime font downloads. Licenses are retained in docs/licenses/IBM-Plex-Serif.txt and docs/licenses/Literata.txt.

T-15 adds `tauri-plugin-dialog` 2.8.3 (Apache-2.0 OR MIT), the official Tauri plugin for native open/save dialogs, pinned in Cargo.lock. It is used only from Rust: backup commands open the dialog and read or write the chosen file themselves, so the webview never receives file paths or filesystem access. No dialog or filesystem permissions are granted to the window. The plugin depends on `tauri-plugin-fs` as a library; that plugin is not registered or granted. 2.8.4 was available but released within the previous week, so 2.8.3 was chosen.

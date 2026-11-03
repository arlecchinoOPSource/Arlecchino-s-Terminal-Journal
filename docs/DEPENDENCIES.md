# Dependency decisions

T-03 retains the previously approved React (MIT), TypeScript (Apache-2.0), Vite (MIT), Tauri (MIT OR Apache-2.0), and Tiptap (MIT) stack. Native Tauri and tauri-build versions resolve in Cargo.lock. No generated logging plugin is retained.

Oxlint 1.90.0 (MIT) supplies development-only linting compatible with TypeScript 7. The existing TypeScript version is outside typescript-eslint 8.72.1's supported peer range. Node's built-in test runner avoids another dependency for the initial checks.

T-04 adds @fontsource/ibm-plex-sans and @fontsource/ibm-plex-sans-condensed 5.3.0 (OFL-1.1). Only the required Latin regular/upright and condensed italic styles are bundled by Vite. Fonts are loaded from local application assets, never a CDN. Original licenses are in each installed package's LICENSE file; redistributable copies are retained under docs/licenses.

T-09/T-10 enable the previously installed @tiptap/extension-text-align, @tiptap/extension-text-style and @tiptap/extension-table 3.32.2 (MIT), plus the StarterKit heading, list and blockquote nodes. No new packages were added and the lockfile is unchanged. The stock FontFamily/FontSize extensions are not used; a small local extension limits fonts to the bundled IBM Plex faces. No paid Tiptap services or hosted editor features are used.

The authorized v0.2 visual implementation adds @fontsource/ibm-plex-mono 5.3.0 (OFL-1.1), locally bundled for interface labels. Its license is retained in docs/licenses/IBM-Plex-Mono.txt. No runtime network access is added.

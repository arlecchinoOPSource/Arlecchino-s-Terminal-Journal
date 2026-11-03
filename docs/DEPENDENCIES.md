# Dependency decisions

T-03 retains the previously approved React (MIT), TypeScript (Apache-2.0), Vite (MIT), Tauri (MIT OR Apache-2.0), and Tiptap (MIT) stack. Native Tauri and tauri-build versions resolve in Cargo.lock. No generated logging plugin is retained.

Oxlint 1.90.0 (MIT) supplies development-only linting compatible with TypeScript 7. The existing TypeScript version is outside typescript-eslint 8.72.1's supported peer range. Node's built-in test runner avoids another dependency for the initial checks.

T-04 adds @fontsource/ibm-plex-sans and @fontsource/ibm-plex-sans-condensed 5.3.0 (OFL-1.1). Only the required Latin regular/upright and condensed italic styles are bundled by Vite. Fonts are loaded from local application assets, never a CDN. Original licenses are in each installed package's LICENSE file; redistributable copies are retained under docs/licenses.

Previously installed SQL, table, text alignment, and text style packages remain reserved for their backlog issues; they are not enabled in this preview. No paid Tiptap services or hosted editor features are used.

The authorized v0.2 visual implementation adds @fontsource/ibm-plex-mono 5.3.0 (OFL-1.1), locally bundled for interface labels. Its license is retained in docs/licenses/IBM-Plex-Mono.txt. No runtime network access is added.

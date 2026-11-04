# T-19 validation — November 4, 2026

Scope: automated builds and installers. No release was published and no tag was pushed.

## What changed

- **`.github/workflows/release.yml`** runs on `v*` tags (and manually):
  - First, the full CI workflow, now reusable via `workflow_call`.
  - Then a check that the tag matches the app version in all three files.
  - Then builds of a **universal macOS** app and `.dmg` and **Windows x64** NSIS and MSI installers with `tauri-apps/tauri-action@v1`.
  - On a tag it attaches them to a **draft pre-release**; run manually, it only uploads workflow artifacts. Publishing is always a manual step by the owner.
- **Signing**:
  - Apple Developer ID signing and notarization switch on only when the six `APPLE_*` repository secrets exist.
  - Otherwise macOS builds are ad-hoc signed, so Apple Silicon can run them after a Gatekeeper confirmation.
  - Windows signing is documented but not configured until a certificate provider is chosen.
  - No signing material is stored in the repository; key and certificate files are git-ignored (tested).
- **Bundle settings** (`src-tauri/tauri.conf.json`):
  - Targets `app`, `dmg`, `nsis` and `msi`; publisher, copyright, Productivity category and descriptions.
  - macOS 11 minimum.
  - Per-user NSIS install with no admin rights, and the WebView2 bootstrapper embedded.
- **`scripts/check_version.mjs`**: `package.json`, `tauri.conf.json`, `Cargo.toml` and the tag must agree (tested).
- **`docs/RELEASE.md`**: release steps, signing secrets, unsigned-build caveats, and a clean-machine checklist for macOS and Windows. **`CHANGELOG.md`**: notes for the first preview.

## Checks

| Check | Result |
| --- | --- |
| `npm run check` (lint, typecheck, 51 unit tests, build, 19 UI tests, fmt, clippy, 31 native tests, schema check) | pass |
| Workflow YAML parses (`ci.yml`, `release.yml`) | pass |
| Local macOS bundle (`tauri build --bundles app,dmg`, Apple Silicon) | `Terminal.app` 13.5 MB, `Terminal_0.1.0_aarch64.dmg` 5.8 MB |
| DMG mounts without prompts; contains `Terminal.app` and an Applications link | pass |
| App signature | ad-hoc, `codesign --verify --deep --strict` valid; Gatekeeper `spctl` rejects (not notarized), as documented |
| Info.plist | `com.arlecchino.terminal`, 0.1.0, macOS 11.0, copyright and category present |
| Installed copy launched with a throwaway profile | runs; creates the journal folder `0700` and database files `0600`; schema migrated; no stderr output; `integrity_check` ok after SIGKILL |

Found and fixed: adding the MIT licence as a bundle licence file made the DMG demand a licence agreement before mounting, so it was removed.

## Not verified

- The release workflow itself has not run on GitHub yet: it needs a `v*` tag, or for this branch to reach `main` before a manual run. Its first run should be a manual one.
- The universal (Intel + Apple Silicon) build and the Windows installers were not built locally.
- Clean-machine installation on macOS and Windows (checklist in docs/RELEASE.md), Gatekeeper and SmartScreen behaviour for downloaded files, and signed or notarized builds (no certificates available).

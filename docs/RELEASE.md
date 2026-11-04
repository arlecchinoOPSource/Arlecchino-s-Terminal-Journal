# Releasing Terminal

Releases are built by GitHub Actions (`.github/workflows/release.yml`) from a tagged commit that passes the full CI suite. Nothing is published automatically: the workflow attaches installers to a **draft** release, and the owner reviews and publishes it by hand.

## What gets built

| Platform | Runner | Artifacts |
| --- | --- | --- |
| macOS 11+ (Apple Silicon and Intel, universal) | `macos-15` | `Terminal.app` (zipped as `.app.tar.gz`) and a `.dmg` |
| Windows 10/11 x64 | `windows-2025` | NSIS installer (`-setup.exe`, per-user, no admin) and an `.msi` |

The Windows installers include the WebView2 bootstrapper. On the rare machine without WebView2 (preinstalled on Windows 11 and current Windows 10), installing it needs a one-time download. Terminal itself never uses the network.

## Steps

1. Make sure `main` contains everything for the release and CI is green.
2. Update the version in all three places: `package.json`, `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml` (then `npm install` and `cargo check` so both lockfiles update). `node scripts/check_version.mjs` must print the new version.
3. Move the `Unreleased` notes in `CHANGELOG.md` under the new version and date.
4. Commit, then tag and push the tag:
   ```sh
   git tag v0.2.0
   git push origin v0.2.0
   ```
5. The workflow runs the full check suite, verifies that the tag matches the version, builds both platforms and attaches the installers to a draft pre-release named after the tag.
6. Download each installer and run the [clean-machine checklist](#clean-machine-checklist) on real macOS and Windows machines.
7. Paste the changelog section into the draft, untick "pre-release" if appropriate, and publish.

Running the workflow manually (Actions → Release builds → Run workflow) builds the same installers as downloadable workflow artifacts without creating a release, which is useful for testing.

## Signing and notarization

Without signing secrets the builds still work, with these limits:

- **macOS** apps are ad-hoc signed and not notarized. Gatekeeper blocks them on first open; the person must right-click → Open, or allow them in System Settings → Privacy & Security.
- **Windows** installers are unsigned. SmartScreen shows "Windows protected your PC"; the person must choose More info → Run anyway.

### macOS (Developer ID + notarization)

Requires a paid Apple Developer account. Add these repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `APPLE_CERTIFICATE` | Base64 of the exported "Developer ID Application" certificate (`.p12`) |
| `APPLE_CERTIFICATE_PASSWORD` | Password used when exporting the `.p12` |
| `APPLE_SIGNING_IDENTITY` | e.g. `Developer ID Application: Your Name (TEAMID)` |
| `APPLE_ID` | Apple ID email used for notarization |
| `APPLE_PASSWORD` | An app-specific password for that Apple ID |
| `APPLE_TEAM_ID` | The 10-character team ID |

When `APPLE_CERTIFICATE` and `APPLE_SIGNING_IDENTITY` are present, the workflow passes all six to Tauri, which signs with the hardened runtime and notarizes. Never commit certificates, `.p12` files or passwords (they are git-ignored).

### Windows

Code signing needs a certificate from a trusted provider; Azure Trusted Signing is the lowest-cost option for individuals. Tauri supports it through `bundle.windows.signCommand`. It is not configured yet. Once a provider is chosen, add the command and its secrets, and update this section.

## Clean-machine checklist

Use a machine (or fresh user account / VM) that has never run Terminal. Record the OS version, the installer used, and the results in the release's validation notes.

**macOS**

- [ ] Open the `.dmg`, drag Terminal to Applications, and launch it (note any Gatekeeper prompt).
- [ ] An empty draft opens; write a titled entry and see "Saved".
- [ ] Quit with ⌘Q and relaunch: the entry reopens with its formatting.
- [ ] Archives, Search, Settings, backup export/restore and entry export all work.
- [ ] Move the app to the Trash. The journal stays in `~/Library/Application Support/com.arlecchino.terminal/` until removed manually.

**Terminal 2.0 additions** (both platforms)

- [ ] Upgrade: install 2.0 over 1.0 with a synthetic 1.0 journal. Entries, numbers, formatting and writing settings are unchanged; the theme is Mint; sound is off.
- [ ] Themes: all four apply at once and are still chosen after relaunch, with no flash of another theme.
- [ ] Sounds: switch Sound on and hear each preview, typing in both packs, a click in each area, and the error sound (for example, export to a read-only folder).
- [ ] Startup: the screen shows and gives way; the startup sound plays at launch if the system allows it.
- [ ] Close: quit with Sound on. The window hides at once, the close sound finishes, and the app exits; relaunch during the sound.
- [ ] Motion: Reduced and Off, and the system's reduce-motion setting, stop the animations.

**Windows**

- [ ] Run `-setup.exe` (note any SmartScreen prompt); confirm it installs without administrator rights.
- [ ] Repeat the writing, relaunch and feature checks above, using Ctrl instead of ⌘.
- [ ] Uninstall from Settings → Apps. The journal stays in `%APPDATA%\com.arlecchino.terminal\` unless removed.
- [ ] Install the `.msi` on a second machine or account and repeat the launch check.

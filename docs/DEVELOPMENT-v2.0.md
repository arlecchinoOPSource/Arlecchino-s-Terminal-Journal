# Terminal 2.0 — development setup

Target: **2.0.0 — The Sensory Update**. Released baseline: [v1.0.0](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/releases/tag/v1.0.0), commit `7071143de813262f5645d766307c36ffeb515c74`, published November 4, 2026.

## Repository workflow

- `main` remains the stable line; v1 fixes can be reviewed there without mixing unfinished sensory work.
- `development/v2.0.0` is the integration branch, created from the released baseline. Its first commit is documentation and CI setup only; the setup PR targets `main` so the public repository also has the roadmap.
- For an authorized issue, branch from the current v2 integration branch, e.g. `feature/T-22-theme-tokens`, and open a PR back to `development/v2.0.0`.
- Integrate approved v1 fixes into the v2 branch with tests. Do not alter the published v1 tag or rewrite shared history.
- Keep the existing app version at 1.0.0 during this setup. T-34 will update all version-bearing manifests/lockfiles together for the validated release candidate. The development branch is not a 2.0 installer.

Track T-21–T-34 in the milestone **Terminal 2.0.0 — The Sensory Update**, with **Backlog → In Progress → In Review → Done**. Use the issue labels for phase and priority. The old v1 board and issues remain historical records.

Work order: foundation → themes → sounds → motion → startup → compatibility/release verification. Startup feature implementation waits until themes, audio/settings, and motion have passed their checks. Word/DOCX integration belongs to 3.0.

## Local tools

Reuse the installed Tauri 2, React, TypeScript, Vite, Tiptap, Rust/rusqlite, Node/npm, and editor setup documented in [DEVELOPMENT.md](DEVELOPMENT.md). No extra framework, animation library, audio package, service, or app is necessary for preparation. Arlecchino will produce original sounds in Ableton; the runtime only receives reviewed local exports.

```sh
npm ci
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
npm run check
```

Use [TESTING.md](TESTING.md) for individual checks. Browser tests use synthetic native mocks; Rust tests exercise actual SQLite in disposable profiles. Do not launch development builds against the owner's live journal to test upgrades. Use isolated synthetic v1 fixtures and disposable app-data locations during T-33.

## Baseline evidence — November 4, 2026

The existing `npm run check` suite passed on this Apple Silicon Mac with Xcode selected through `DEVELOPER_DIR`:

| Check | Result |
| --- | --- |
| Oxlint / strict TypeScript | passed |
| Node unit tests | 51 passed |
| Production frontend bundle | passed |
| Playwright Chromium + WebKit | 38 passed |
| Rust fmt / Clippy warnings as errors | passed |
| Native Rust tests | 31 passed |
| SQLite schema checks | 3 passed |

Vite retains its existing >500 kB bundle-size warning (717.44 kB minified JS); this is baseline evidence, not a new performance improvement or a reason to broaden setup work. Browser test colour-output warnings were non-fatal. These checks do not establish Windows native installation, Intel Mac installation, screen-reader behaviour, production audio latency, or future v2 compatibility. Existing manual verification limits remain in the [v1 release checklist](RELEASE-CHECKLIST-v1.0.md).

The first GitHub runs passed native tests on Linux, macOS, and Windows but exposed a Linux WebKit timeout in the existing full-session privacy test: rapid panel shortcuts raced focus/visibility before selecting a settings font. T-21 waits for editor-command focus restoration and explicit panel state between interactions, and checks each selected font by its accessible name. A subsequent local run exposed the same missing editor/selection synchronization in the table-entry test; that test now waits for editor focus, cell text, and the Tab destination before continuing. The external-request and saved-table assertions are unchanged; no app source or product behaviour is changed to bypass either test.

One parallel PR run also exceeded the archive timing gate (6,083 ms, then 5,804 ms on retry; the identical branch run passed). CI browser tests now use one worker so the 5,000-entry archive and 140,000-word editor measurements do not compete for the runner's CPU. Local runs retain their normal parallelism. The existing performance thresholds and coverage are unchanged. Review the setup PR's latest CI result rather than treating the earlier failed runs as passing.

## Release gates

Reuse the existing CI and draft-release pipeline. CI now also runs on pushes to `development/v2.0.0`; all PRs already run the same suite. The release workflow and secrets are unchanged during setup. No v2 tag, installer, draft release, or publication is created now.

Before T-34: collect the [v2 release checklist](RELEASE-CHECKLIST-v2.0.md), asset provenance, native platform results, upgrade evidence, and actual startup/resource measurements. Owner authorization and passing gates are required for publication.

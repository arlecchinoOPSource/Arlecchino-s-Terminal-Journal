# Performance measurements — November 4, 2026

All figures were measured, not estimated, on one machine: an Apple Silicon Mac (macOS, Darwin 25.5) running a **release** build. Only synthetic data and throwaway profiles were used. Windows and Intel Macs have not been measured.

## Startup and memory (release build)

Build: `npm run tauri -- build --no-bundle --features startup-metrics`. The `startup-metrics` feature only prints elapsed milliseconds for three milestones and is never part of normal builds. Script: `scripts/measure_release.py` (5 launches per profile).

| Profile | Page loaded (median) | Interface requests the journal (median) | Memory after 5 s (RSS, all processes) |
| --- | --- | --- | --- |
| Empty journal | 160 ms (159–224) | 237 ms (237–306) | 213 MB |
| 5,000 entries, each the formatted fixture | 158 ms (156–190) | 236 ms (234–268) | 232 MB |

- Times are from process start. "Interface requests the journal" is when the interface first asks for the entry list, i.e. it has loaded and is opening the journal. The slowest run in each group was the first (cold) launch.
- Memory per process for the empty journal: app 97 MB, WebKit WebContent 67 MB, WebKit GPU 32 MB, WebKit Networking 15 MB. With 5,000 entries: 100 / 81 / 35 / 15 MB. RSS counts shared system libraries in every process, so the sum overstates real memory use. The WebKit helper processes are identified as the ones that appeared after launch.
- Release binary: 13.4 MB. Built frontend (`dist`): 1.1 MB, including bundled fonts.

## Large journals and entries

| Measurement | Result | Where |
| --- | --- | --- |
| List 5,000 entries (native, release) | 2.9 ms | `journal::tests::large_journal_stays_responsive` (`--release --nocapture`) |
| Save a 1 MB entry (~100,000 words), first save / re-save (release) | 2.0 ms / 1.9 ms | same |
| Open that entry (release) | 0.1 ms | same |
| Same operations in a debug build | list 8 ms, save 67–76 ms, open 4 ms | same, bounds enforced in `cargo test` |
| Launch UI with 5,000 entries (Chromium, dev server) | 625 ms | `tests/ui/quality.spec.ts` |
| Open Archives with 5,000 rows | 1.1 s | same |
| Type a search and filter 5,000 titles | 0.8 s (including typing 10 characters) | same |
| Open a 140,000-word entry in the editor | 1.3 s | same |
| Type 23 characters at the end of that entry | 0.6 s (Playwright's typing pace included) | same |
| Search 10,000 titles in memory | well under 100 ms | `tests/search.test.mjs` |

UI timings come from Chromium against the Vite dev server, not the desktop WebKit view, and include Playwright overhead; they show that nothing degrades badly at scale, not exact desktop latency. The tests fail if these exceed generous limits, so regressions are caught.

## Observations

- Startup is dominated by the web view; journal size (0 vs 5,000 entries) made no measurable difference to startup.
- Archives renders every row; 5,000 rows take about a second to appear. If journals much larger than this become common, a virtualized list would be the next improvement. No change was made now.

## Reproducing

```sh
npm run tauri -- build --no-bundle --features startup-metrics
python3 -I scripts/measure_release.py src-tauri/target/release/terminal-journal \
  src-tauri/migrations/0001_initial.sql tests/fixtures/formatted-entry.json /tmp/terminal-measure 5
cargo test --manifest-path src-tauri/Cargo.toml --release large_journal -- --nocapture
npx playwright test quality
```

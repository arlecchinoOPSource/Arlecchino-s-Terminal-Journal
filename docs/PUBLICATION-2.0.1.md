# Terminal 2.0.1 — publication record

Published November 5, 2026, from commit `605020dffc8034d87405061c4a359e20e4d71a55`, tag `v2.0.1`.

[Stable release](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/releases/tag/v2.0.1) · [Passing tagged workflow](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/actions/runs/42009222853)

Final integration includes PRs #66 (fullscreen close transition off the main thread) and #67 (download link), after the earlier 2.0.1 fixes in #61, #63 and #64. The owner manually verified fullscreen close (no empty Space, full close sound) and keyboard sounds, then explicitly authorized tagging and publication. This is owner acceptance, not a claim of additional agent-run native UI tests. The existing unsigned/not-notarized installer limitations remain documented.

All tagged web and native CI checks and both installer jobs passed. Downloaded assets matched GitHub SHA-256 digests. The DMG checksum is valid; the extracted app reports 2.0.1, contains x86_64 and arm64, and passes codesign verification (ad-hoc, not notarized). Gatekeeper rejects the app as expected, and the Windows installers are unsigned and were not executed in these artifact checks. No live personal journal was used.

| Asset | SHA-256 |
| --- | --- |
| Terminal_2.0.1_universal.app.tar.gz | `467e020dde5c71bca3fe9758a1785721c03d9cc9e68a6775a11713fe8fbeecab` |
| Terminal_2.0.1_universal.dmg | `43e777901b5fabab3fd64b9ae9757966c698acaa89dc52699af9d518e6b5e7b2` |
| Terminal_2.0.1_x64-setup.exe | `b73b9ab63706f7ee9e208fcb47557cd3d39ec958f1aa4d3e0ea1ccc29aff11af` |
| Terminal_2.0.1_x64_en-US.msi | `1bac2118d1d78f53c47ece7a225c2e6d06d0b5b0ca9bc135f6c6fdf0981aa794` |

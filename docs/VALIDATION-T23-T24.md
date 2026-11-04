# T-23 and T-24 validation — November 4, 2026

Scope: the four themes, the Themes panel, local theme persistence ([#37](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/37)), and the theme contrast audit ([#38](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/38)). Built on T-22.

## Product-owner change

The issue placed the theme selector in Settings. On November 4 the product owner asked instead for a separate **Themes** rail panel between Archives and New entry, with its own icon, formatted like Search and Archives, where themes can be searched and selected. Settings is unchanged. The spec, design system, architecture, and AGENTS rail order record the change.

## What changed

- **`src/styles/tokens.css`**: Blue Monitor, Ember Orange, and Amber Display blocks under `[data-theme='…']`. Each one sets every themed token Mint sets (enforced by a test). Mint values are untouched.
- **`src/domain/themes.ts`**: the theme catalogue, a safe parser (anything unknown means Mint), and search by name or description.
- **`src/persistence/theme.ts`**: synchronous local-storage repository. All storage errors fall back to Mint, and saving failures leave the theme applied for the session.
- **`src/main.tsx`**: applies the stored theme before the first React render.
- **`src/ui/ThemePanel.tsx`, `Shell.tsx`, `Icon.tsx`, `app.css`**: rail button, centred combobox panel, swatches, and the new icon.

## T-24 audit

`tests/theme-tokens.test.mjs` computes WCAG 2.1 contrast for every theme:

- Text, secondary text, muted text, accent, accent highlight, attention, and failure colours, each on all six surfaces (canvas, gutter, chrome, page, raised, tint), need at least 4.5:1.
- The focus ring needs at least 3:1 on every surface.
- Control borders need at least 3:1 on canvas, chrome, and raised surfaces.
- Selected text needs at least 4.5:1.

| Theme | Lowest text contrast (muted on page) | Result |
| --- | --- | --- |
| Terminal Mint | 6.21 | pass |
| Blue Monitor | 5.60 | pass |
| Ember Orange | 5.69 | pass |
| Amber Display | 6.16 | pass |

Two derived Blue and Ember control borders (2.78–2.95:1) were raised above 3:1 before the tokens were committed. In the warm themes, attention and failure differ from the accent, and save status always has a text label, so state is not shown by colour alone.

## Checks

| Check | Result |
| --- | --- |
| `npm run check` (lint, typecheck, 62 unit tests, build, 44 UI tests in Chromium and WebKit, fmt, clippy, 31 native tests, 3 schema checks) | pass |
| UI: rail order is Search, Archives, Themes, New entry; search filters; Enter and click apply; the panel stays open; Escape returns focus | pass |
| UI: switching themes leaves the draft text and save status unchanged and makes **zero** journal writes | pass |
| UI: the theme survives a reload (relaunch stand-in); an unknown stored value falls back to Mint | pass |
| Mint computed colours equal v1.0.0 (T-22 test) | pass |
| Manual WebKit screenshots of each theme with the panel open | reviewed |
| Production JS | 720.86 kB (+3.4 kB) |

## Not verified

- The T-22 pixel comparison was not repeated, because the rail now has a fifth button by design. Mint's colours are covered by the token and computed-style tests.
- Persistence across a real native relaunch on macOS and Windows: local storage in WKWebView and WebView2 is expected to persist, but this was checked only in the browser engines. The owner's test instance below is the first native run.
- Small-window behaviour and text scaling were checked only through the existing 480 × 640 layout. Screen readers were not tested.
- Theme transitions are instant; animation belongs to T-28 and T-29.

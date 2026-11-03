# T-14 validation — November 4, 2026

Scope: keyboard shortcuts and accessibility. Only synthetic entries were used. No real journal was opened.

## What changed

- **App shortcuts** (`src/domain/shortcuts.ts`), with ⌘ on macOS and Ctrl on Windows: New entry `Mod+N`, Search titles `Mod+K`, Archives `Mod+O`, Settings `Mod+,`. They work from anywhere in the window, toggle their panel, and switch directly between panels. Extra modifiers (Alt, Shift, the other platform's key) do not trigger them, and they are ignored while the delete confirmation dialog is open.
- **Editor shortcuts** are Tiptap's built-ins: undo/redo, bold/italic/underline/strikethrough, headings and body, lists, blockquote, alignment, Tab/Shift+Tab between table cells. A test checks that the documented bindings exist in the bundled packages.
- **Discoverability**: rail buttons and Undo/Redo show the shortcut in their tooltip and expose `aria-keyshortcuts`; their accessible names stay plain ("Search titles"). Settings has a **KEYBOARD** reference listing every shortcut for the current platform.
- **Escape and focus**: Escape (or the close button) closes Search, Archives and Settings and returns focus to where it was before the panel opened (for example the entry title), falling back to the rail button. Clicking outside or tabbing out of a panel closes it. Escape in the delete dialog closes only the dialog.
- **Focus indicators**: every interactive control already had a visible `:focus-visible` ring. Rings on mint-filled surfaces (popover close buttons, the open archive row, the selected settings segment) now use the dark colour so they remain visible.
- **Names and roles**: the brand mark is announced as an image named "Terminal"; the writing toolbar is a labelled region ("Writing tools") instead of an unintended page banner, and its decorative "WRITING TOOLS" caption is hidden from assistive technology. All icon buttons have accessible names.

## Checks

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck` | pass |
| `npm test` (35 tests) | pass |
| `npm run build:web` | pass (existing 500 kB chunk advisory only) |

No native code changed in T-14.

New tests: macOS/Windows modifier mapping for each app shortcut; wrong or extra modifiers and formatting keys never trigger app actions; platform labels and `aria-keyshortcuts`; documented editor shortcuts exist in the bundled Tiptap extensions.

Interactive check in the Vite dev server with an in-memory mock: `Mod+K` from the title opened Search with the input focused, Escape closed it and returned focus to the title; `Mod+O` opened Archives on the open entry; `Mod+K` switched from Archives to Search and pressed again closed it; `Mod+,` opened Settings; real Tab presses moved through Settings and out to the toolbar, closing the panel; `Mod+N` started a draft with focus in the body; opening an entry from Archives put focus in the body; with the delete dialog open `Mod+K` did nothing and Escape closed only the dialog. The accessibility tree was reviewed for names and roles.

## Not verified

- Screen readers (VoiceOver, NVDA) were not run; only the browser accessibility tree was reviewed.
- Windows: Ctrl+N/Ctrl+K/Ctrl+O behaviour inside WebView2, and whether any WebView2 browser accelerator intercepts them first.
- 200% text enlargement and the full native app by hand.

## Writing page framing — November 4, 2026

At the product owner's request, the space beside the writing column is now dark (Near Black) and the column is a Forest Black page whose text width is exactly the chosen writing width, with 48 px of padding each side (24 px under 760 px wide, 16 px under 520 px). The page fills the full height and scrolls with long entries. Measured for every writing width (560, 640, 720, 840) at 1400 × 860, 1100 × 780, 760 × 600 and 480 × 400: the text width matches the setting whenever the window allows, the dark margins are equal on both sides, and there is no horizontal scrolling. In narrow windows the page fills the available width.

# T-12 validation — November 4, 2026

Scope: title search. Only synthetic entries were used. No real journal was opened.

## What changed

- The rail's Search button is enabled once storage is ready and opens a `SEARCH TITLES` overlay above the upper workspace (`src/ui/SearchPanel.tsx`), up to 480 px wide and clamped to the window. It reuses the shared popover, so Escape and outside clicks close it and focus returns to Search. Only one of Search, Archives and About is open at a time.
- The input is focused on open. Results update on every keystroke from the entry list already held in memory, so no storage call happens while typing.
- Matching (`src/domain/search.ts`): the trimmed query must appear anywhere in the title, ignoring case. Composed and decomposed accents match each other (Unicode NFC), but accents are not ignored (`cafe` does not match `café`). A blank query and untitled entries match nothing. Results are ordered most recently modified first.
- Rows show the title and the modification date and time, consistent with Archives; entry numbers are not shown. The highlighted result inverts to mint; the open entry keeps the `▶` marker.
- Keyboard: the input is a combobox with `aria-activedescendant`. Arrow keys, Home and End move the highlight; Enter or click opens the entry through `JournalController.switchTo`, so pending edits are flushed first. A live status line reports the match count or why there are none.
- Dismissing search changes nothing: it performs no writes and leaves the open entry as it was.

## Checks

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck` | pass |
| `npm test` (27 tests) | pass |
| `npm run build:web` | pass (existing 500 kB chunk advisory only) |

No native code changed.

New tests: case-insensitive substring matching ordered newest first; blank queries and untitled entries return nothing; composed/decomposed accent equivalence while accents still count; the journal list is not modified; 10,000 titles are searched in under 100 ms.

Interactive check in the Vite dev server with an in-memory mock of synthetic entries: the input is focused on open; typing `lis` lists the three Lisbon titles newest first with the first highlighted; arrows move the highlight; `zzz` shows the no-match message; `CAFÉ` finds `Café notes`; Escape closes, returns focus to Search and performs no writes; Enter opens the highlighted entry. The overlay fits at 480 × 400.

## Not verified

- Search in the native app with real SQLite storage, by hand.
- VoiceOver announcement of the combobox and results, Windows, and 200% text enlargement.
- No search keyboard shortcut is added; shortcuts belong to a later backlog issue.

## Overlay placement change — November 4, 2026

At the product owner's request, Search and Archives now open in the middle of the app window instead of beside the rail / above the workspace (a deliberate departure from the v0.2 placement guidance). Archives (up to 360 × 520 px) is centred on both axes. Search (up to 480 × 440 px) is centred horizontally with a fixed top edge, so it grows downward while typing instead of jumping, and is vertically centred when its list is full. Both keep an 8–12 px margin from the window edge. Checked at 1100 × 780, 760 × 600 and 480 × 400: equal left/right margins and no horizontal scrolling.

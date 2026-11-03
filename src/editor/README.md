Tiptap editing is implemented in WritingWorkspace.tsx; the schema lives in extensions.ts and the formatting toolbar (T-09) in FormattingToolbar.tsx. Toolbar state is read from the editor selection with useEditorState.

The schema allows paragraphs, headings 1–3, bullet and numbered lists, blockquotes, left/center/right alignment, bold/italic/underline/strikethrough, font family/size (bundled IBM Plex faces only). Links, code, images and other media are excluded. Pasted styles outside the bundled font list are dropped.

Any schema change must be mirrored in `valid_node` in src-tauri/src/journal.rs, which refuses unknown node types, marks and attributes before saving. tests/fixtures/formatted-entry.json is checked by both the JS and Rust tests to keep them in step. Native copy/paste uses the platform Edit menu and standard shortcuts.

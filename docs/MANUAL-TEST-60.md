# Issue #60 — manual regression sequence

Use the fix branch/development build, not the already-published 2.0 installer. Use synthetic entries only.

1. Open Sounds, turn Sound on, enable Typesetting, and set an audible master volume. Close the panel.
2. In a synthetic entry body, type a word and select it. Click Bold/Italic/Underline, alignment, and table insertion. Each enabled action should play the typesetting click once. Change font and size dropdowns: each actual value change should also sound.
3. Turn Typesetting off: the same controls should be silent. Turn it back on, then turn master Sound off: all should be silent. Disabled controls should not sound. Repeat using keyboard activation of controls.
4. Type a synthetic entry title and keep it focused. Choose Literata and 24 px, Bold, Italic, Underline and Centre. These controls apply to the whole title; body text must not change. The advertised shortcuts (Bold, Italic, Underline, Strikethrough and alignment) must do the same from the title, and must not affect the body. Lists, headings and table insertion are body-only and unavailable while targeting the title.
5. Click the body. Apply a different font/size to selected body text. Title styling must remain unchanged. Refocus the title: the toolbar must show its own styles. Choose Default font/size and turn emphasis off to reset those title properties.
6. Set a distinctive title style again, wait for Saved, open another entry and return. Quit/reopen the development app: title text and style should remain. Body edits after styling must not erase the title style.
7. Export the entry as HTML: the title should retain font/size/emphasis/alignment (local font availability can affect the exported face). Plain text remains plain text.
8. Export a full synthetic backup and restore it only in a disposable test profile. Title styling and body content should survive. An older unstyled entry should still open with default title appearance.
9. Repeat with each theme, a small window, keyboard navigation, and reduced motion. Verify the sound controls still govern playback and there are no save errors.

Title styles are validated attributes in the existing structured document, with no database-table migration. Older builds that do not understand these attributes may reject newly styled backups; use the updated build for these round trips. This change does not publish a new installer.

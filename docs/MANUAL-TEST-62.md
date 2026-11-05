# Issue #62 — audio recovery and fullscreen close

Use a development build containing this fix and a disposable synthetic journal. Do not test against personal entries. This branch is stacked on issue #60's fix (PR #61).

## Audio longevity / device interruptions

1. Enable sound, keyboard audio, Typesetting and menu sounds. Verify previews, typing and toolbar sounds are audible.
2. Leave the app open while switching to another app and returning. Repeat after locking/unlocking the Mac and a sleep/wake cycle.
3. Switch audio outputs (built-in speakers/headphones/Bluetooth where available) and return to Terminal. After the output is available again, type or click: audio should recover on interaction without relaunching. A cue during an unavailable/interrupted device may be skipped; it must not replay later as a burst.
4. Continue normal synthetic writing for at least as long as the originally observed failure interval. Check all categories, not only previews. Confirm no writing/save interruption.
5. Disable master sound, repeat switching/sleep, and confirm recovery never unmutes it. Re-enable and verify sound resumes. Startup audio must not replay during recovery.

## Red close button in macOS fullscreen

1. With close sound enabled, create a synthetic entry, enter fullscreen via the green window button, type a final edit, then click the red close button.
2. The journal must save first, then exit promptly. There should be no extra six-second black fullscreen Space held open for the sound tail. macOS's normal brief Space transition may remain. The close sound may be truncated in fullscreen by design.
3. Reopen and verify the final edit. Repeat with close sound disabled, and with rapid close/quit actions.
4. Repeat outside fullscreen: the window should hide, with the existing bounded close-sound tail, and saved text must reopen.
5. Exercise a simulated save failure in the automated tests: close must remain blocked with writing intact. This fix changes only the exit step after successful save.

## Evidence and limits

Automated tests simulate interrupted/closed audio contexts, transient initialization/decoding failures, and the native fullscreen/non-fullscreen linger policy. They do not reproduce a real macOS fullscreen Space transition, native audio-device interruption, or the reported long-session failure on the owner's machine. Record device, macOS version, time until failure, sound settings and interruption steps if symptoms persist. No diagnostic output should contain writing.

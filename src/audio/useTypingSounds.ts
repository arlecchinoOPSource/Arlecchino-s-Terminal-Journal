import { useCallback, useRef, type KeyboardEvent } from 'react';
import { keyCue, type KeyCue } from '../domain/sound';
import { sounds } from './sounds';

/** A keystroke only sounds if the text changes this soon after it. */
const CHANGE_WINDOW_MS = 200;

/**
 * Typing sounds that follow actual text changes (T-26). A keydown records only the kind
 * of key; the sound plays when the title or body then changes. Shortcuts, modifiers,
 * navigation, paste, undo and toolbar formatting therefore stay silent, and IME input
 * sounds once when a composition is committed. Nothing about the text is kept.
 */
export function useTypingSounds() {
  const pending = useRef<{ cue: KeyCue; at: number } | null>(null);
  const onKeyDownCapture = useCallback((event: KeyboardEvent) => {
    const cue = keyCue({ key: event.key, metaKey: event.metaKey, ctrlKey: event.ctrlKey, isComposing: event.nativeEvent.isComposing });
    pending.current = cue ? { cue, at: performance.now() } : null;
  }, []);
  const onCompositionEnd = useCallback(() => { pending.current = null; sounds.playKey('key'); }, []);
  /** Call whenever the title or body text changed. */
  const changed = useCallback(() => {
    const p = pending.current;
    pending.current = null;
    if (p && performance.now() - p.at < CHANGE_WINDOW_MS) sounds.playKey(p.cue);
  }, []);
  return { onKeyDownCapture, onCompositionEnd, changed };
}

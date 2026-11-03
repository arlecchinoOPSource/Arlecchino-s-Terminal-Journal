import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PREFERENCES, preferenceStyles, type Preferences } from '../domain/preferences';
import type { PreferencesRepository } from '../persistence/preferences';

const message = (error: unknown) => error instanceof Error ? error.message : typeof error === 'string' ? error : 'Settings could not be saved. They apply until Terminal closes.';

/**
 * Applies preferences immediately and saves them in the background. Saves are
 * serialized so the last change made is the one stored.
 */
export function usePreferences(repo: PreferencesRepository) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [error, setError] = useState<string | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const changed = useRef(false);
  const latest = useRef(preferences);
  latest.current = preferences;
  useEffect(() => {
    let active = true;
    repo.load().then(stored => { if (active && !changed.current) setPreferences(stored); }, (e: unknown) => { if (active) setError(message(e)); });
    return () => { active = false; };
  }, [repo]);
  useEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(preferenceStyles(preferences))) root.style.setProperty(name, value);
  }, [preferences]);
  const update = useCallback((patch: Partial<Preferences>) => {
    changed.current = true;
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setPreferences(next);
    queue.current = queue.current.then(() => repo.save(next)).then(() => setError(null), (e: unknown) => setError(message(e)));
  }, [repo]);
  return { preferences, error, update };
}

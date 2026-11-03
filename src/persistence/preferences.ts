import { invoke, isTauri } from '@tauri-apps/api/core';
import { parsePreferences, type Preferences } from '../domain/preferences';

export interface PreferencesRepository {
  load(): Promise<Preferences>;
  save(preferences: Preferences): Promise<void>;
}

export const preferencesRepository: PreferencesRepository = {
  async load() {
    if (!isTauri()) throw new Error('Settings are stored only in the desktop app.');
    const stored = parsePreferences(await invoke<unknown>('preferences_get'));
    if (!stored) throw new Error('Stored settings could not be read. Defaults are in use.');
    return stored;
  },
  async save(preferences) {
    if (!isTauri()) throw new Error('Settings are stored only in the desktop app. They apply until this window closes.');
    await invoke('preferences_set', { preferences });
  },
};

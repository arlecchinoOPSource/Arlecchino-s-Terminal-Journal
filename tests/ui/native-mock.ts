import type { Page } from '@playwright/test';

/** Synthetic seed entry; content defaults to one paragraph of the given body text. */
export interface SeedEntry { title: string; body?: string; content?: unknown; updated_at?: number }
export interface MockOptions {
  entries?: SeedEntry[];
  /** Number of the seeded entry (1-based) that the app reopens on launch. */
  openEntry?: number;
  preferences?: Record<string, unknown>;
}
/** State the tests can inspect through `page.evaluate(() => window.__mock)`. */
export interface MockState {
  entries: Record<string, { id: string; entry_number: number; title: string; content: unknown; created_at: number; updated_at: number; revision: number; schema_version: number }>;
  next: number;
  last: string | null;
  preferences: Record<string, unknown>;
  calls: string[];
  writes: number;
  failSaves: number;
  exported: { suggestedName: string; html: string; text: string } | null;
}

/**
 * Installs a stand-in for the Tauri IPC bridge before the app loads. State is
 * kept in sessionStorage so a page reload behaves like relaunching the app.
 */
export async function installNativeMock(page: Page, options: MockOptions = {}) {
  await page.addInitScript((opts: MockOptions) => {
    const KEY = 'terminal-native-mock';
    const doc = (text: string) => ({ type: 'doc', content: [{ type: 'paragraph', attrs: { textAlign: null }, content: text ? [{ type: 'text', text }] : [] }] });
    let state: MockState = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') ?? (() => {
      const base = Date.UTC(2026, 10, 1, 9);
      const entries: MockState['entries'] = {};
      (opts.entries ?? []).forEach((e, i) => {
        const id = `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`;
        entries[id] = { id, entry_number: i + 1, title: e.title, content: e.content ?? doc(e.body ?? `Synthetic body ${i + 1}`), created_at: base, updated_at: e.updated_at ?? base + i * 60_000, revision: 1, schema_version: 1 };
      });
      const open = opts.openEntry ? Object.values(entries)[opts.openEntry - 1]?.id ?? null : null;
      return { entries, next: (opts.entries?.length ?? 0) + 1, last: open, preferences: opts.preferences ?? { font: 'plex-sans', font_size: 17, writing_width: 720, line_spacing: 165 }, calls: [], writes: 0, failSaves: 0, exported: null };
    })();
    const persist = () => sessionStorage.setItem(KEY, JSON.stringify(state));
    const hasText = (v: unknown): boolean => typeof v === 'object' && v !== null && ((typeof (v as { text?: unknown }).text === 'string' && (v as { text: string }).text.trim() !== '') || ((v as { content?: unknown[] }).content ?? []).some(hasText));
    const summaries = () => Object.values(state.entries).sort((a, b) => b.updated_at - a.updated_at || b.entry_number - a.entry_number).map(({ id, entry_number, title, updated_at }) => ({ id, entry_number, title, updated_at }));
    const handlers: Record<string, (args: Record<string, unknown>) => unknown> = {
      journal_list: () => summaries(),
      journal_last: () => (state.last && state.entries[state.last]) ?? null,
      journal_select: ({ id }) => { state.last = (id as string | null) ?? null; return state.last ? state.entries[state.last] ?? null : null; },
      journal_save: ({ draft }) => {
        if (state.failSaves > 0) { state.failSaves--; throw 'The journal could not be updated. Your unsaved writing is still in this window. Retry when storage is available.'; }
        const d = draft as { id: string; title: string; content: unknown; revision: number };
        const old = state.entries[d.id];
        if (!old && !d.title.trim() && !hasText(d.content)) return null;
        if (old && old.revision !== d.revision) throw 'This entry changed elsewhere.';
        const now = Date.now();
        const entry = { ...(old ?? { id: d.id, entry_number: state.next++, created_at: now, schema_version: 1, revision: 0 }), title: d.title, content: d.content, updated_at: now, revision: (old?.revision ?? 0) + 1 };
        state.entries[d.id] = entry; state.last = d.id; state.writes++;
        return entry;
      },
      journal_delete: ({ id }) => { delete state.entries[id as string]; if (state.last === id) state.last = null; },
      journal_finish_exit: () => null,
      preferences_get: () => state.preferences,
      preferences_set: ({ preferences }) => { state.preferences = preferences as Record<string, unknown>; },
      backup_export: ({ suggestedName }) => `${suggestedName}.json`,
      backup_choose: () => ({ token: 7, backup_entries: 2, exported_at: Date.UTC(2026, 9, 20, 12), current_entries: Object.keys(state.entries).length }),
      backup_cancel: () => null,
      backup_restore: ({ token }) => {
        if (token !== 7) throw 'Choose the backup again before restoring. Your journal has not been changed.';
        const base = Date.UTC(2026, 9, 1);
        state.entries = {};
        ['Restored first', 'Restored second'].forEach((title, i) => {
          const id = `00000000-0000-4000-8000-${String(900 + i).padStart(12, '0')}`;
          state.entries[id] = { id, entry_number: 10 + i, title, content: doc(`${title} body`), created_at: base, updated_at: base + i, revision: 1, schema_version: 1 };
        });
        state.next = 12; state.last = null;
        return '/synthetic/app-data/backups/before-restore-1.json';
      },
      entry_export: ({ suggestedName, html, text }) => { state.exported = { suggestedName: suggestedName as string, html: html as string, text: text as string }; return `${suggestedName}.html`; },
    };
    let callback = 0;
    Object.assign(globalThis, { isTauri: true });
    Object.assign(window, {
      // Used by @tauri-apps/api when an event listener is removed.
      __TAURI_EVENT_PLUGIN_INTERNALS__: { unregisterListener: () => {} },
      __mock: new Proxy({}, { get: (_t, key) => state[key as keyof MockState], set: (_t, key, value) => { (state as unknown as Record<string, unknown>)[key as string] = value; persist(); return true; } }),
      __TAURI_INTERNALS__: {
        transformCallback: () => ++callback,
        unregisterCallback: () => {},
        invoke: async (cmd: string, args: Record<string, unknown> = {}) => {
          if (cmd.startsWith('plugin:event|')) return callback;
          state.calls.push(cmd);
          const handler = handlers[cmd];
          if (!handler) throw `Unmocked native command: ${cmd}`;
          try { return handler(args); } finally { persist(); }
        },
      },
    });
  }, options);
}

/** Current stand-in state (as persisted after the latest native call). */
export const mockState = (page: Page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('terminal-native-mock') ?? 'null') as MockState);
/** Changes stand-in behaviour, e.g. `{ failSaves: 1 }` to make the next save fail. */
export const setMock = (page: Page, patch: Partial<MockState>) => page.evaluate(p => { Object.assign((window as unknown as { __mock: Record<string, unknown> }).__mock, p); }, patch);

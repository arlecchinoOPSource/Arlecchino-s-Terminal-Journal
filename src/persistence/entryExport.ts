import { invoke, isTauri } from '@tauri-apps/api/core';

/** Opens a native save dialog; resolves to the saved file name, or null if cancelled. */
export function exportEntryFile(suggestedName: string, html: string, text: string): Promise<string | null> {
  if (!isTauri()) return Promise.reject(new Error('Exporting is available in the desktop app.'));
  return invoke('entry_export', { suggestedName, html, text });
}

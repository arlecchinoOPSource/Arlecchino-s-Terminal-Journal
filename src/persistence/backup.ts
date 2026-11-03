import { invoke, isTauri } from '@tauri-apps/api/core';

/** What a chosen backup contains, shown before anything is replaced. */
export interface RestorePreview { token: number; backup_entries: number; exported_at: number; current_entries: number }

export interface BackupRepository {
  /** Opens a save dialog; resolves to the saved file name, or null if cancelled. */
  exportBackup(suggestedName: string): Promise<string | null>;
  /** Opens a file dialog and validates the file; resolves to null if cancelled. Nothing is changed. */
  chooseBackup(): Promise<RestorePreview | null>;
  /** Replaces the journal with the chosen backup; resolves to where the previous journal was saved. */
  restoreBackup(token: number): Promise<string>;
  cancelRestore(): Promise<void>;
}

function native<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) return Promise.reject(new Error('Backups are available in the desktop app.'));
  return invoke<T>(command, args);
}
export const backupRepository: BackupRepository = {
  exportBackup: suggestedName => native('backup_export', { suggestedName }),
  chooseBackup: () => native('backup_choose'),
  restoreBackup: token => native('backup_restore', { token }),
  cancelRestore: () => native('backup_cancel'),
};

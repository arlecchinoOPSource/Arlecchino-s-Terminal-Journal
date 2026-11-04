import { invoke, isTauri } from '@tauri-apps/api/core';
import type { DraftDocument } from '../domain/draft';
export interface Entry extends DraftDocument { id: string; entry_number: number; created_at: number; updated_at: number; revision: number }
export interface EntrySummary { id: string; entry_number: number; title: string; updated_at: number }
export interface SaveDraft extends DraftDocument { id: string; revision: number }
export interface JournalRepository {
  last(): Promise<Entry | null>;
  list(): Promise<EntrySummary[]>;
  select(id: string | null): Promise<Entry | null>;
  save(draft: SaveDraft): Promise<Entry | null>;
  delete(id: string, revision: number): Promise<void>;
}
function native<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) return Promise.reject(new Error('Open the desktop app to use local journal storage. Browser preview does not save writing.'));
  return invoke<T>(command,args);
}
export const repository: JournalRepository = {
  last: () => native('journal_last'), list: () => native('journal_list'),
  select: id => native('journal_select',{id}), save: draft => native('journal_save',{draft}),
  delete: (id, revision) => native('journal_delete',{id,revision}),
};

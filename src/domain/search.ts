import { archiveOrder, type ArchiveItem } from './archive.ts';

/**
 * Case-insensitive title key. NFC normalization makes composed and decomposed
 * accents (é vs e + ◌́) equal; accents themselves still matter (cafe ≠ café).
 */
export const titleKey = (title: string) => title.normalize('NFC').toLocaleLowerCase();

/** Entries whose title contains the query, most recently modified first. A blank query matches nothing. */
export function searchTitles<T extends ArchiveItem>(entries: readonly T[], query: string): T[] {
  const needle = titleKey(query.trim());
  if (!needle) return [];
  return archiveOrder(entries.filter(entry => titleKey(entry.title).includes(needle)));
}

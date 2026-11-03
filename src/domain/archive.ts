/** The fields the archive needs from a stored entry; timestamps are Unix milliseconds. */
export interface ArchiveItem { id: string; entry_number: number; title: string; updated_at: number }

/** Most recently modified first; ties keep the newest entry number first, matching native `list`. */
export function archiveOrder<T extends ArchiveItem>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) => b.updated_at - a.updated_at || b.entry_number - a.entry_number);
}

const pad = (n: number) => String(n).padStart(2, '0');
/** Local modification date and time as YYYY-MM-DD HH:MM. */
export function archiveDate(updatedAt: number): string {
  const d = new Date(updatedAt);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

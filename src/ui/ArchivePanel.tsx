import { useEffect, useRef, type KeyboardEvent } from 'react';
import { archiveDate, archiveOrder, type ArchiveItem } from '../domain/archive';

type Props = { entries: readonly ArchiveItem[]; activeId: string | null; disabled: boolean; onSelect: (id: string) => void };

/** Record index of saved entries. Arrow keys, Home and End move between rows; Enter or click opens one. */
export function ArchivePanel({ entries, activeId, disabled, onSelect }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const rows = archiveOrder(entries);
  useEffect(() => {
    const list = listRef.current;
    const target = list?.querySelector<HTMLButtonElement>('[aria-current="true"]') ?? list?.querySelector<HTMLButtonElement>('button');
    target?.focus();
    target?.scrollIntoView({ block: 'nearest' });
  }, []);
  function move(event: KeyboardEvent<HTMLUListElement>) {
    const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: buttons.length - 1 }[event.key];
    if (next === undefined || !buttons.length) return;
    event.preventDefault();
    buttons[Math.max(0, Math.min(buttons.length - 1, next))]?.focus();
  }
  if (!rows.length) return <p className="archive-empty">No saved entries yet. Start writing and your entries will appear here.</p>;
  return <>
    <p className="archive-count">{rows.length} {rows.length === 1 ? 'ENTRY' : 'ENTRIES'} · LAST MODIFIED FIRST</p>
    <ul ref={listRef} className="archive-list" aria-label="Saved entries" onKeyDown={move}>
      {rows.map(entry => {
        const current = entry.id === activeId;
        return <li key={entry.id}>
          <button type="button" className="archive-row" aria-current={current} aria-disabled={disabled}
            aria-label={`Entry ${entry.entry_number}: ${entry.title || 'Untitled'}, modified ${archiveDate(entry.updated_at)}${current ? ', open now' : ''}`}
            onClick={() => { if (!disabled) onSelect(entry.id); }}>
            <span className="archive-marker" aria-hidden="true">{current ? '▶' : ''}</span>
            <span className="archive-title">{entry.title || 'Untitled'}</span>
            <span className="archive-meta" aria-hidden="true"><span>#{entry.entry_number}</span><span>{archiveDate(entry.updated_at)}</span></span>
          </button>
        </li>;
      })}
    </ul>
  </>;
}

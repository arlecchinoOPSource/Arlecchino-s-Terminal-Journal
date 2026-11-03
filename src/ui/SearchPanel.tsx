import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { archiveDate, type ArchiveItem } from '../domain/archive';
import { searchTitles } from '../domain/search';

type Props = { entries: readonly ArchiveItem[]; activeId: string | null; disabled: boolean; onSelect: (id: string) => void };

/** Title search as a combobox: typing filters, Arrow/Home/End move the highlight, Enter or click opens. */
export function SearchPanel({ entries, activeId, disabled, onSelect }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const results = searchTitles(entries, query);
  const current = results[Math.min(highlight, results.length - 1)];
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { document.getElementById(`${id}-${current?.id}`)?.scrollIntoView({ block: 'nearest' }); }, [id, current?.id]);
  function open(entryId: string | undefined) { if (entryId && !disabled) onSelect(entryId); }
  function keys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') { event.preventDefault(); open(current?.id); return; }
    const index = results.indexOf(current!);
    const next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: results.length - 1 }[event.key];
    if (next === undefined || !results.length) return;
    event.preventDefault();
    setHighlight(Math.max(0, Math.min(results.length - 1, next)));
  }
  const trimmed = query.trim();
  const message = !entries.length ? 'No saved entries yet.' : !trimmed ? 'Type to search entry titles.' : !results.length ? `No titles match “${trimmed}”.` : `${results.length} ${results.length === 1 ? 'MATCH' : 'MATCHES'}`;
  return <>
    <label className="search-field" htmlFor={`${id}-input`}><span aria-hidden="true">›</span>
      <input ref={inputRef} id={`${id}-input`} type="search" aria-label="Search entry titles" placeholder="Search titles" autoComplete="off" spellCheck={false}
        role="combobox" aria-expanded={results.length > 0} aria-controls={`${id}-results`} aria-autocomplete="list"
        aria-activedescendant={current ? `${id}-${current.id}` : undefined} aria-describedby={`${id}-message`}
        value={query} onChange={e => { setQuery(e.target.value); setHighlight(0); }} onKeyDown={keys} />
    </label>
    <p id={`${id}-message`} className="search-message" role="status">{message}</p>
    {results.length > 0 && <ul id={`${id}-results`} className="archive-list search-results" role="listbox" aria-label="Matching entries">
      {results.map(entry => <li key={entry.id} id={`${id}-${entry.id}`} role="option" aria-selected={entry === current}
        className="archive-row" aria-current={entry.id === activeId} aria-disabled={disabled}
        onPointerDown={e => e.preventDefault()} onClick={() => open(entry.id)}>
        <span className="archive-marker" aria-hidden="true">{entry.id === activeId ? '▶' : ''}</span>
        <span className="archive-title">{entry.title}</span>
        <span className="archive-meta">{archiveDate(entry.updated_at)}</span>
      </li>)}
    </ul>}
  </>;
}

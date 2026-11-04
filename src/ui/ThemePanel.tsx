import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { searchThemes, type ThemeId } from '../domain/themes';

type Props = { current: ThemeId; onSelect: (theme: ThemeId) => void };

/**
 * Theme picker as a combobox, like title search: typing filters, Arrow/Home/End move
 * the highlight, Enter or click applies. The panel stays open to compare themes.
 */
export function ThemePanel({ current, onSelect }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const results = searchThemes(query);
  const [highlight, setHighlight] = useState(() => Math.max(0, results.findIndex(t => t.id === current)));
  const active = results[Math.min(highlight, results.length - 1)];
  useEffect(() => { inputRef.current?.focus(); }, []);
  function keys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') { event.preventDefault(); if (active) onSelect(active.id); return; }
    const index = results.indexOf(active!);
    const next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: results.length - 1 }[event.key];
    if (next === undefined || !results.length) return;
    event.preventDefault();
    setHighlight(Math.max(0, Math.min(results.length - 1, next)));
  }
  const trimmed = query.trim();
  const message = !results.length ? `No themes match “${trimmed}”.` : `${results.length} ${results.length === 1 ? 'THEME' : 'THEMES'} · ENTER TO APPLY`;
  return <>
    <label className="search-field" htmlFor={`${id}-input`}><span aria-hidden="true">›</span>
      <input ref={inputRef} id={`${id}-input`} type="search" aria-label="Search themes" placeholder="Search themes" autoComplete="off" spellCheck={false}
        role="combobox" aria-expanded={results.length > 0} aria-controls={`${id}-results`} aria-autocomplete="list"
        aria-activedescendant={active ? `${id}-${active.id}` : undefined} aria-describedby={`${id}-message`}
        value={query} onChange={e => { setQuery(e.target.value); setHighlight(0); }} onKeyDown={keys} />
    </label>
    <p id={`${id}-message`} className="search-message" role="status">{message}</p>
    {results.length > 0 && <ul id={`${id}-results`} className="archive-list search-results theme-list" role="listbox" aria-label="Themes">
      {results.map(theme => <li key={theme.id} id={`${id}-${theme.id}`} role="option" aria-selected={theme === active}
        className="archive-row" aria-current={theme.id === current}
        onPointerDown={e => e.preventDefault()} onClick={() => { setHighlight(results.indexOf(theme)); onSelect(theme.id); }}>
        <span className="archive-marker" aria-hidden="true">{theme.id === current ? '▶' : ''}</span>
        <span className="theme-name"><span className="archive-title">{theme.label}</span><span className="archive-meta">{theme.description}{theme.id === current ? ' · in use' : ''}</span></span>
        <span className="theme-swatch" data-theme={theme.id} aria-hidden="true"><i /><i /><i /></span>
      </li>)}
    </ul>}
  </>;
}

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ariaShortcut, isMacPlatform, matchShortcut, shortcutLabel } from '../domain/shortcuts';
import { applyTheme, themeRepository } from '../persistence/theme';
import type { ThemeId } from '../domain/themes';
import { IconButton } from './IconButton';
import { Popover } from './Popover';
import { ThemePanel } from './ThemePanel';

type Panel = 'search' | 'archives' | 'themes' | 'info' | null;
// The wordmark's power-on flicker plays only at launch, not each time an entry opens.
const launchedAt = Date.now();
type Props = { children: ReactNode; formattingControls?: ReactNode; historyControls?: ReactNode; status?: ReactNode; statusTone?: string; onNew?: () => void; navigationDisabled?: boolean; archive?: (close: () => void) => ReactNode; search?: (close: () => void) => ReactNode; settings?: ReactNode };
export function Shell({ children, formattingControls, historyControls, status, statusTone = 'idle', onNew, navigationDisabled, archive, search, settings }: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const infoRef = useRef<HTMLButtonElement>(null);
  const archiveRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLButtonElement>(null);
  const themesRef = useRef<HTMLButtonElement>(null);
  // main.tsx applied the stored theme before the first render; this only follows changes.
  const [theme, setTheme] = useState<ThemeId>(() => themeRepository.load());
  const chooseTheme = useCallback((next: ThemeId) => { applyTheme(next); themeRepository.save(next); setTheme(next); }, []);
  const closePanel = useCallback(() => setPanel(null), []);
  const toggle = (next: Exclude<Panel, null>) => setPanel(panel === next ? null : next);
  const mac = isMacPlatform();
  const hint = (label: string, keys: string) => ({ label, title: `${label} (${shortcutLabel(keys, mac)})`, 'aria-keyshortcuts': ariaShortcut(keys, mac) });
  // App shortcuts work from anywhere except while a modal dialog (e.g. delete confirmation) is open.
  const actions = useRef({ onNew, navigationDisabled, search: !!search, archive: !!archive });
  actions.current = { onNew, navigationDisabled, search: !!search, archive: !!archive };
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const action = matchShortcut(event, mac);
      if (!action || document.querySelector('dialog[open]')) return;
      event.preventDefault();
      const a = actions.current;
      if (action === 'new-entry') { if (!a.navigationDisabled) { setPanel(null); a.onNew?.(); } return; }
      const target = action === 'search' ? 'search' : action === 'archives' ? 'archives' : 'info';
      if ((target === 'search' && !a.search) || (target === 'archives' && !a.archive)) return;
      setPanel(current => current === target ? null : target);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mac]);
  const showInfo = panel === 'info';
  return <div className="app-shell">
    <nav className="rail" aria-label="Journal navigation">
      <span className="brand-mark" role="img" aria-label="Terminal">t<span>&gt;</span></span>
      <div className="rail-actions">
        <IconButton ref={searchRef} icon="search" {...hint('Search titles', 'Mod+K')} disabled={!search} aria-expanded={panel === 'search'} aria-controls="search-panel" onClick={() => toggle('search')} />
        <IconButton ref={archiveRef} icon="archive" {...hint('Archives', 'Mod+O')} disabled={!archive} aria-expanded={panel === 'archives'} aria-controls="archive-panel" onClick={() => toggle('archives')} />
        <IconButton ref={themesRef} icon="themes" label="Themes" aria-expanded={panel === 'themes'} aria-controls="theme-panel" onClick={() => toggle('themes')} />
        <IconButton icon="plus" {...hint('New entry', 'Mod+N')} disabled={navigationDisabled} onClick={onNew} />
      </div>
      <IconButton ref={infoRef} icon="settings" {...hint('Settings', 'Mod+,')} className="rail-bottom" aria-expanded={showInfo} aria-controls="settings-panel" onClick={() => toggle('info')} />
    </nav>
    {panel === 'search' && search && <Popover id="search-panel" title="Search titles" className="search-popover" scrim closeLabel="Close search" onClose={closePanel} triggerRef={searchRef}>{search(closePanel)}</Popover>}
    {panel === 'archives' && archive && <Popover id="archive-panel" title="Archives" className="archive-popover" scrim closeLabel="Close archives" onClose={closePanel} triggerRef={archiveRef}>{archive(closePanel)}</Popover>}
    {panel === 'themes' && <Popover id="theme-panel" title="Themes" className="search-popover theme-popover" scrim closeLabel="Close themes" onClose={closePanel} triggerRef={themesRef}><ThemePanel current={theme} onSelect={chooseTheme} /></Popover>}
    {showInfo && <Popover id="settings-panel" title="Settings" className="settings-popover" closeLabel="Close settings" onClose={closePanel} triggerRef={infoRef}>
      {settings}
      <section className="settings-about" aria-label="About Terminal"><p className="settings-section">ABOUT</p><p>Terminal by Arlecchino. Writing and settings are stored locally on this device. Check the save status before closing.</p></section>
    </Popover>}
    <div className="workspace">
      <header className="identity-strip"><span className={Date.now() - launchedAt < 1500 ? 'wordmark-glow power-on' : 'wordmark-glow'}><span className="wordmark" data-text="TERMINAL">TERMINAL</span></span></header>
      <section className="toolbar" aria-label="Writing tools">
        {formattingControls}
        <div className="history-controls">{historyControls}</div>
      </section>
      <main className="writing-surface" id="writing-workspace">{children}</main>
      <footer className="workspace-footer"><span className="save-status" data-tone={statusTone}><span className="save-meter" aria-hidden="true"><span /></span>{status}</span></footer>
    </div>
  </div>;
}

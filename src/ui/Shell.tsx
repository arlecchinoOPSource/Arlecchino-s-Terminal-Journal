import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ariaShortcut, isMacPlatform, matchShortcut, shortcutLabel } from '../domain/shortcuts';
import { IconButton } from './IconButton';
import { Popover } from './Popover';

type Panel = 'search' | 'archives' | 'info' | null;
type Props = { children: ReactNode; formattingControls?: ReactNode; historyControls?: ReactNode; status?: ReactNode; onNew?: () => void; navigationDisabled?: boolean; archive?: (close: () => void) => ReactNode; search?: (close: () => void) => ReactNode; settings?: ReactNode };
export function Shell({ children, formattingControls, historyControls, status, onNew, navigationDisabled, archive, search, settings }: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const infoRef = useRef<HTMLButtonElement>(null);
  const archiveRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLButtonElement>(null);
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
      <span className="brand-mark" role="img" aria-label="Terminal">t<span>›</span></span>
      <div className="rail-actions">
        <IconButton ref={searchRef} icon="search" {...hint('Search titles', 'Mod+K')} disabled={!search} aria-expanded={panel === 'search'} aria-controls="search-panel" onClick={() => toggle('search')} />
        <IconButton ref={archiveRef} icon="archive" {...hint('Archives', 'Mod+O')} disabled={!archive} aria-expanded={panel === 'archives'} aria-controls="archive-panel" onClick={() => toggle('archives')} />
        <IconButton icon="plus" {...hint('New entry', 'Mod+N')} disabled={navigationDisabled} onClick={onNew} />
      </div>
      <IconButton ref={infoRef} icon="settings" {...hint('Settings', 'Mod+,')} className="rail-bottom" aria-expanded={showInfo} aria-controls="settings-panel" onClick={() => toggle('info')} />
    </nav>
    {panel === 'search' && search && <Popover id="search-panel" title="Search titles" className="search-popover" closeLabel="Close search" onClose={closePanel} triggerRef={searchRef}>{search(closePanel)}</Popover>}
    {panel === 'archives' && archive && <Popover id="archive-panel" title="Archives" className="archive-popover" closeLabel="Close archives" onClose={closePanel} triggerRef={archiveRef}>{archive(closePanel)}</Popover>}
    {showInfo && <Popover id="settings-panel" title="Settings" className="settings-popover" closeLabel="Close settings" onClose={closePanel} triggerRef={infoRef}>
      {settings}
      <section className="settings-about" aria-label="About Terminal"><p className="settings-section">ABOUT</p><p>Terminal by Arlecchino. Writing and settings are stored locally on this device. Check the save status before closing.</p></section>
    </Popover>}
    <div className="workspace">
      <div className="identity-strip"><span className="wordmark">TERMINAL<span className="wordmark-cursor" aria-hidden="true"> ▪</span></span><span className="workspace-label">PERSONAL JOURNAL</span></div>
      <section className="toolbar" aria-label="Writing tools">
        {formattingControls}
        <div className="history-controls">{historyControls}</div>
        <span className="tools-label" aria-hidden="true">WRITING TOOLS</span>
      </section>
      <main className="writing-surface" id="writing-workspace">{children}</main>
      <footer className="workspace-footer"><span className="save-status">{status}</span><span id="preview-warning">LOCAL JOURNAL</span></footer>
    </div>
  </div>;
}

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { IconButton } from './IconButton';
import { Popover } from './Popover';

type Panel = 'search' | 'archives' | 'info' | null;
type Props = { children: ReactNode; formattingControls?: ReactNode; historyControls?: ReactNode; status?: ReactNode; onNew?: () => void; navigationDisabled?: boolean; archive?: (close: () => void) => ReactNode; search?: (close: () => void) => ReactNode };
export function Shell({ children, formattingControls, historyControls, status, onNew, navigationDisabled, archive, search }: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const infoRef = useRef<HTMLButtonElement>(null);
  const archiveRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLButtonElement>(null);
  const closePanel = useCallback(() => setPanel(null), []);
  const toggle = (next: Exclude<Panel, null>) => setPanel(panel === next ? null : next);
  const showInfo = panel === 'info';
  return <div className="app-shell">
    <nav className="rail" aria-label="Journal navigation">
      <span className="brand-mark" aria-label="Terminal">t<span>›</span></span>
      <div className="rail-actions">
        <IconButton ref={searchRef} icon="search" label="Search titles" disabled={!search} aria-expanded={panel === 'search'} aria-controls="search-panel" onClick={() => toggle('search')} />
        <IconButton ref={archiveRef} icon="archive" label="Archives" disabled={!archive} aria-expanded={panel === 'archives'} aria-controls="archive-panel" onClick={() => toggle('archives')} />
        <IconButton icon="plus" label="New entry" disabled={navigationDisabled} onClick={onNew} />
      </div>
      <IconButton ref={infoRef} icon="settings" label="About this preview" className="rail-bottom" aria-expanded={showInfo} aria-controls="preview-info" onClick={() => toggle('info')} />
    </nav>
    {panel === 'search' && search && <Popover id="search-panel" title="Search titles" className="search-popover" closeLabel="Close search" onClose={closePanel} triggerRef={searchRef}>{search(closePanel)}</Popover>}
    {panel === 'archives' && archive && <Popover id="archive-panel" title="Archives" className="archive-popover" closeLabel="Close archives" onClose={closePanel} triggerRef={archiveRef}>{archive(closePanel)}</Popover>}
    {showInfo && <Popover id="preview-info" title="About Terminal" closeLabel="Close preview information" onClose={closePanel} triggerRef={infoRef}>
      <p>Terminal by Arlecchino</p><p>Writing is stored locally on this device. Check the save status before closing.</p>
      <p>Preferences will arrive in a later version.</p>
    </Popover>}
    <div className="workspace">
      <div className="identity-strip"><span className="wordmark">TERMINAL<span className="wordmark-cursor" aria-hidden="true"> ▪</span></span><span className="workspace-label">PERSONAL JOURNAL</span></div>
      <header className="toolbar" aria-label="Writing tools">
        {formattingControls}
        <div className="history-controls">{historyControls}</div>
        <span className="tools-label">WRITING TOOLS</span>
      </header>
      <main className="writing-surface" id="writing-workspace">{children}</main>
      <footer className="workspace-footer"><span className="save-status">{status}</span><span id="preview-warning">LOCAL JOURNAL</span></footer>
    </div>
  </div>;
}

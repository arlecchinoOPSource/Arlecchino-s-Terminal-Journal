import { useCallback, useRef, useState, type ReactNode } from 'react';
import { IconButton } from './IconButton';
import { Popover } from './Popover';

type Props = { children: ReactNode; historyControls?: ReactNode; status?: ReactNode; onNew?: () => void; navigationDisabled?: boolean };
export function Shell({ children, historyControls, status, onNew, navigationDisabled }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLButtonElement>(null);
  const closeInfo = useCallback(() => setShowInfo(false), []);
  return <div className="app-shell">
    <nav className="rail" aria-label="Journal navigation">
      <span className="brand-mark" aria-label="Terminal">t<span>›</span></span>
      <div className="rail-actions">
        <IconButton icon="search" label="Search — available in a later version" disabled />
        <IconButton icon="archive" label="Archives — available in a later version" disabled />
        <IconButton icon="plus" label="New entry" disabled={navigationDisabled} onClick={onNew} />
      </div>
      <IconButton ref={infoRef} icon="settings" label="About this preview" className="rail-bottom" aria-expanded={showInfo} aria-controls="preview-info" onClick={() => setShowInfo(!showInfo)} />
    </nav>
    {showInfo && <Popover id="preview-info" title="About Terminal" onClose={closeInfo} triggerRef={infoRef}>
      <p>Terminal by Arlecchino</p><p>Writing is stored locally on this device. Check the save status before closing.</p>
      <p>Archives, search, formatting controls, and preferences will arrive in later versions.</p>
    </Popover>}
    <div className="workspace">
      <div className="identity-strip"><span className="wordmark">TERMINAL<span className="wordmark-cursor" aria-hidden="true"> ▪</span></span><span className="workspace-label">PERSONAL JOURNAL</span></div>
      <header className="toolbar" aria-label="Writing tools">
        <div className="font-preview" aria-label="Current writing font: IBM Plex Sans, 17 pixels"><span>IBM Plex Sans</span><span className="font-size">17</span></div>
        <span className="toolbar-divider" aria-hidden="true" />
        <div className="format-preview" aria-label="Formatting controls are not yet available"><button disabled title="Formatting arrives in a later version" aria-label="Bold — not yet available"><b>B</b></button><button disabled aria-label="Italic — not yet available"><i>I</i></button><button disabled aria-label="Underline — not yet available"><u>U</u></button></div>
        <div className="history-controls">{historyControls}</div>
        <span className="tools-label">WRITING TOOLS</span>
      </header>
      <main className="writing-surface" id="writing-workspace">{children}</main>
      <footer className="workspace-footer"><span className="save-status">{status}</span><span id="preview-warning">LOCAL JOURNAL</span></footer>
    </div>
  </div>;
}

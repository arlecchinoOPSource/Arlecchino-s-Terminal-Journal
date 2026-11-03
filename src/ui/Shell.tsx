import { useCallback, useRef, useState, type ReactNode } from 'react';
import { IconButton } from './IconButton';
import { Popover } from './Popover';

type Props = { children: ReactNode; historyControls?: ReactNode };
export function Shell({ children, historyControls }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLButtonElement>(null);
  const closeInfo = useCallback(() => setShowInfo(false), []);
  return <div className="app-shell">
    <nav className="rail" aria-label="Journal navigation">
      <span className="brand-mark" aria-label="Terminal">t<span>›</span></span>
      <div className="rail-actions">
        <IconButton icon="search" label="Search — available in a later version" disabled />
        <IconButton icon="archive" label="Archives — available in a later version" disabled />
        <IconButton icon="plus" label="New entry — available in a later version" disabled />
      </div>
      <IconButton ref={infoRef} icon="settings" label="About this preview" className="rail-bottom" aria-expanded={showInfo} aria-controls="preview-info" onClick={() => setShowInfo(!showInfo)} />
    </nav>
    {showInfo && <Popover id="preview-info" title="An early chapter" onClose={closeInfo} triggerRef={infoRef}>
      <p>Terminal by Arlecchino</p><p>This preview introduces the workspace and basic writing. Your text stays in this window only and disappears when you close or reload it.</p>
      <p>Saving, archives, search, formatting controls, and preferences will arrive in later versions.</p>
    </Popover>}
    <div className="workspace">
      <header className="toolbar" aria-label="Writing tools">
        <div className="font-preview" aria-label="Current writing font: IBM Plex Sans, 16 pixels"><span>IBM Plex Sans</span><span className="font-size">16</span></div>
        <span className="toolbar-divider" aria-hidden="true" />
        <div className="format-preview" aria-label="Formatting controls are not yet available"><button disabled title="Formatting arrives in a later version" aria-label="Bold — not yet available"><b>B</b></button><button disabled aria-label="Italic — not yet available"><i>I</i></button><button disabled aria-label="Underline — not yet available"><u>U</u></button></div>
        <div className="history-controls">{historyControls}</div>
        <span className="save-status">Preview · not saved</span>
      </header>
      <main className="writing-surface" id="writing-workspace">{children}</main>
      <footer className="workspace-footer"><span>TERMINAL <span className="publisher">/ ARLECCHINO</span></span><span id="preview-warning">Temporary writing · closes without saving</span></footer>
    </div>
  </div>;
}

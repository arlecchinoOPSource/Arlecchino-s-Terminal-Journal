import { useEffect, useRef } from 'react';
import type { RestorePreview } from '../persistence/backup';

export type BackupStatus = { kind: 'idle' | 'working' | 'done' | 'error'; message?: string };
const date = (ms: number) => new Date(ms).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
const entries = (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`;

/** Export / Restore buttons for the Settings panel. */
export function BackupSection({ status, disabled, onExport, onRestore }: { status: BackupStatus; disabled: boolean; onExport: () => void; onRestore: () => void }) {
  const busy = disabled || status.kind === 'working';
  return <section className="settings-data" aria-label="Journal backup">
    <p className="settings-section">DATA</p>
    <div className="settings-data-actions">
      <button type="button" disabled={busy} onClick={onExport}>Export backup…</button>
      <button type="button" disabled={busy} onClick={onRestore}>Restore backup…</button>
    </div>
    <p className={status.kind === 'error' ? 'settings-status settings-error' : 'settings-status'} role={status.kind === 'error' ? 'alert' : 'status'}>
      {status.message ?? 'A backup is one file containing every entry, with formatting, dates and settings.'}
    </p>
  </section>;
}

/** Modal confirmation shown before a restore replaces the journal. Cancel is the default. */
export function RestoreDialog({ preview, onCancel, onConfirm }: { preview: RestorePreview | null; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (preview && !dialog.open) dialog.showModal();
    if (!preview && dialog.open) dialog.close();
  }, [preview]);
  return <dialog ref={ref} aria-labelledby="restore-title" aria-describedby="restore-body" onCancel={e => { e.preventDefault(); onCancel(); }}>
    <h2 id="restore-title">Replace your journal?</h2>
    {preview && <div id="restore-body">
      <p>The backup from <strong>{date(preview.exported_at)}</strong> contains {entries(preview.backup_entries)}.</p>
      <p>Restoring replaces all {entries(preview.current_entries)} currently in this journal, and your writing settings. A copy of the current journal is saved first.</p>
    </div>}
    <div className="dialog-actions">
      <button type="button" autoFocus onClick={onCancel}>Cancel</button>
      <button type="button" className="destructive" onClick={onConfirm}>Replace journal</button>
    </div>
  </dialog>;
}

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { JournalController } from '../domain/journal-controller';
import { repository } from '../persistence/repository';
import { Shell } from '../ui/Shell';
import { IconButton } from '../ui/IconButton';
import { ArchivePanel } from '../ui/ArchivePanel';
import { basicExtensions } from './extensions';
import { FormattingToolbar } from './FormattingToolbar';

export function WritingWorkspace() {
  const [controller] = useState(()=>new JournalController(repository));
  const state=useSyncExternalStore(controller.subscribe,controller.snapshot);
  const [lifecycleError,setLifecycleError]=useState<string|null>(null);
  const [closeBlocked,setCloseBlocked]=useState(false);
  useEffect(()=>{
    let disposed=false;
    let unlisten:(()=>void)|undefined;
    let closing=false;
    async function setup() {
      try {
        if(isTauri()) {
          unlisten=await listen('journal-close-requested',()=>{
            if(closing)return;closing=true;
            void controller.prepareClose().then(()=>invoke('journal_finish_exit')).catch(()=>{setCloseBlocked(true);setLifecycleError('Close cancelled: save failed. Your writing is still here. Retry saving before closing.');}).finally(()=>{closing=false;});
          });
          if(disposed){unlisten();return;}
        }
        if(!disposed)await controller.initialize();
      } catch {if(!disposed)setLifecycleError('Could not enable safe closing. Restart the app before writing.');}
    }
    void setup();
    return ()=>{disposed=true;unlisten?.();};
  },[controller]);
  return <EditorSession key={state.draft.id} controller={controller} lifecycleError={lifecycleError} closeBlocked={closeBlocked} clearLifecycleError={()=>{setLifecycleError(null);setCloseBlocked(false);}} />;
}

function EditorSession({controller,lifecycleError,closeBlocked,clearLifecycleError}:{controller:JournalController;lifecycleError:string|null;closeBlocked:boolean;clearLifecycleError:()=>void}) {
  const state=useSyncExternalStore(controller.subscribe,controller.snapshot);
  const dialog=useRef<HTMLDialogElement>(null);
  const editor=useEditor({
    extensions:basicExtensions(),content:state.draft.content,autofocus:'start',
    editable:state.ready&&!state.busy,
    editorProps:{attributes:{class:'journal-body',role:'textbox','aria-label':'Journal body','aria-multiline':'true','aria-describedby':'storage-status',spellcheck:'false',autocorrect:'off',autocapitalize:'off'}},
    onUpdate:({editor:current})=>controller.edit({content:current.getJSON()}),
  });
  // Toggling editability must not emit an update; otherwise opening or switching
  // an entry would autosave unchanged content and reorder the archive.
  useEffect(()=>{editor?.setEditable(state.ready&&!state.busy,false);},[editor,state.ready,state.busy]);
  const history=useEditorState({editor,selector:({editor:current})=>({canUndo:current?.can().undo()??false,canRedo:current?.can().redo()??false,isEmpty:current?.isEmpty??true})});
  const error=state.error??lifecycleError;
  async function retry(){clearLifecycleError();if(!state.ready)await controller.initialize();else await controller.flush().catch(()=>{});}
  return <Shell onNew={()=>void controller.switchTo(null)} navigationDisabled={!state.ready||state.busy}
    archive={state.ready?close=><ArchivePanel entries={state.entries} activeId={state.entry?.id??null} disabled={state.busy} onSelect={id=>{close();void controller.switchTo(id);}} />:undefined}
    status={<span id="storage-status" role="status" aria-live="polite">{state.status}</span>}
    formattingControls={<FormattingToolbar editor={editor} disabled={!state.ready||state.busy} />}
    historyControls={<><IconButton icon="undo" label="Undo" disabled={state.busy||!history?.canUndo} onClick={()=>editor?.chain().focus().undo().run()} /><IconButton icon="redo" label="Redo" disabled={state.busy||!history?.canRedo} onClick={()=>editor?.chain().focus().redo().run()} /></>}>
    <div className="writing-column">
      {error&&<div className="storage-error" role="alert"><p>{error}</p><button type="button" onClick={()=>void retry()} disabled={state.busy}>Retry {state.ready?'save':'opening storage'}</button>{closeBlocked&&<button type="button" className="destructive" onClick={()=>void invoke('journal_finish_exit')}>Close without saving</button>}</div>}
      <div className="entry-navigation">
        <button type="button" disabled={!state.entry||state.busy} onClick={()=>dialog.current?.showModal()}>Delete entry</button>
      </div>
      <p className="entry-meta"><span className="entry-label">ENTRY</span><span className="draft-label">{state.entry?`#${state.entry.entry_number}`:'DRAFT'}</span></p>
      <input className="entry-title" aria-label="Entry title" aria-describedby="storage-status" placeholder="Untitled" value={state.draft.title} disabled={!state.ready||state.busy} spellCheck={false} autoComplete="off" autoCorrect="off" onChange={e=>controller.edit({title:e.target.value})} />
      <div className="editor-wrap">{history?.isEmpty&&<span className="editor-placeholder" aria-hidden="true">Start writing…</span>}<EditorContent editor={editor}/></div>
    </div>
    <dialog ref={dialog} aria-labelledby="delete-title"><h2 id="delete-title">Delete this entry?</h2><p>This removes the entry from this device. This cannot be undone.</p><form method="dialog"><button autoFocus>Cancel</button><button className="destructive" onClick={()=>void controller.remove()}>Delete entry</button></form></dialog>
  </Shell>;
}

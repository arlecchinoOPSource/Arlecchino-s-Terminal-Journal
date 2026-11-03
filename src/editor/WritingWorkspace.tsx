import { useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { createDraft } from '../domain/draft';
import { Shell } from '../ui/Shell';
import { IconButton } from '../ui/IconButton';
import { basicExtensions } from './extensions';

export function WritingWorkspace() {
  const [draft, setDraft] = useState(createDraft);
  const editor = useEditor({
    extensions: basicExtensions(),
    content: draft.content,
    autofocus: 'start',
    editorProps: {
      attributes: {
        class: 'journal-body',
        role: 'textbox',
        'aria-label': 'Journal body',
        'aria-multiline': 'true',
        'aria-describedby': 'preview-warning',
        spellcheck: 'false',
        autocorrect: 'off',
        autocapitalize: 'off',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      // Capture the structured document without logging or persisting writing.
      setDraft(current => ({ ...current, content: currentEditor.getJSON() }));
    },
  });
  const history = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      canUndo: currentEditor?.can().undo() ?? false,
      canRedo: currentEditor?.can().redo() ?? false,
      isEmpty: currentEditor?.isEmpty ?? true,
    }),
  });
  return <Shell historyControls={<>
    <IconButton icon="undo" label="Undo" disabled={!history?.canUndo} onClick={() => editor?.chain().focus().undo().run()} />
    <IconButton icon="redo" label="Redo" disabled={!history?.canRedo} onClick={() => editor?.chain().focus().redo().run()} />
  </>}>
    <div className="writing-column">
      <p className="entry-meta">journal entry # — <span className="draft-label">draft</span></p>
      <input className="entry-title" aria-label="Entry title" aria-describedby="preview-warning" placeholder="Untitled" value={draft.title} spellCheck={false} autoComplete="off" autoCorrect="off" onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} />
      <div className="editor-wrap">
        {history?.isEmpty && <span className="editor-placeholder" aria-hidden="true">A little space for your thoughts.</span>}
        <EditorContent editor={editor} />
      </div>
    </div>
  </Shell>;
}

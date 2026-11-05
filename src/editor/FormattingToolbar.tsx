import type { ReactNode } from 'react';
import { useEditorState, type Editor } from '@tiptap/react';
import { IconButton } from '../ui/IconButton';
import { ALIGNMENTS, FONT_FAMILIES, FONT_SIZES, HEADING_LEVELS, type Alignment } from './extensions';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? '⌘' : 'Ctrl+';
const shift = isMac ? '⇧' : 'Shift+';
const alt = isMac ? '⌥' : 'Alt+';

type Props = { editor: Editor | null; disabled: boolean; titleStyle?: Record<string, unknown>; onTitleStyleChange: (patch:Record<string,unknown>)=>void };

/** Toolbar state is read from the editor selection, so it follows clicks, keys and shortcuts. */
export function FormattingToolbar({ editor, disabled, titleStyle, onTitleStyleChange }: Props) {
  const bodyActive = useEditorState({ editor, selector: ({ editor: e }) => {
    if (!e) return null;
    const style = e.getAttributes('textStyle');
    const level = HEADING_LEVELS.find(l => e.isActive('heading', { level: l }));
    return {
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), strike: e.isActive('strike'),
      bulletList: e.isActive('bulletList'), orderedList: e.isActive('orderedList'), blockquote: e.isActive('blockquote'),
      block: level ? String(level) : 'paragraph',
      canHeading: e.can().setHeading({ level: 1 }),
      align: (ALIGNMENTS.find(a => e.isActive({ textAlign: a })) ?? 'left') as Alignment,
      fontFamily: typeof style.fontFamily === 'string' ? style.fontFamily : '',
      fontSize: typeof style.fontSize === 'string' ? style.fontSize : '',
      inTable: e.isActive('table'),
      canDeleteRow: e.can().deleteRow(), canDeleteColumn: e.can().deleteColumn(),
    };
  } });
  const active = titleStyle ? {...bodyActive, bold:!!titleStyle.titleBold,italic:!!titleStyle.titleItalic,underline:!!titleStyle.titleUnderline,strike:!!titleStyle.titleStrike,fontFamily:String(titleStyle.titleFontFamily??''),fontSize:String(titleStyle.titleFontSize??''),align:String(titleStyle.titleAlign??'left') as Alignment,canHeading:false,block:'paragraph',bulletList:false,orderedList:false,blockquote:false,inTable:false,canDeleteRow:false,canDeleteColumn:false} : bodyActive;
  const change=(key:string,value:unknown,body:()=>unknown)=>titleStyle?onTitleStyleChange({[key]:value}):body();
  const off = disabled || !editor || !active;
  const run = () => editor!.chain().focus();
  return <>
    <Group label="Font">
      <label className="tool-field"><span>FONT</span>
        <select aria-label="Font family" disabled={off} value={active?.fontFamily ?? ''} onChange={e => change('titleFontFamily',e.target.value||null,()=>run().setJournalFontFamily(e.target.value || null).run())}>
          {FONT_FAMILIES.map(f => <option key={f.label} value={f.value ?? ''}>{f.label}</option>)}
        </select>
      </label>
      <label className="tool-field"><span>SIZE</span>
        <select aria-label="Font size" disabled={off} value={active?.fontSize ?? ''} onChange={e => change('titleFontSize',e.target.value||null,()=>run().setJournalFontSize(e.target.value || null).run())}>
          <option value="">Default</option>
          {FONT_SIZES.map(size => <option key={size} value={size}>{size.replace('px', '')}</option>)}
        </select>
      </label>
    </Group>
    <Group label="Text formatting">
      <Toggle label="Bold" shortcut={`${mod}B`} pressed={active?.bold} disabled={off} onClick={() => change('titleBold',!active?.bold,()=>run().toggleBold().run())}><b>B</b></Toggle>
      <Toggle label="Italic" shortcut={`${mod}I`} pressed={active?.italic} disabled={off} onClick={() => change('titleItalic',!active?.italic,()=>run().toggleItalic().run())}><i>I</i></Toggle>
      <Toggle label="Underline" shortcut={`${mod}U`} pressed={active?.underline} disabled={off} onClick={() => change('titleUnderline',!active?.underline,()=>run().toggleUnderline().run())}><u>U</u></Toggle>
      <Toggle label="Strikethrough" shortcut={`${mod}${shift}S`} pressed={active?.strike} disabled={off} onClick={() => change('titleStrike',!active?.strike,()=>run().toggleStrike().run())}><s>S</s></Toggle>
    </Group>
    <Group label="Paragraph formatting">
      <label className="tool-field"><span className="visually-hidden">Paragraph style</span>
        <select aria-label="Paragraph style" title={`Paragraph style (headings: ${mod}${alt}1–3)`} disabled={off || (!active?.canHeading && active?.block === 'paragraph')} value={active?.block ?? 'paragraph'}
          onChange={e => e.target.value === 'paragraph' ? run().setParagraph().run() : run().setHeading({ level: Number(e.target.value) as 1 | 2 | 3 }).run()}>
          <option value="paragraph">Body</option>
          {HEADING_LEVELS.map(l => <option key={l} value={l}>Heading {l}</option>)}
        </select>
      </label>
      <IconToggle icon="bulletList" label="Bulleted list" shortcut={`${mod}${shift}8`} pressed={active?.bulletList} disabled={off || !!titleStyle} onClick={() => run().toggleBulletList().run()} />
      <IconToggle icon="orderedList" label="Numbered list" shortcut={`${mod}${shift}7`} pressed={active?.orderedList} disabled={off || !!titleStyle} onClick={() => run().toggleOrderedList().run()} />
      <IconToggle icon="quote" label="Blockquote" shortcut={`${mod}${shift}B`} pressed={active?.blockquote} disabled={off || !!titleStyle} onClick={() => run().toggleBlockquote().run()} />
    </Group>
    <Group label="Alignment">
      {ALIGNMENTS.map(a => <IconToggle key={a} icon={`align-${a}`} label={`Align ${a}`} shortcut={`${mod}${shift}${{ left: 'L', center: 'E', right: 'R' }[a]}`} pressed={active?.align === a} disabled={off} onClick={() => change('titleAlign',a,()=>run().setTextAlign(a).run())} />)}
    </Group>
    <Group label="Table">
      {!active?.inTable
        ? <IconButton icon="table" label="Insert table (3 × 3 with header row)" disabled={off || !!titleStyle} onClick={() => run().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
        : <>
          <TextTool label="Add row below" disabled={off} onClick={() => run().addRowAfter().run()}>+ROW</TextTool>
          <TextTool label="Delete row" disabled={off || !active.canDeleteRow} onClick={() => run().deleteRow().run()}>−ROW</TextTool>
          <TextTool label="Add column right" disabled={off} onClick={() => run().addColumnAfter().run()}>+COL</TextTool>
          <TextTool label="Delete column" disabled={off || !active.canDeleteColumn} onClick={() => run().deleteColumn().run()}>−COL</TextTool>
          <TextTool label="Delete table" disabled={off} onClick={() => run().deleteTable().run()}>DEL</TextTool>
        </>}
    </Group>
  </>;
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return <div className="tool-group" role="group" aria-label={label}>{children}</div>;
}
type ToggleProps = { label: string; shortcut?: string; pressed?: boolean; disabled: boolean; onClick: () => void };
// Keep editor focus and selection while pressing a tool with the pointer.
const keepSelection = (e: { preventDefault: () => void }) => e.preventDefault();
function Toggle({ label, shortcut, pressed, disabled, onClick, children }: ToggleProps & { children: ReactNode }) {
  return <button type="button" className="tool-button" aria-label={label} title={shortcut ? `${label} (${shortcut})` : label} aria-pressed={pressed ?? false} disabled={disabled} onMouseDown={keepSelection} onClick={onClick}>{children}</button>;
}
function IconToggle({ icon, ...props }: ToggleProps & { icon: Parameters<typeof IconButton>[0]['icon'] }) {
  return <IconButton icon={icon} label={props.label} title={props.shortcut ? `${props.label} (${props.shortcut})` : props.label} aria-pressed={props.pressed ?? false} disabled={props.disabled} onMouseDown={keepSelection} onClick={props.onClick} className="tool-button" />;
}
function TextTool({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" className="tool-button tool-text" aria-label={label} title={label} disabled={disabled} onMouseDown={keepSelection} onClick={onClick}>{children}</button>;
}

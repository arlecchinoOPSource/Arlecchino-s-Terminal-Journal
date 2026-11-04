import { Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { TableKit } from '@tiptap/extension-table';

// Font choices are limited to locally bundled faces. Values are stored verbatim
// in entry JSON, so the native validator in src-tauri/src/journal.rs must list
// exactly the same strings.
export const FONT_FAMILIES = [
  { label: 'Default', value: null },
  { label: 'Plex Serif', value: "'IBM Plex Serif', serif" },
  { label: 'Literata', value: "'Literata', serif" },
  { label: 'Plex Mono', value: "'IBM Plex Mono', monospace" },
  { label: 'Plex Condensed', value: "'IBM Plex Sans Condensed', sans-serif" },
] as const;
export const FONT_SIZES = ['12px', '14px', '16px', '17px', '18px', '20px', '24px', '28px', '32px'] as const;
export const HEADING_LEVELS = [1, 2, 3] as const;
export const ALIGNMENTS = ['left', 'center', 'right'] as const;
export type Alignment = (typeof ALIGNMENTS)[number];

const allowedFamily = (value: string | null | undefined) => FONT_FAMILIES.find(f => f.value !== null && normalize(f.value) === normalize(value ?? ''))?.value ?? null;
const allowedSize = (value: string | null | undefined) => FONT_SIZES.find(size => size === value?.trim()) ?? null;
const normalize = (value: string) => value.replace(/["']/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    journalFont: {
      setJournalFontFamily: (family: string | null) => ReturnType;
      setJournalFontSize: (size: string | null) => ReturnType;
    };
  }
}

/**
 * Font family and size as textStyle attributes. Unlike the stock FontFamily and
 * FontSize extensions, pasted styles outside the bundled list are discarded so a
 * paste can never produce a document the native store refuses to save.
 */
const JournalFont = Extension.create({
  name: 'journalFont',
  addGlobalAttributes() {
    return [{ types: ['textStyle'], attributes: {
      fontFamily: { default: null, parseHTML: el => allowedFamily(el.style.fontFamily), renderHTML: attrs => attrs.fontFamily ? { style: `font-family: ${attrs.fontFamily}` } : {} },
      fontSize: { default: null, parseHTML: el => allowedSize(el.style.fontSize), renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {} },
    } }];
  },
  addCommands() {
    return {
      setJournalFontFamily: family => ({ chain }) => chain().setMark('textStyle', { fontFamily: allowedFamily(family) }).removeEmptyTextStyle().run(),
      setJournalFontSize: size => ({ chain }) => chain().setMark('textStyle', { fontSize: allowedSize(size) }).removeEmptyTextStyle().run(),
    };
  },
});

// Remote media, links and code remain excluded from the journal schema.
export function basicExtensions() {
  return [
    StarterKit.configure({
      code: false,
      codeBlock: false,
      heading: { levels: [...HEADING_LEVELS] },
      horizontalRule: false,
      link: false,
      trailingNode: false,
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'], alignments: [...ALIGNMENTS] }),
    TextStyle,
    JournalFont,
    TableKit.configure({ table: { resizable: false, allowTableNodeSelection: false } }),
  ];
}

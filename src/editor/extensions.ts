import StarterKit from '@tiptap/starter-kit';

// Keep the basic writing schema small. Rich clipboard text may retain these
// inline marks; headings, lists, tables and their controls belong to T-09/T-10.
export function basicExtensions() {
  return [StarterKit.configure({
    blockquote: false,
    bulletList: false,
    code: false,
    codeBlock: false,
    heading: false,
    horizontalRule: false,
    link: false,
    listItem: false,
    listKeymap: false,
    orderedList: false,
    trailingNode: false,
  })];
}

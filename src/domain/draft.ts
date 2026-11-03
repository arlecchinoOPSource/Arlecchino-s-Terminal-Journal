import type { JSONContent } from '@tiptap/react';

/** An in-memory draft, not a persisted entry. No ID/number is allocated yet. */
export interface DraftDocument {
  schema_version: 1;
  title: string;
  content: JSONContent;
}

export function createDraft(): DraftDocument {
  return { schema_version: 1, title: '', content: { type: 'doc', content: [{ type: 'paragraph' }] } };
}

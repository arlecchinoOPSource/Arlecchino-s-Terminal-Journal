import type { ReactNode } from 'react';

export type IconName = 'search' | 'archive' | 'plus' | 'settings' | 'undo' | 'redo' | 'close' | 'bulletList' | 'orderedList' | 'quote' | 'align-left' | 'align-center' | 'align-right' | 'table' | 'export' | 'trash' | 'themes' | 'sounds' | 'play';
const paths: Record<IconName, ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  archive: <><path d="M4 8h16v13H4zM3 3h18v5H3zM9 12h6" /></>,
  plus: <path d="M12 4v16M4 12h16" />,
  settings: <><path d="M4 6h16M4 12h16M4 18h16" /><path d="M8 3v6M16 9v6M10 15v6" /></>,
  undo: <path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14" />,
  redo: <path d="m16 4 5 5-5 5M21 9H10a7 7 0 0 0 0 14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  bulletList: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h1M4 12h1M4 18h1" strokeWidth="2.5" /></>,
  orderedList: <><path d="M10 6h10M10 12h10M10 18h10" /><path d="M4 4.5 5.5 4v4M4 10.5h2.5L4 14h2.5M4 16.5h2.5l-1.25 1.5 1.25 1.5H4" strokeWidth="1.2" /></>,
  quote: <path d="M5 5v14M10 8h9M10 12h9M10 16h6" />,
  'align-left': <path d="M4 6h16M4 10h10M4 14h16M4 18h10" />,
  'align-center': <path d="M4 6h16M7 10h10M4 14h16M7 18h10" />,
  'align-right': <path d="M4 6h16M10 10h10M4 14h16M10 18h10" />,
  table: <path d="M4 5h16v14H4zM4 10h16M4 14.5h16M9.5 5v14M14.5 5v14" />,
  export: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14" />,
  // A monitor showing a half-lit disc: the screen's colour can change.
  themes: <><path d="M3 4h18v12H3zM9 20h6M12 16v4" /><circle cx="12" cy="10" r="3.5" /><path d="M12 6.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" /></>,
  // A speaker with two waves.
  sounds: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" />,
};
export function Icon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

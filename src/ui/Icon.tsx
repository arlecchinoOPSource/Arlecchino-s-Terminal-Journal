import type { ReactNode } from 'react';

export type IconName = 'search' | 'archive' | 'plus' | 'settings' | 'undo' | 'redo' | 'close';
const paths: Record<IconName, ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  archive: <><path d="M4 8h16v13H4zM3 3h18v5H3zM9 12h6" /></>,
  plus: <path d="M12 4v16M4 12h16" />,
  settings: <><path d="M4 6h16M4 12h16M4 18h16" /><path d="M8 3v6M16 9v6M10 15v6" /></>,
  undo: <path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14" />,
  redo: <path d="m16 4 5 5-5 5M21 9H10a7 7 0 0 0 0 14" />,
  close: <path d="m6 6 12 12M6 18 12-12" />,
};
export function Icon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

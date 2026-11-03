import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { IconButton } from './IconButton';

type Props = { id: string; title: string; onClose: () => void; triggerRef: RefObject<HTMLButtonElement | null>; children: ReactNode };
export function Popover({ id, title, onClose, triggerRef, children }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    panelRef.current?.focus();
    function dismiss(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); triggerRef.current?.focus(); }
    }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target) && !triggerRef.current?.contains(event.target)) onClose();
    }
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', dismiss); document.removeEventListener('pointerdown', outside); };
  }, [onClose, triggerRef]);
  return <section id={id} ref={panelRef} className="popover" role="dialog" aria-labelledby={`${id}-title`} tabIndex={-1}>
    <header><h2 id={`${id}-title`}>{title}</h2><IconButton icon="close" label="Close preview information" onClick={() => { onClose(); triggerRef.current?.focus(); }} /></header>
    {children}
  </section>;
}

import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { IconButton } from './IconButton';

type Props = { id: string; title: string; onClose: () => void; triggerRef: RefObject<HTMLButtonElement | null>; children: ReactNode; className?: string; closeLabel?: string };
export function Popover({ id, title, onClose, triggerRef, children, className = '', closeLabel = 'Close' }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    // Content may focus its own first control (e.g. the open archive row).
    if (!panelRef.current?.contains(document.activeElement)) panelRef.current?.focus();
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
  return <section id={id} ref={panelRef} className={`popover ${className}`} role="dialog" aria-labelledby={`${id}-title`} tabIndex={-1}>
    <header><h2 id={`${id}-title`}>{title}</h2><IconButton icon="close" label={closeLabel} onClick={() => { onClose(); triggerRef.current?.focus(); }} /></header>
    {children}
  </section>;
}

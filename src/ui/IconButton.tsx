import type { ComponentPropsWithRef } from 'react';
import { Icon, type IconName } from './Icon';

/** `caption` adds a short visible label under the icon; the accessible name stays `label`. */
type Props = ComponentPropsWithRef<'button'> & { label: string; icon: IconName; caption?: string };
export function IconButton({ label, icon, caption, className = '', ...props }: Props) {
  return <button type="button" className={`icon-button ${caption ? 'has-caption ' : ''}${className}`} aria-label={label} title={label} {...props}><Icon name={icon} />{caption && <span className="icon-caption" aria-hidden="true">{caption}</span>}</button>;
}

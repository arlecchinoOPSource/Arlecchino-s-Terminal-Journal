import { isClickRegion, type ClickRegion } from '../domain/sound';

/**
 * The click region for an interaction, or null. Clicks count on enabled buttons and
 * options; changes count on selects, radios and checkboxes (range sliders stay silent).
 * The nearest data-sound attribute names the region; "none" opts out.
 */
export function clickRegion(target: Element, kind: 'click' | 'change'): ClickRegion | null {
  const control = kind === 'click'
    ? target.closest('button:not(:disabled), [role="option"]:not([aria-disabled="true"])')
    : target.closest('select, input[type="radio"], input[type="checkbox"]');
  if (!control) return null;
  const region = control.closest('[data-sound]')?.getAttribute('data-sound');
  return isClickRegion(region) ? region : null;
}

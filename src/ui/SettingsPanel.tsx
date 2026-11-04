import { useEffect, useId, useState, type ReactNode } from 'react';
import { isMacPlatform, SHORTCUT_HELP, shortcutLabel } from '../domain/shortcuts';
import { DEFAULT_MOTION, MOTION_LEVELS, type MotionLevel } from '../domain/motion';
import { applyMotion, motionRepository } from '../persistence/localSettings';
import { DEFAULT_PREFERENCES, FONT_SIZE_RANGE, LINE_SPACINGS, WRITING_FONTS, WRITING_WIDTHS, type Preferences, type WritingFont } from '../domain/preferences';

type Props = { preferences: Preferences; error: string | null; onChange: (patch: Partial<Preferences>) => void; data?: ReactNode; children?: ReactNode };
const sizes = Array.from({ length: FONT_SIZE_RANGE.max - FONT_SIZE_RANGE.min + 1 }, (_, i) => FONT_SIZE_RANGE.min + i);

/** Editor preferences. Every change applies at once and is saved on this device. */
export function SettingsPanel({ preferences, error, onChange, data, children }: Props) {
  const id = useId();
  const mac = isMacPlatform();
  const isDefault = (Object.keys(DEFAULT_PREFERENCES) as (keyof Preferences)[]).every(k => preferences[k] === DEFAULT_PREFERENCES[k]);
  return <div className="settings">
    <p className="settings-section">WRITING</p>
    <label className="settings-row" htmlFor={`${id}-font`}><span>Font</span>
      <select id={`${id}-font`} value={preferences.font} onChange={e => onChange({ font: e.target.value as WritingFont })}>
        {WRITING_FONTS.map(f => <option key={f.id} value={f.id}>{f.label}{f.id === DEFAULT_PREFERENCES.font ? ' (default)' : ''}</option>)}
      </select>
    </label>
    <label className="settings-row" htmlFor={`${id}-size`}><span>Text size</span>
      <select id={`${id}-size`} value={preferences.font_size} onChange={e => onChange({ font_size: Number(e.target.value) })}>
        {sizes.map(s => <option key={s} value={s}>{s} px{s === DEFAULT_PREFERENCES.font_size ? ' (default)' : ''}</option>)}
      </select>
    </label>
    <Segmented legend="Writing width" name={`${id}-width`} options={WRITING_WIDTHS} value={preferences.writing_width} defaultValue={DEFAULT_PREFERENCES.writing_width} onChange={writing_width => onChange({ writing_width })} />
    <Segmented legend="Line spacing" name={`${id}-spacing`} options={LINE_SPACINGS} value={preferences.line_spacing} defaultValue={DEFAULT_PREFERENCES.line_spacing} onChange={line_spacing => onChange({ line_spacing })} />
    <div className="settings-actions">
      <button type="button" className="settings-reset" disabled={isDefault} onClick={() => onChange({ ...DEFAULT_PREFERENCES })}>Reset to defaults</button>
    </div>
    <p className={error ? 'settings-status settings-error' : 'settings-status'} role={error ? 'alert' : 'status'}>{error ?? 'Changes apply immediately and are saved on this device.'}</p>
    <MotionSetting name={`${id}-motion`} />
    <div data-sound="text-edit">{data}</div>
    <section className="settings-keys" aria-labelledby={`${id}-keys`}>
      <p id={`${id}-keys`} className="settings-section">KEYBOARD</p>
      <dl>{SHORTCUT_HELP.map(s => <div key={s.label}><dt>{s.label}</dt><dd>{s.keys.map(k => shortcutLabel(k, mac)).join(' / ')}</dd></div>)}</dl>
    </section>
    {children}
  </div>;
}

const osReducedQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');

/** Interface animation level, stored on this device beside the theme (not a journal preference). */
function MotionSetting({ name }: { name: string }) {
  const [motion, setMotion] = useState<MotionLevel>(() => motionRepository.load());
  const [osReduced, setOsReduced] = useState(() => osReducedQuery().matches);
  useEffect(() => {
    const query = osReducedQuery();
    const follow = () => setOsReduced(query.matches);
    query.addEventListener('change', follow);
    return () => query.removeEventListener('change', follow);
  }, []);
  const choose = (next: MotionLevel) => { applyMotion(next); motionRepository.save(next); setMotion(next); };
  return <section className="settings-motion" aria-label="Motion">
    <p className="settings-section">INTERFACE</p>
    <Segmented legend="Motion" name={name} options={MOTION_LEVELS} value={motion} defaultValue={DEFAULT_MOTION} onChange={choose} />
    <p className="settings-status">{osReduced ? 'Your system asks for reduced motion, so interface animations stay off.' : 'Reduced keeps colour fades only. Writing is never animated.'}</p>
  </section>;
}

type Option<T> = { readonly value: T; readonly label: string };
function Segmented<T extends string | number>({ legend, name, options, value, defaultValue, onChange }: { legend: string; name: string; options: readonly Option<T>[]; value: T; defaultValue: T; onChange: (value: T) => void }) {
  return <fieldset className="settings-segmented">
    <legend>{legend} <span>default: {options.find(o => o.value === defaultValue)?.label}</span></legend>
    <div>{options.map(o => <label key={o.value} className={o.value === value ? 'selected' : ''}>
      <input type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} />
      <span>{o.label}</span>
    </label>)}</div>
  </fieldset>;
}

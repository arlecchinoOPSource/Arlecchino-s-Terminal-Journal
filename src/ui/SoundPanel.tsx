import { useId } from 'react';
import { KEYBOARD_PACKS, SOUND_EVENTS, type KeyboardPack, type SoundEvent, type SoundSettings } from '../domain/sound';
import { Icon } from './Icon';

type Props = { settings: SoundSettings; onChange: (patch: Partial<SoundSettings>) => void; onPreview: (target: SoundEvent | Exclude<KeyboardPack, 'silent'>) => void };

/** Sound choices (T-25–T-27). Every change applies and is saved at once; ▶ previews a sound even while it is off. */
export function SoundPanel({ settings, onChange, onPreview }: Props) {
  const id = useId();
  const preview = (target: SoundEvent | Exclude<KeyboardPack, 'silent'>, label: string) =>
    <button type="button" className="sound-preview" data-sound="none" aria-label={`Preview ${label}`} title={`Preview ${label}`} onClick={() => onPreview(target)}><Icon name="play" /></button>;
  return <div className={settings.enabled ? 'sound-panel' : 'sound-panel sound-off'}>
    <div className="sound-master">
      <label className="sound-switch">
        <input type="checkbox" role="switch" checked={settings.enabled} onChange={e => onChange({ enabled: e.target.checked })} />
        <span className="sound-switch-track" aria-hidden="true"><span /></span>
        <span>Sound</span><span className="sound-state" aria-hidden="true">{settings.enabled ? 'ON' : 'OFF'}</span>
      </label>
      <Volume label="Master volume" value={settings.volume} onChange={volume => onChange({ volume })} />
    </div>

    <p className="settings-section sound-section" id={`${id}-keys`}>KEYBOARD</p>
    <div className="sound-list" role="radiogroup" aria-labelledby={`${id}-keys`}>
      {KEYBOARD_PACKS.map(pack => <div key={pack.id} className={pack.id === settings.keyboard ? 'sound-row selected' : 'sound-row'}>
        <label data-sound="none">
          <input type="radio" name={`${id}-pack`} value={pack.id} checked={pack.id === settings.keyboard}
            onChange={() => { onChange({ keyboard: pack.id }); if (pack.id !== 'silent') onPreview(pack.id); }} />
          <span className="sound-check sound-radio" aria-hidden="true" />
          <span className="sound-name"><span>{pack.label}</span><span className="sound-description">{pack.description}</span></span>
        </label>
        {pack.id !== 'silent' && preview(pack.id, `${pack.label} keyboard`)}
      </div>)}
    </div>
    <Volume label="Typing volume" value={settings.keyboardVolume} onChange={keyboardVolume => onChange({ keyboardVolume })} />

    <p className="settings-section sound-section" id={`${id}-ui`}>INTERFACE</p>
    <div className="sound-list" role="group" aria-labelledby={`${id}-ui`}>
      {SOUND_EVENTS.map(event => <div key={event.id} className="sound-row">
        <label>
          <input type="checkbox" checked={settings[event.id]} onChange={e => onChange({ [event.id]: e.target.checked })} />
          <span className="sound-check" aria-hidden="true" />
          <span className="sound-name"><span>{event.label}</span><span className="sound-description">{event.description}</span></span>
        </label>
        {preview(event.id, `${event.label} sound`)}
      </div>)}
    </div>
    <Volume label="Interface volume" value={settings.interfaceVolume} onChange={interfaceVolume => onChange({ interfaceVolume })} />

    <p className="sound-note">{settings.enabled ? 'Sounds play from files inside Terminal. ' : 'Sound is off. Switch it on to hear typing and interface sounds. '}Typing sounds only know whether a key was a letter, space, return or delete; what you type is never recorded.</p>
  </div>;
}

function Volume({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const id = useId();
  return <div className="sound-volume">
    <label htmlFor={id}>{label}</label>
    <input id={id} type="range" min={0} max={100} step={5} value={value} onChange={e => onChange(Number(e.target.value))} aria-valuetext={`${value}%`} />
    <output htmlFor={id}>{value}%</output>
  </div>;
}

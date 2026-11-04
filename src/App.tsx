import { useCallback, useState } from 'react';
import { WritingWorkspace } from './editor/WritingWorkspace';
import { StartupScreen } from './ui/StartupScreen';
import { motionRepository, startupRepository } from './persistence/localSettings';
import { effectiveMotion } from './domain/motion';
import type { Readiness } from './domain/startup';
import './styles/tokens.css';
import './styles/app.css';

// Decided once per launch, before the first render.
const showStartup = startupRepository.load() === 'on';
const animatedStartup = effectiveMotion(motionRepository.load(), typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) === 'full';

export function App() {
  const [readiness, setReadiness] = useState<Readiness>('starting');
  const [startup, setStartup] = useState(showStartup);
  const done = useCallback(() => setStartup(false), []);
  return <>
    <WritingWorkspace onReadiness={setReadiness} />
    {startup && <StartupScreen readiness={readiness} animated={animatedStartup} onDone={done} />}
  </>;
}

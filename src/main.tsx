import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyMotion, applyTheme, motionRepository, soundRepository, themeRepository } from './persistence/localSettings';
import { sounds } from './audio/sounds';

const root = document.getElementById('root');
if (!root) throw new Error('Application root is missing');
// Before the first render, so the interface never appears in the wrong theme or motion level.
applyTheme(themeRepository.load());
applyMotion(motionRepository.load());
// Settings only: no audio is loaded or started until a sound is first played.
sounds.configure(soundRepository.load());
createRoot(root).render(<StrictMode><App /></StrictMode>);

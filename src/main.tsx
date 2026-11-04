import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyTheme, themeRepository } from './persistence/theme';

const root = document.getElementById('root');
if (!root) throw new Error('Application root is missing');
// Before the first render, so the interface never appears in the wrong theme.
applyTheme(themeRepository.load());
createRoot(root).render(<StrictMode><App /></StrictMode>);

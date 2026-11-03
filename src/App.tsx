import { Shell } from './ui/Shell';
import './styles/tokens.css';
import './styles/app.css';

export function App() {
  return <Shell><div className="writing-column"><p className="entry-meta">journal entry # —</p><h1 className="entry-title">Untitled</h1><p className="empty-prompt">A little space for your thoughts.</p></div></Shell>;
}

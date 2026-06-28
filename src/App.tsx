import { useEffect, useState } from 'react';
import ModeSelector from './components/ModeSelector';
import SdsApp from './modes/sds/SdsApp';
import HazmatApp from './modes/hazmat/HazmatApp';

export type AppMode = 'sds' | 'hazmat';

export default function App() {
  const [mode, setMode] = useState<AppMode | null>(null);

  // Drive print stylesheet selection (see index.css @media print rules) and
  // set page orientation: SDS placards are A4 portrait, HazMat is A4 landscape.
  useEffect(() => {
    if (mode) document.body.setAttribute('data-mode', mode);
    else document.body.removeAttribute('data-mode');

    const id = 'page-orientation-style';
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    const size = mode === 'hazmat' ? 'A4 landscape' : 'A4';
    el.textContent = `@page { size: ${size}; margin: 0; }`;
  }, [mode]);

  if (!mode) return <ModeSelector onSelect={setMode} />;
  if (mode === 'sds') return <SdsApp onBack={() => setMode(null)} />;
  return <HazmatApp onBack={() => setMode(null)} />;
}

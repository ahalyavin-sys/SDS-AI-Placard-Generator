import { useEffect, useRef, useState } from 'react';
import AiSettingsPanel from '../../components/AiSettingsPanel';
import { runAi } from '../../lib/ai';
import { useAiSettings } from '../../lib/useAiSettings';
import HazmatPlacard, { type HazmatState } from './HazmatPlacard';
import { CLASS_DESCRIPTIONS, type UnRecord } from './hazmatData';

interface Props { onBack: () => void; }

const INITIAL: HazmatState = {
  titles: { en: 'Used Oil', ru: 'Отработанное масло', he: 'שמן משומש', ar: 'زيت مستعمل' },
  unNumber: '3082',
  unNumberDesc: 'Environmentally hazardous substance, n.o.s.',
  unClass: '9',
  emergCode: '3Z',
  pictograms: 'Environment',
  descriptions: {
    en: 'Environmentally hazardous substance',
    ru: 'Вещество, опасное для окружающей среды',
    he: 'חומר מסוכן לסביבה',
    ar: 'مادة خطرة بيئيا',
  },
};

function descsForClass(unClass: string): HazmatState['descriptions'] | null {
  const match = unClass ? unClass.toString().match(/\d/) : null;
  const d = match ? CLASS_DESCRIPTIONS[match[0]] : null;
  return d ? { en: d.en, ru: d.ru, he: d.he, ar: d.ar } : null;
}

export default function HazmatApp({ onBack }: Props) {
  const ai = useAiSettings('hm');
  const [state, setState] = useState<HazmatState>(INITIAL);
  const [autoTitle, setAutoTitle] = useState('Used Oil');
  const [titleStatus, setTitleStatus] = useState<{ kind: 'info' | 'ok' | 'err'; text: string } | null>(null);

  const unDbRef = useRef<Record<string, UnRecord> | null>(null);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the offline UN-number database once.
  useEffect(() => {
    fetch('/un_numbers.json')
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => { unDbRef.current = data || {}; })
      .catch(() => { unDbRef.current = {}; });
  }, []);

  const patch = (p: Partial<HazmatState>) => setState((s) => ({ ...s, ...p }));

  function applyUnRecord(rec: UnRecord) {
    setState((s) => {
      const next = { ...s };
      if (rec.desc) next.unNumberDesc = rec.desc;
      if (rec.eac) next.emergCode = rec.eac;
      if (rec.pictograms !== undefined) next.pictograms = rec.pictograms;
      if (rec.class) {
        next.unClass = rec.class;
        const d = descsForClass(rec.class);
        if (d) next.descriptions = d;
      }
      return next;
    });
  }

  async function lookupFromAi(unNum: string) {
    const schema = {
      type: 'OBJECT',
      properties: { class: { type: 'STRING' }, eac: { type: 'STRING' }, desc: { type: 'STRING' }, pictograms: { type: 'STRING' } },
    };
    const prompt = `Find the standard UN Class (including sub-risks, e.g. '8 (6.1)'), Emergency Action Code (EAC), Proper Shipping Name, and GHS Pictograms (standard names like 'Flammable, Toxic, Environment') for UN Number ${unNum}. Return JSON with keys: "class", "eac", "desc", "pictograms" (comma separated). If unknown return empty strings.`;
    try {
      const rec: UnRecord = await runAi({ provider: ai.provider, model: ai.model, apiKey: ai.apiKey, prompt, schema });
      if (rec.class || rec.desc) applyUnRecord(rec);
      else patch({ unNumberDesc: `Details not found for ${unNum}` });
    } catch (e: any) {
      patch({ unNumberDesc: e.message?.includes('API key') ? 'Enter API key in AI Settings for auto-lookup' : `Lookup failed: ${e.message}` });
    }
  }

  function onUnNumberChange(raw: string) {
    const unNum = raw.trim().replace(/^UN\s*/i, '');
    patch({ unNumber: unNum });
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    if (!/^\d{4}$/.test(unNum)) { patch({ unNumberDesc: '' }); return; }
    patch({ unNumberDesc: `Looking up UN ${unNum}...` });
    lookupTimer.current = setTimeout(() => {
      const rec = unDbRef.current?.[unNum];
      if (rec) applyUnRecord(rec);
      else lookupFromAi(unNum);
    }, 500);
  }

  function onClassChange(value: string) {
    setState((s) => {
      const next = { ...s, unClass: value };
      const d = descsForClass(value);
      if (d) next.descriptions = d;
      return next;
    });
  }

  async function translateTitle(text: string) {
    if (!text) return;
    setTitleStatus({ kind: 'info', text: 'Translating...' });
    const schema = { type: 'OBJECT', properties: { en: { type: 'STRING' }, ru: { type: 'STRING' }, he: { type: 'STRING' }, ar: { type: 'STRING' } } };
    const prompt = `Translate the product name "${text}" into English, Russian, Hebrew, and Arabic. Return ONLY a JSON object with keys "en", "ru", "he", "ar".`;
    try {
      const t = await runAi({ provider: ai.provider, model: ai.model, apiKey: ai.apiKey, prompt, schema });
      setState((s) => ({ ...s, titles: { en: t.en || s.titles.en, ru: t.ru || s.titles.ru, he: t.he || s.titles.he, ar: t.ar || s.titles.ar } }));
      setTitleStatus({ kind: 'ok', text: 'Translated ✓' });
      setTimeout(() => setTitleStatus(null), 2500);
    } catch (e: any) {
      setTitleStatus({ kind: 'err', text: `Error: ${e.message}` });
    }
  }

  const setTitle = (lang: keyof HazmatState['titles'], value: string) =>
    setState((s) => ({ ...s, titles: { ...s.titles, [lang]: value } }));

  return (
    <div id="hazmat-app">
      {/* Sidebar */}
      <div className="hm-sidebar no-print">
        <div className="hm-sidebar-head">
          <div style={{ marginBottom: 8 }}>
            <button className="mode-back-btn" onClick={onBack}
              style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>← Back</button>
          </div>
          <h2>⬡ HazMat / Waste Placard</h2>
          <p>Fill manually and auto-translate with AI.</p>
        </div>

        <div className="hm-sidebar-body">
          <AiSettingsPanel settings={ai} variant="hazmat" />

          {/* Product name */}
          <div className="hm-section">
            <h3>Product Name</h3>
            <div className="hm-translate-row">
              <input className="hm-input" value={autoTitle}
                placeholder="Enter product name (any language)..."
                onChange={(e) => setAutoTitle(e.target.value)}
                onBlur={() => translateTitle(autoTitle.trim())}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }} />
              <button className="hm-translate-btn" title="Translate to all languages" onClick={() => translateTitle(autoTitle.trim())}>🌐</button>
            </div>
            {titleStatus && (
              <div className={`hm-status ${titleStatus.kind === 'info' ? 'info' : titleStatus.kind === 'ok' ? 'ok' : 'err'}`}>
                {titleStatus.kind === 'info' && <span className="hm-loader" style={{ width: 12, height: 12, borderWidth: 2, verticalAlign: 'middle', marginRight: 4 }} />}
                <span style={{ verticalAlign: 'middle' }}>{titleStatus.text}</span>
              </div>
            )}
            <div className="hm-grid-2" style={{ marginTop: 8 }}>
              <div><label className="hm-label-xs">English</label><input className="hm-input hm-input-sm" value={state.titles.en} onChange={(e) => setTitle('en', e.target.value)} /></div>
              <div><label className="hm-label-xs">Russian</label><input className="hm-input hm-input-sm" value={state.titles.ru} onChange={(e) => setTitle('ru', e.target.value)} /></div>
              <div><label className="hm-label-xs">Hebrew</label><input className="hm-input hm-input-sm" dir="rtl" value={state.titles.he} onChange={(e) => setTitle('he', e.target.value)} /></div>
              <div><label className="hm-label-xs">Arabic</label><input className="hm-input hm-input-sm" dir="rtl" value={state.titles.ar} onChange={(e) => setTitle('ar', e.target.value)} /></div>
            </div>
          </div>

          {/* Hazard codes */}
          <div className="hm-section">
            <h3>Hazard Codes</h3>
            <div className="hm-grid-2">
              <div><label className="hm-label">UN Number</label>
                <input className="hm-input" value={state.unNumber} onChange={(e) => onUnNumberChange(e.target.value)} /></div>
              <div><label className="hm-label">UN Class</label>
                <input className="hm-input" value={state.unClass} title="Enter class and sub-risk (e.g., 8 (6.1))" onChange={(e) => onClassChange(e.target.value)} /></div>
              <div><label className="hm-label">Emergency Code</label>
                <input className="hm-input" value={state.emergCode} onChange={(e) => patch({ emergCode: e.target.value })} /></div>
              <div><label className="hm-label">Pictograms</label>
                <input className="hm-input" value={state.pictograms} title="e.g. Flammable, Corrosive" onChange={(e) => patch({ pictograms: e.target.value })} /></div>
            </div>
          </div>

          <button className="hm-print-btn" onClick={() => window.print()}>⎙ Print Placard</button>
        </div>
      </div>

      {/* Preview */}
      <div className="hm-preview">
        <HazmatPlacard state={state} />
      </div>
    </div>
  );
}

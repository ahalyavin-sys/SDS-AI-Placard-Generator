import { useCallback, useEffect, useRef, useState } from 'react';
import AiSettingsPanel from '../../components/AiSettingsPanel';
import { useAiSettings } from '../../lib/useAiSettings';
import Placard from './Placard';
import {
  GHS_IMAGES, GHS_LABELS, LANGUAGES, PPE_ICONS, RTL, SAMPLE_DATA, UI,
  type Language, type PlacardData,
} from './data';
import {
  extractSds, fileToBase64, normalizeLines, normalizePpeIcon, normalizeUnNumber,
} from './sdsLogic';

interface Props { onBack: () => void; }

type Status = { type: 'busy' | 'error'; message: string } | null;

export default function SdsApp({ onBack }: Props) {
  const ai = useAiSettings('sds');
  const [data, setData] = useState<PlacardData>(() => structuredClone(SAMPLE_DATA));
  const [lang, setLang] = useState<Language>('english');
  const [status, setStatus] = useState<Status>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; base64: string; mime: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [invalidIso, setInvalidIso] = useState<Set<string>>(new Set());
  const pagesRef = useRef<HTMLDivElement>(null);

  // Validate that ISO 7010 PNG sources actually exist; fall back otherwise.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const invalid = new Set<string>();
      await Promise.all(
        Object.values(PPE_ICONS).map(async (item) => {
          try {
            const res = await fetch(item.src, { cache: 'no-store' });
            if (!res.ok) { invalid.add(item.src); return; }
            const ct = (res.headers.get('content-type') || '').toLowerCase();
            if (ct.includes('image/png') || ct.includes('image/svg')) return;
            const buf = await res.arrayBuffer();
            const b = new Uint8Array(buf.slice(0, 8));
            if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return;
            const text = new TextDecoder().decode(buf.slice(0, 300)).toLowerCase();
            if (!text.includes('<svg')) invalid.add(item.src);
          } catch { /* ignore */ }
        }),
      );
      if (!cancelled) setInvalidIso(invalid);
    })();
    return () => { cancelled = true; };
  }, []);

  // Auto-fit the first-aid block text to fill available space.
  const fitFirstAid = useCallback(() => {
    const MIN = 9.5, MAX = 18, STEP = 0.5;
    pagesRef.current?.querySelectorAll<HTMLElement>('.block.first-aid').forEach((block) => {
      const grid = block.querySelector<HTMLElement>('.first-aid-grid');
      if (!grid) return;
      const header = block.querySelector('h3') as HTMLElement | null;
      const available = block.clientHeight - (header ? header.offsetHeight : 0);
      if (available <= 0) return;
      let size = MIN;
      grid.style.fontSize = size + 'px';
      while (size + STEP <= MAX) {
        grid.style.fontSize = size + STEP + 'px';
        if (grid.scrollHeight > available) { grid.style.fontSize = size + 'px'; break; }
        size += STEP;
      }
    });
  }, []);

  useEffect(() => { requestAnimationFrame(fitFirstAid); });
  useEffect(() => {
    const onResize = () => requestAnimationFrame(fitFirstAid);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fitFirstAid]);

  const togglePictogram = (code: string) => {
    setData((prev) => {
      const set = new Set(prev.pictograms);
      set.has(code) ? set.delete(code) : set.add(code);
      return { ...prev, pictograms: Array.from(set) };
    });
  };

  // Generic editor field updates.
  const editField = (path: string, value: string) => {
    setData((prev) => {
      const next = structuredClone(prev);
      if (path === 'unNumber') { next.unNumber = normalizeUnNumber(value); return next; }
      const [l, key, subkey] = path.split('.') as [Language, string, string];
      const ld = next[l];
      if (key === 'hazards') { ld.hazards = normalizeLines(value); return next; }
      if (key === 'ppe') {
        const icons = ['M004', 'M009', 'M013', 'M010'];
        ld.ppe = normalizeLines(value).slice(0, 6).map((text, i) => ({
          icon: normalizePpeIcon(ld.ppe[i]?.icon || icons[i] || 'M004', text), text,
        }));
        return next;
      }
      if (key === 'firstAid') { (ld.firstAid as any)[subkey] = value; return next; }
      (ld as any)[key] = value;
      return next;
    });
  };

  const onFile = async (file: File | null) => {
    setStatus(null);
    setFileInfo(null);
    if (!file) return;
    if (!file.type.match(/^application\/pdf$|^image\//)) {
      setStatus({ type: 'error', message: 'Unsupported file type. Choose a PDF or image.' });
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setFileInfo({ name: `${file.name} (${Math.ceil(file.size / 1024)} KB)`, base64, mime: file.type });
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message });
    }
  };

  const doExtract = async () => {
    if (!fileInfo) return;
    setStatus({ type: 'busy', message: 'AI is reading the SDS and translating the safety placards...' });
    try {
      const result = await extractSds({
        provider: ai.provider, model: ai.model, apiKey: ai.apiKey,
        mimeType: fileInfo.mime, base64: fileInfo.base64, filename: fileInfo.name,
      });
      setData(result);
      setLang('english');
      setStatus(null);
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message || 'Extraction failed.' });
    }
  };

  const d = data[lang];
  const dir = RTL.has(lang) ? 'rtl' : 'ltr';

  return (
    <div id="sds-app">
      <main className="sds-shell">
        <aside className="side-panel">
          <div style={{ marginBottom: 12 }}>
            <button className="mode-back-btn" onClick={onBack}>← Back to selector</button>
          </div>
          <div className="brand">
            <div className="brand-mark"><span>!</span></div>
            <div>
              <h1>SDS AI Safety Placard Generator</h1>
              <p className="subtitle">Upload an SDS PDF or image, extract chemical safety data with AI, then print four A4 placards.</p>
            </div>
          </div>

          <AiSettingsPanel settings={ai} variant="sds" />

          <label className={`upload-zone${dragging ? ' drag' : ''}`}
            onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files[0] || null); }}
          >
            <input type="file" accept="application/pdf,image/*" onChange={(e) => onFile(e.target.files?.[0] || null)} />
            <div>
              <div className="upload-icon">⬆</div>
              <strong>Upload SDS PDF or image</strong>
              <div className="hint">{fileInfo ? fileInfo.name : 'No file selected'}</div>
            </div>
          </label>

          <div className="action-row">
            <button className="btn btn-primary" disabled={!fileInfo || status?.type === 'busy'} onClick={doExtract}>⚡ Extract</button>
            <button className="btn btn-secondary" onClick={() => { setData(structuredClone(SAMPLE_DATA)); setLang('english'); setStatus(null); }}>Load Sample</button>
          </div>

          {status && <div className={`status ${status.type}`}>{status.message}</div>}

          <div className="field">
            <label>GHS pictograms</label>
            <div className="pictogram-grid">
              {Object.keys(GHS_IMAGES).map((code) => (
                <button type="button" key={code}
                  className={`picto-choice${data.pictograms.includes(code) ? ' selected' : ''}`}
                  title={GHS_LABELS[code]} onClick={() => togglePictogram(code)}>
                  <img src={GHS_IMAGES[code]} alt={GHS_LABELS[code]} />
                  <span>{GHS_LABELS[code]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="tabs">
            {LANGUAGES.map((l) => (
              <button key={l} type="button" className={`tab${l === lang ? ' active' : ''}`} onClick={() => setLang(l)}>
                {UI[l].tab}
              </button>
            ))}
          </div>

          <div dir={dir}>
            <div className="field"><label>Product name</label>
              <input value={d.productName} onChange={(e) => editField(`${lang}.productName`, e.target.value)} /></div>
            <div className="field"><label>Description</label>
              <textarea value={d.description} onChange={(e) => editField(`${lang}.description`, e.target.value)} /></div>
            <div className="field"><label>Hazards, one per line</label>
              <textarea value={d.hazards.join('\n')} onChange={(e) => editField(`${lang}.hazards`, e.target.value)} /></div>
            <div className="field"><label>PPE, one per line</label>
              <textarea value={d.ppe.map((i) => i.text).join('\n')} onChange={(e) => editField(`${lang}.ppe`, e.target.value)} /></div>
            <div className="field"><label>Eyes first aid</label>
              <textarea value={d.firstAid.eyes} onChange={(e) => editField(`${lang}.firstAid.eyes`, e.target.value)} /></div>
            <div className="field"><label>Skin first aid</label>
              <textarea value={d.firstAid.skin} onChange={(e) => editField(`${lang}.firstAid.skin`, e.target.value)} /></div>
            <div className="field"><label>Ingestion first aid</label>
              <textarea value={d.firstAid.ingestion} onChange={(e) => editField(`${lang}.firstAid.ingestion`, e.target.value)} /></div>
            <div className="field"><label>Inhalation first aid</label>
              <textarea value={d.firstAid.inhalation} onChange={(e) => editField(`${lang}.firstAid.inhalation`, e.target.value)} /></div>
            <div className="field"><label>Supplier</label>
              <input value={d.supplierName} onChange={(e) => editField(`${lang}.supplierName`, e.target.value)} /></div>
            <div className="field"><label>UN number</label>
              <input value={data.unNumber} onChange={(e) => editField('unNumber', e.target.value)} /></div>
          </div>
        </aside>

        <section className="preview-area">
          <div className="toolbar">
            <div className="toolbar-title">Print-ready A4 placards: English, Russian, Arabic, Hebrew</div>
            <div className="action-row" style={{ margin: 0, gridTemplateColumns: 'auto auto' }}>
              <button className="btn btn-secondary" onClick={() => requestAnimationFrame(fitFirstAid)}>↻ Refresh</button>
              <button className="btn btn-danger" onClick={() => window.print()}>⎙ Print / PDF</button>
            </div>
          </div>
          <div className="pages" ref={pagesRef}>
            {LANGUAGES.map((l) => <Placard key={l} lang={l} data={data} invalidIso={invalidIso} />)}
          </div>
        </section>
      </main>
    </div>
  );
}

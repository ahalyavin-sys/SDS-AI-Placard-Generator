import { useEffect, useRef } from 'react';
import { resolvePictograms } from './hazmatData';

export interface HazmatState {
  titles: { en: string; ru: string; he: string; ar: string };
  unNumber: string;
  unNumberDesc: string;
  unClass: string;
  emergCode: string;
  pictograms: string;
  descriptions: { en: string; ru: string; he: string; ar: string };
}

/** Shrink-to-fit a text element within its parent box. */
function useFit(ref: React.RefObject<HTMLElement>, max: number, min: number, dep: unknown) {
  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    let sz = max;
    el.style.fontSize = sz + 'px';
    while ((el.scrollHeight > parent.clientHeight || el.scrollWidth > parent.clientWidth) && sz > min) {
      sz -= 1;
      el.style.fontSize = sz + 'px';
    }
  }, [ref, max, min, dep]);
}

function FitText({ text, max, min, dir, weight = 700 }: { text: string; max: number; min: number; dir?: 'rtl'; weight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useFit(ref, max, min, text);
  return (
    <div ref={ref} dir={dir} style={{ fontWeight: weight, color: '#111827', textAlign: 'center', width: '100%', wordBreak: 'break-word', lineHeight: 1.05 }}>
      {text}
    </div>
  );
}

export default function HazmatPlacard({ state }: { state: HazmatState }) {
  const pics = resolvePictograms(state.pictograms, state.unClass);
  return (
    <div className="hm-a4-container" id="hm-placard-preview">
      <div className="hm-frame">
        <div className="hm-frame-inner">
          {/* Top: 2x2 language title grid */}
          <div className="hm-title-grid">
            <div className="hm-title-cell hm-bordered-b hm-bordered-r"><FitText text={state.titles.en} max={56} min={14} /></div>
            <div className="hm-title-cell hm-bordered-b"><FitText text={state.titles.ru} max={56} min={14} /></div>
            <div className="hm-title-cell hm-bordered-r"><FitText text={state.titles.he} max={56} min={14} dir="rtl" /></div>
            <div className="hm-title-cell"><FitText text={state.titles.ar} max={56} min={14} dir="rtl" /></div>
          </div>

          {/* Middle: UN number | UN class | emergency code */}
          <div className="hm-data-grid">
            <div className="hm-data-cell hm-bordered-r" style={{ paddingTop: 32 }}>
              <div className="hm-data-label">UN NUMBER</div>
              <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <FitText text={state.unNumber} max={100} min={24} />
              </div>
              <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 4 }}>
                <FitText text={state.unNumberDesc} max={20} min={9} />
              </div>
            </div>

            <div className="hm-data-cell hm-bordered-r" style={{ padding: 0 }}>
              <div className="hm-data-label" style={{ zIndex: 10 }}>UN CLASS</div>
              <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '48px 16px 16px' }}>
                <FitText text={state.unClass} max={100} min={24} />
              </div>
              <div className="hm-class-svg">
                {pics.map((p, i) => (
                  <img key={i} src={p.src} alt={p.alt} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ))}
              </div>
            </div>

            <div className="hm-data-cell" style={{ paddingTop: 32 }}>
              <div className="hm-data-label">EMERGENCY CODE</div>
              <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <FitText text={state.emergCode} max={100} min={24} />
              </div>
            </div>
          </div>

          {/* Bottom: 1x4 language descriptions */}
          <div className="hm-desc-grid">
            <div className="hm-desc-cell hm-bordered-r"><FitText text={state.descriptions.en} max={24} min={10} weight={500} /></div>
            <div className="hm-desc-cell hm-bordered-r"><FitText text={state.descriptions.ru} max={24} min={10} weight={500} /></div>
            <div className="hm-desc-cell hm-bordered-r"><FitText text={state.descriptions.he} max={24} min={10} dir="rtl" weight={500} /></div>
            <div className="hm-desc-cell"><FitText text={state.descriptions.ar} max={24} min={10} dir="rtl" weight={500} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

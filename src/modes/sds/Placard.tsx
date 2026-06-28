import {
  GHS_IMAGES, GHS_LABELS, PPE_ICONS, RTL, UI,
  type Language, type LangData, type PlacardData,
} from './data';
import { normalizeLines, normalizePpeIcon } from './sdsLogic';

interface Props {
  lang: Language;
  data: PlacardData;
  invalidIso: Set<string>;
}

function ppeIconSrc(icon: string, text: string, invalidIso: Set<string>) {
  const r = PPE_ICONS[normalizePpeIcon(icon, text)];
  return invalidIso.has(r.src) ? r.fallback : r.src;
}

export default function Placard({ lang, data, invalidIso }: Props) {
  const d: LangData = data[lang];
  const ui = UI[lang];
  const rtl = RTL.has(lang);
  const pictograms = data.pictograms.length ? data.pictograms : ['GHS07'];
  const hazards = normalizeLines(d.hazards, ['Review SDS before use.']).slice(0, 5);
  const langClass = rtl ? `rtl ${lang}` : lang;

  const pictoImgs = pictograms.slice(0, 6).map((code) => (
    <img key={code} src={GHS_IMAGES[code] || GHS_IMAGES.GHS07} alt={GHS_LABELS[code] || code} />
  ));

  const aidRows: [string, string, string][] = [
    ['◉', ui.eyes, d.firstAid.eyes],
    ['~', ui.skin, d.firstAid.skin],
    ['!', ui.ingestion, d.firstAid.ingestion],
    ['≈', ui.inhalation, d.firstAid.inhalation],
  ];

  return (
    <article className={`placard ${langClass}`} dir={rtl ? 'rtl' : 'ltr'}>
      <header className="placard-header">
        <div className="signal-box">{ui.signal}<br />!</div>
        <div className="product-box">
          <h2>{d.productName || 'Chemical product'}</h2>
          <p>{d.description || 'Safety Data Sheet summary'}</p>
        </div>
        <div className="un-box"><span>{ui.un}</span><span>{data.unNumber || 'N/A'}</span></div>
      </header>

      <section className="warning-band">
        {rtl && <div className="pictograms">{pictoImgs}</div>}
        <div>
          <h3 className="section-title">{ui.hazards}</h3>
          <ul className="hazards">{hazards.map((h, i) => <li key={i}>{h}</li>)}</ul>
        </div>
        {!rtl && <div className="pictograms">{pictoImgs}</div>}
      </section>

      <section className="content-grid">
        <div className="block ppe">
          <h3>{ui.ppe}</h3>
          <div className="ppe-grid">
            {d.ppe.slice(0, 4).map((item, i) => (
              <div className="ppe-item" key={i}>
                <div className="ppe-icon">
                  <img
                    src={ppeIconSrc(item.icon, item.text, invalidIso)}
                    alt={PPE_ICONS[normalizePpeIcon(item.icon, item.text)].label}
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.onerror = null;
                      el.src = PPE_ICONS[normalizePpeIcon(item.icon, item.text)].fallback;
                    }}
                  />
                </div>
                <div>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="block first-aid">
          <h3>{ui.firstAid}</h3>
          <div className="first-aid-grid">
            {aidRows.map(([icon, title, text], i) => (
              <div className="aid-row" key={i}>
                {!rtl && <div className="aid-icon">{icon}</div>}
                <div><span className="aid-title">{title}</span>{text}</div>
                {rtl && <div className="aid-icon">{icon}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="phone-panel">
        <div className="phone-heading"><span>{ui.poisonTitle}</span><span className="phone-number">04-7771900</span></div>
        <div className="phone-card"><strong>{ui.poisonWhen}</strong>{ui.poisonText}</div>
        <div className="phone-card"><strong>{ui.madaWhen}</strong>{ui.madaText}</div>
      </section>

      <footer className="footer">
        <div>{ui.supplier}: {d.supplierName || 'N/A'}</div>
        <div>{ui.advice}</div>
        <div>{ui.emergency}</div>
      </footer>
    </article>
  );
}

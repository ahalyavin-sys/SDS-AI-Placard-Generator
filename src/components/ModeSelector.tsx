import type { AppMode } from '../App';

interface Props {
  onSelect: (mode: AppMode) => void;
}

export default function ModeSelector({ onSelect }: Props) {
  return (
    <div id="mode-selector">
      <div className="mode-hero">
        <div className="mode-hero-logo">
          <div className="mode-hero-diamond"><span>!</span></div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
              Safety Document Generator
            </div>
          </div>
        </div>
        <h1 className="mode-hero-title">What would you like to create?</h1>
        <p className="mode-hero-sub">Choose the type of safety document you need to generate and print.</p>
        <div className="mode-cards">
          <button className="mode-card mode-sds" onClick={() => onSelect('sds')}>
            <div className="mode-card-icon"><span>!</span></div>
            <h2 className="mode-card-title">SDS One-Pager</h2>
            <p className="mode-card-desc">
              Upload a Safety Data Sheet PDF or image. AI extracts hazard data and generates print-ready A4
              placards in 4 languages — with PPE icons, first aid, and emergency contacts.
            </p>
            <span className="mode-card-tag">English · Russian · Arabic · Hebrew</span>
            <span className="mode-card-cta">Generate SDS Placard →</span>
          </button>
          <button className="mode-card mode-hazmat" onClick={() => onSelect('hazmat')}>
            <div className="mode-card-icon">⬡</div>
            <h2 className="mode-card-title">HazMat / Waste Placard</h2>
            <p className="mode-card-desc">
              Enter a UN number and product name. AI auto-translates into 4 languages and generates a transport or
              waste placard with UN class, emergency code and GHS pictograms.
            </p>
            <span className="mode-card-tag">UN Number · Class · Emergency Code</span>
            <span className="mode-card-cta">Generate HazMat Placard →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

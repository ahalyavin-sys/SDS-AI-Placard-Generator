import { PROVIDERS, type Provider } from '../lib/ai';
import type { AiSettings } from '../lib/useAiSettings';

interface Props {
  settings: AiSettings;
  /** 'sds' uses the side-panel field styling, 'hazmat' uses the hm-* styling. */
  variant: 'sds' | 'hazmat';
}

/** Provider / model / API-key controls, rendered to match the host mode's styles. */
export default function AiSettingsPanel({ settings, variant }: Props) {
  const cfg = PROVIDERS[settings.provider];

  if (variant === 'sds') {
    return (
      <>
        <div className="field">
          <label>AI provider</label>
          <select value={settings.provider} onChange={(e) => settings.setProvider(e.target.value as Provider)}>
            {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
              <option key={p} value={p}>{PROVIDERS[p].label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>{cfg.keyLabel}</label>
          <input
            type="password"
            autoComplete="off"
            placeholder={cfg.keyPlaceholder}
            value={settings.apiKey}
            onChange={(e) => settings.setApiKey(e.target.value)}
          />
          <div className="hint" dangerouslySetInnerHTML={{ __html: cfg.keyHintHtml }} />
        </div>
        <div className="field">
          <label>AI model</label>
          <select value={settings.model} onChange={(e) => settings.setModel(e.target.value)}>
            {cfg.models.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <div className="hint">{cfg.modelHint}</div>
        </div>
      </>
    );
  }

  return (
    <details className="hm-details">
      <summary>
        <span>⚙ AI Settings</span>
        <span className="hm-chevron">▾</span>
      </summary>
      <div className="hm-details-body">
        <div>
          <label className="hm-label">AI Provider</label>
          <select className="hm-select" value={settings.provider} onChange={(e) => settings.setProvider(e.target.value as Provider)}>
            {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
              <option key={p} value={p}>{PROVIDERS[p].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="hm-label">Model</label>
          <select className="hm-select" value={settings.model} onChange={(e) => settings.setModel(e.target.value)}>
            {cfg.models.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <div className="hint" style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{cfg.modelHint}</div>
        </div>
        <div>
          <label className="hm-label">
            API Key <span style={{ fontWeight: 400, color: '#9ca3af' }}>(required for AI translation)</span>
          </label>
          <input
            type="password"
            autoComplete="off"
            className="hm-input"
            placeholder={cfg.keyPlaceholder}
            value={settings.apiKey}
            onChange={(e) => settings.setApiKey(e.target.value)}
          />
        </div>
      </div>
    </details>
  );
}

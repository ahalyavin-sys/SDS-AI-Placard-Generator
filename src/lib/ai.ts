// Shared browser-side AI client for Gemini and OpenRouter.
// No backend server is required — calls go directly from the browser.

export type Provider = 'gemini' | 'openrouter';

export interface ProviderConfig {
  label: string;
  keyLabel: string;
  keyPlaceholder: string;
  keyHintHtml: string;
  storeKey: string;
  models: { value: string; label: string }[];
  modelHint: string;
}

export const PROVIDERS: Record<Provider, ProviderConfig> = {
  gemini: {
    label: 'Google Gemini (free tier)',
    keyLabel: 'Gemini API key',
    keyPlaceholder: 'Paste your Google AI Studio key',
    keyHintHtml:
      'Free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">aistudio.google.com</a>. Reads PDFs and images directly.',
    storeKey: 'sdg_key_gemini',
    models: [
      { value: 'gemini-flash-latest', label: 'Gemini Flash (latest)' },
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (recommended)' },
      { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    ],
    modelHint: 'gemini-2.5-flash and flash-lite are free-tier friendly and read PDFs natively.',
  },
  openrouter: {
    label: 'OpenRouter (free & cheap models)',
    keyLabel: 'OpenRouter API key',
    keyPlaceholder: 'Paste your OpenRouter key (sk-or-...)',
    keyHintHtml:
      'Free key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener">openrouter.ai/keys</a>. Models tagged <b>:free</b> have no cost.',
    storeKey: 'sdg_key_openrouter',
    models: [
      { value: 'meta-llama/llama-3.2-11b-vision-instruct:free', label: 'Llama 3.2 11B Vision (free)' },
      { value: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash Exp (free)' },
      { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku' },
      { value: 'qwen/qwen2.5-vl-72b-instruct', label: 'Qwen 2.5 VL 72B' },
    ],
    modelHint: 'Models ending in :free cost nothing.',
  },
};

export interface FilePart {
  mimeType: string;
  base64: string;
  filename?: string;
}

export interface AiRequest {
  provider: Provider;
  model: string;
  apiKey: string;
  prompt: string;
  file?: FilePart;
  /** Gemini responseSchema (OpenAPI-ish). Optional. */
  schema?: unknown;
}

function parseJsonLoose(text: string): any {
  const cleaned = String(text)
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const s = cleaned.indexOf('{');
    const e = cleaned.lastIndexOf('}');
    if (s !== -1 && e > s) return JSON.parse(cleaned.slice(s, e + 1));
    throw new Error('AI did not return valid JSON. Try a different model.');
  }
}

async function callGemini(req: AiRequest): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    req.model,
  )}:generateContent?key=${encodeURIComponent(req.apiKey)}`;
  const parts: any[] = [{ text: req.prompt }];
  if (req.file) parts.push({ inlineData: { mimeType: req.file.mimeType, data: req.file.base64 } });
  const body: any = { contents: [{ role: 'user', parts }] };
  body.generationConfig = {
    responseMimeType: 'application/json',
    temperature: 0.2,
    ...(req.schema ? { responseSchema: req.schema } : {}),
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.error?.message || `Gemini HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('AI returned no response.');
  return parseJsonLoose(text);
}

async function callOpenRouter(req: AiRequest): Promise<any> {
  const content: any[] = [{ type: 'text', text: req.prompt + '\nRespond with a single JSON object only.' }];
  let plugins: any[] | undefined;
  if (req.file) {
    const dataUrl = `data:${req.file.mimeType};base64,${req.file.base64}`;
    if (req.file.mimeType === 'application/pdf') {
      content.push({ type: 'file', file: { filename: req.file.filename || 'document.pdf', file_data: dataUrl } });
      plugins = [{ id: 'file-parser', pdf: { engine: 'pdf-text' } }];
    } else {
      content.push({ type: 'image_url', image_url: { url: dataUrl } });
    }
  }
  const body: any = {
    model: req.model,
    messages: [{ role: 'user', content }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  };
  if (plugins) body.plugins = plugins;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${req.apiKey}`,
      'HTTP-Referer': location.origin || 'https://safety-doc.app',
      'X-Title': 'Safety Document Generator',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.error?.message || `OpenRouter HTTP ${res.status}`);
  }
  const result = await res.json();
  const text = result?.choices?.[0]?.message?.content;
  if (!text) throw new Error('AI returned no response.');
  return parseJsonLoose(text);
}

/** Run an AI request and return parsed JSON. Throws Error with a readable message. */
export async function runAi(req: AiRequest): Promise<any> {
  if (!req.apiKey) throw new Error('Please enter an API key in the AI Settings panel.');
  return req.provider === 'openrouter' ? callOpenRouter(req) : callGemini(req);
}

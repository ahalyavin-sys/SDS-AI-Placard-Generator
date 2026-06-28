import { useCallback, useEffect, useState } from 'react';
import { PROVIDERS, type Provider } from './ai';

export interface AiSettings {
  provider: Provider;
  model: string;
  apiKey: string;
  setProvider: (p: Provider) => void;
  setModel: (m: string) => void;
  setApiKey: (k: string) => void;
}

/**
 * Provider / model / API-key state persisted to sessionStorage so the key
 * only lives for the browser session. `nsPrefix` namespaces storage per mode.
 */
export function useAiSettings(nsPrefix: string): AiSettings {
  const [provider, setProviderState] = useState<Provider>(() => {
    const saved = sessionStorage.getItem(`${nsPrefix}_provider`) as Provider | null;
    return saved && PROVIDERS[saved] ? saved : 'gemini';
  });
  const [model, setModel] = useState<string>(() => PROVIDERS[provider].models[0].value);
  const [apiKey, setApiKeyState] = useState<string>('');

  // When provider changes, reset model + reload its stored key.
  useEffect(() => {
    setModel(PROVIDERS[provider].models[0].value);
    setApiKeyState(sessionStorage.getItem(PROVIDERS[provider].storeKey) || '');
    sessionStorage.setItem(`${nsPrefix}_provider`, provider);
  }, [provider, nsPrefix]);

  const setProvider = useCallback((p: Provider) => setProviderState(p), []);
  const setApiKey = useCallback(
    (k: string) => {
      setApiKeyState(k);
      sessionStorage.setItem(PROVIDERS[provider].storeKey, k);
    },
    [provider],
  );

  return { provider, model, apiKey, setProvider, setModel, setApiKey };
}

# Safety Document Generator

A modern **React + TypeScript (Vite)** web app that generates two kinds of
print-ready safety documents. On launch you pick what to create:

1. **SDS One-Pager** — Upload a Safety Data Sheet (PDF or image), let an AI model
   extract the key safety information, and print four ready-to-post **A4 safety
   placards** in **English, Russian, Arabic, and Hebrew**.
2. **HazMat / Waste Placard** — Enter a UN number and product name; AI
   auto-translates the name into four languages and builds an **A4 landscape**
   transport/waste placard with UN class, emergency code and GHS pictograms.
   UN numbers are resolved from a bundled offline database (`un_numbers.json`,
   ~4000 entries), falling back to AI lookup.

This was previously two separate apps (SDS-AI-Placard-Generator and
HazMatPlacard); they are now combined into this single app with a mode selector.

## What the SDS placard shows

- Signal word + product name + UN number
- Severe hazard warnings
- GHS pictograms
- Mandatory PPE (ISO 7010 mandatory signs)
- First aid for eyes / skin / ingestion / inhalation
- Poison-center and emergency phone information

## Architecture

```
src/
  App.tsx                 mode selection + print-orientation handling
  components/             ModeSelector, shared AiSettingsPanel
  lib/                    ai.ts (Gemini/OpenRouter client), useAiSettings hook
  modes/sds/              SDS data, extraction logic, Placard, SdsApp
  modes/hazmat/           HazMat data, HazmatPlacard, HazmatApp
public/
  images/                 GHS / ISO 7010 / PPE assets
  un_numbers.json         offline UN-number lookup database
```

All AI calls are made **directly from the browser** — no backend server is
required. The previous HazMat Node.js server (`/api/ai`, `/api/un`) is no longer
needed. The legacy single-file build is preserved as `legacy-index.html` for
reference.

## Develop & build

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build
```

## Use it

1. Open the app and choose **SDS One-Pager** or **HazMat / Waste Placard**.
2. Open **AI Settings**, pick a provider and paste that provider's API key.
3. SDS: upload an SDS PDF/image and click **Extract**. HazMat: type a product
   name and UN number; translation and lookup happen automatically.
4. Edit any field, then **Print / PDF**.

> The API key is stored only in the current browser tab session
> (`sessionStorage`) and is sent directly from your browser to the provider.
> A purely client-side web app cannot hide a hardcoded key, so each user brings
> their own.

## AI providers

| Provider | Cost | Reads PDF? | Get a key |
|----------|------|-----------|-----------|
| **Google Gemini** | Free tier | Yes, natively | https://aistudio.google.com/app/apikey |
| **OpenRouter** | Free & cheap models | Yes (free `pdf-text` parser) / images on any vision model | https://openrouter.ai/keys |

Adding another provider is a single entry in the `PROVIDERS` map in
`src/lib/ai.ts`.

## Host it online for free

The app builds to a static `dist/`, so any static host works. Config for several
free options is included.

### Netlify (free for private repos) — recommended

Ready via `netlify.toml` (publish `dist`, build `npm run build`).

1. <https://app.netlify.com> → **Add new site → Import an existing project**.
2. Connect GitHub and pick this repository.
3. Click **Deploy**. Every push to the default branch redeploys.

### Vercel (free for private repos)

Ready via `vercel.json` (framework `vite`).

1. <https://vercel.com/new> and import this repository.
2. Click **Deploy**. Pushes auto-redeploy; PRs get preview URLs.

### Docker

```bash
docker build -t safety-doc .
docker run -p 8080:8080 safety-doc
```

## Notes

- PPE icons use ISO 7010 mandatory signs from `public/images/iso7010/`, with safe
  per-icon fallbacks so an icon always renders.
- This tool is an aid for producing placards; always verify the output against
  the original SDS / regulatory source before posting.

# SDS AI Safety Placard Generator

Upload a Safety Data Sheet (SDS) as a PDF or image, let an AI model extract the
key safety information, and print four ready-to-post **A4 safety placards** for
employees — in **English, Russian, Arabic, and Hebrew**.

Each placard summarises the major information workers need at a glance:

- Signal word + product name + UN number
- Severe hazard warnings
- GHS pictograms
- Mandatory PPE (ISO 7010 mandatory signs)
- First aid for eyes / skin / ingestion / inhalation
- Poison-center and emergency phone information

The whole app is a single static `index.html` (no build step, no backend).

## Use it

1. Open the app (locally just open `index.html`, or use a hosted copy — see below).
2. Pick an **AI provider** and paste that provider's API key.
3. Upload an SDS PDF or image (drag & drop works too).
4. Click **Extract**. Review/edit the fields, tweak pictograms.
5. Click **Print / PDF** to produce the four A4 placards.

> The API key is stored only in the current browser tab session
> (`sessionStorage`) and is sent directly from your browser to the provider.
> A purely static web app cannot hide a hardcoded key, so each user brings
> their own.

## AI providers

| Provider | Cost | Reads PDF? | Get a key |
|----------|------|-----------|-----------|
| **Google Gemini** | Free tier | Yes, natively | https://aistudio.google.com/app/apikey |
| **OpenRouter** | Free & cheap models | Yes (free `pdf-text` parser) / images on any vision model | https://openrouter.ai/keys |

On OpenRouter, models tagged **`:free`** cost nothing (e.g.
`meta-llama/llama-3.2-11b-vision-instruct:free`). Cheap paid options such as
`openai/gpt-4o-mini` and `anthropic/claude-3.5-haiku` are also listed. PDFs are
parsed with OpenRouter's free `pdf-text` engine; image SDS files work with any
vision-capable model.

Adding another provider is just one entry in the `PROVIDERS` map plus an
`extractWith…` function in `index.html`.

## Host it online for free

The app is a pure static site (no build step), so any static host works.
Config for three free options is included.

### Netlify (free for private repos) — recommended

Ready via `netlify.toml`.

1. Go to <https://app.netlify.com> → **Add new site → Import an existing project**.
2. Connect GitHub and pick this repository.
3. Build settings are read from `netlify.toml` (publish `.`, no build command) —
   just click **Deploy**. Every push to the default branch redeploys.

### Vercel (free for private repos)

Ready via `vercel.json`.

1. Go to <https://vercel.com/new> and import this repository.
2. Framework Preset: **Other** (already set to no build via `vercel.json`).
3. Click **Deploy**. Pushes auto-redeploy; PRs get preview URLs.

### GitHub Pages

Wired up via `.github/workflows/deploy-pages.yml`, **but note:**

- **Pages must be enabled once manually:** repo **Settings → Pages → Build and
  deployment → Source: GitHub Actions**. The workflow's `GITHUB_TOKEN` cannot
  create the Pages site itself (`enablement: true` returns
  *"Resource not accessible by integration"*), so this one-time toggle is
  required. After it, pushes to `main` publish to `https://<user>.github.io/<repo>/`.
- **Private repos need a paid plan** (Pro/Team/Enterprise) for Pages. On the
  free plan, either make the repo public or use Netlify/Vercel above, which are
  free for private repos.

> Security note: nothing sensitive is committed — AI API keys are entered by
> each user at runtime and kept only in their browser tab — so making the repo
> public to use free GitHub Pages is low-risk if you prefer that route.

### Run locally

```bash
# Any static server works; for example:
python3 -m http.server 8080
# then open http://localhost:8080
```

You can also just double-click `index.html`. (Over `file://`, the small ISO
icon pre-check is skipped and icons load directly — the placards still render
correctly.)

### Docker

```bash
docker build -t sds-placard .
docker run -p 8080:8080 sds-placard
```

## Notes

- PPE icons use ISO 7010 mandatory signs from `images/iso7010/`, with safe
  per-icon fallbacks so an icon always renders.
- This tool is an aid for producing placards; always verify the output against
  the original SDS before posting.

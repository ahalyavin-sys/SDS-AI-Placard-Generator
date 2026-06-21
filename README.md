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

The app is static, so any static host works. **GitHub Pages** is wired up:

1. A workflow lives at `.github/workflows/deploy-pages.yml`.
2. In the repo, go to **Settings → Pages → Build and deployment** and set
   **Source: GitHub Actions**.
3. Push to `main` (or run the workflow manually). The site publishes to
   `https://<user>.github.io/<repo>/`.

Other free options that work the same way (point them at this repo, no build
command, output directory = root): **Cloudflare Pages**, **Netlify**, **Vercel**.

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

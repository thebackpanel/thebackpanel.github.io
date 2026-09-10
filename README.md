# BACKPANEL — site

Static marketing site for BACKPANEL (auto-rickshaw back-panel ads, Bengaluru).
Live canonical URL: `https://thebackpanel.github.io/`.

## No-framework rationale

- 2 pages (`index.html` ~24 KB, `stack.html` ~19 KB), total HTML ~44 KB with
  `app.js` (~13 KB) + `styles.css` (~13 KB) — roughly ~70 KB all-in.
- Zero-JS default already: content, layout, and native form validation work
  without JavaScript. `app.js` (reach estimator, form POST + mailto fallback)
  and `bp-enhance.js` (analytics, reveal, SW registration) are enhancement only.
- A build step (bundler, framework, SSR) would add nothing: no routing, no
  data layer, no components to hydrate. Plain HTML/CSS/JS keeps LCP/CLS/INP
  trivially good and deploys as static files.

## Structure map

```
site/
├── index.html          # landing page (hero, proof, pricing, lead form)
├── stack.html          # "other modes of ads" page + stack/pitch form
├── 404.html            # custom not-found page
├── app.js              # core JS: nav, estimator, Google Forms + /api POST, mailto
├── bp-enhance.js       # enhancement: bpTrack queue, data-event/outbound/
│                       # pricing/form analytics, honeypot guard, pitch_url
│                       # validation, reveal-on-scroll, SW registration (defer)
├── styles.css          # legacy stylesheet
├── src/                # TS sources + styles (app.ts, schema.ts, types.ts,
│                       # hooks/useResponsive.ts, styles/*.css, ErrorBoundary.tsx)
├── assets/             # favicons, logo SVGs/PNGs, apple-touch-icon, og-image.svg
├── site.webmanifest    # PWA manifest
├── .env.example        # config template (snippet inputs, endpoints)
├── docs/               # MIGRATION.md, DNS-CUSTOM-DOMAIN.md
└── .github/workflows/  # deploy.yml (lives in the LIVE repo; see Deploy)
```

## Preview

Any static server from this directory:

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000/
```

(`bp-enhance.js` console-debugs only on localhost; SW registration is skipped
on plain `http:` except localhost.)

## Deploy

The live repo (`thebackpanel/thebackpanel.github.io`) serves from its root, so
**the contents of `site/` map 1:1 to the live repo root**:

| `site/` path        | live URL                                      |
| ------------------- | --------------------------------------------- |
| `index.html`        | `https://thebackpanel.github.io/`             |
| `stack.html`        | `https://thebackpanel.github.io/stack.html`   |
| `assets/*`, etc.    | `https://thebackpanel.github.io/assets/*`     |

Cutover = copy `site/` contents to the live repo root and push `main`
(see `docs/MIGRATION.md`). The live repo deploys via
`.github/workflows/deploy.yml` (validate → GitHub Pages). Repo Settings →
Pages → Source must be **GitHub Actions**.

## Analytics setup

1. Choose a provider: `ANALYTICS_PROVIDER=umami|plausible` in `.env`.
2. Paste the provider snippet into `<head>` of each page **before**
   `bp-enhance.js` (Umami: `UMAMI_SRC` + `UMAMI_WEBSITE_ID`; Plausible:
   `data-domain="PLAUSIBLE_DOMAIN"`).
3. No further wiring: `bp-enhance.js` exposes `window.bpTrack(event, data)`
   (backed by `window._bpq`) and auto-tracks:
   - clicks on any `[data-event]` element (`{id, text ≤80 chars, page}`),
   - `outbound_click` for cross-host `http(s)` links `{href}`,
   - `pricing_view` once per `[data-tier]` via IntersectionObserver,
   - `form_start` (once) / `form_submit` for `#leadForm,#pitchForm,#stackForm`.
4. Privacy: no cookies, no localStorage of PII, no fingerprinting in this file.

## Forms setup

- Current behavior (`app.js`): `sendLead`/`sendPitch` POST best-effort to
  Google Forms (`GF_CONFIG.endpoint`, field entry IDs in `app.js`) and to
  `/api/leads` / `/api/pitch` (no-ops on a static host), then fall back to
  `mailto:founders@backpanel.in` with a prefilled subject/body and show a
  confirmation message.
- Spam guard (`bp-enhance.js`): document-level capture `submit` listener —
  if `input[name=company_website]` (honeypot) has a value, the submit is
  `preventDefault`ed + `stopImmediatePropagation`ed before `app.js` runs.
- `pitch_url` live validation: `URL` constructor + `http(s)` check via
  `setCustomValidity`, so native validation blocks bad submits first.
- Optional Formspree: set `FORMSPREE_ENDPOINT=` in `.env` and wire a
  `fetch()` alongside the Google Forms push in `app.js`.

## PWA

- `site.webmanifest` (name, icons from `assets/`, `theme_color #FF4D00`).
- Icons: `assets/favicon.svg`, `assets/favicon-dark.svg`,
  `assets/apple-touch-icon.png` (180×180).
- `bp-enhance.js` registers `sw.js` (relative path, subpath-safe) on `load`
  over `https:`/localhost only. If you add `sw.js` at root:
  1. bump its `CACHE_NAME` (e.g. `backpanel-v2`) every deploy that changes
     cached assets, 2. keep the precache list in sync with renamed files,
  3. verify DevTools → Application → Service Workers updates cleanly.

## Performance notes

No measured field data (no RUM wired yet). Static posture favors Core Web
Vitals: tiny payloads (~70 KB pages, no framework), preloaded CSS, no
render-blocking JS (`defer`), passive scroll listener, skeleton helpers in
`app.js`. Watch: LCP = hero/logo asset; CLS = reserve space for
dynamically-filled `#reachOut`/badges; INP = trivial (no heavy handlers).
Validate with PageSpeed Insights after deploy.

## File inventory

| File / dir               | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `index.html`             | landing page, canonical `…github.io/`              |
| `stack.html`             | secondary services page                            |
| `404.html`               | not-found page (no canonical yet — see deploy.yml) |
| `app.js`                 | core interactive logic (read-only reference)       |
| `bp-enhance.js`          | NEW analytics/enhancement layer (this change)      |
| `styles.css`, `src/`     | styles + TS sources                                |
| `assets/`                | icons, logos, OG image                             |
| `site.webmanifest`       | PWA manifest                                       |
| `.env.example`           | NEW config template                                |
| `docs/MIGRATION.md`      | NEW old→new mapping + cutover steps                |
| `docs/DNS-CUSTOM-DOMAIN.md` | NEW future custom-domain playbook (not active)  |
| `.gitignore`             | git ignores                                        |

Known SEO gaps flagged by validators (fix in live repo): `stack.html` meta
description is 183 chars (limit 100–170); `404.html` lacks a canonical link.

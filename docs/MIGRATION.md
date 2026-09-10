# Migration — old → new

What changed, per requirement area, when moving to the current static site
(`site/` → `thebackpanel.github.io` repo root).

## Area map

| Area      | Old (before)                              | New (now)                                                        |
| --------- | ----------------------------------------- | ---------------------------------------------------------------- |
| Build     | Framework/bundler pipeline assumed        | No build. Plain HTML/CSS/vanilla JS (~70 KB, 2 pages). Zero-JS default; `app.js` + `bp-enhance.js` (deferred) are enhancement only. |
| SEO       | Incomplete / inconsistent meta            | Every page: `<title>` 30–70 chars, meta description 100–170 chars, canonical to `https://thebackpanel.github.io/`, OG + Twitter cards, JSON-LD (`index.html`). Validated in CI (`deploy.yml`). Known gaps: `stack.html` description is 183 chars; `404.html` has no canonical — trim/add in live repo. |
| A11y      | Unknown baseline                          | `lang="en"`, viewport with `maximum-scale=5.0`, `prefers-reduced-motion` disables reveal-on-scroll, native form validation (`setCustomValidity` for `pitch_url`), `aria-hidden` on skeletons. |
| Analytics | None / ad-hoc                             | Privacy-first layer `bp-enhance.js`: `window._bpq` queue + `window.bpTrack(event,data)`, auto-forward to Umami/Plausible snippets when present; auto-tracks `[data-event]` clicks, `outbound_click`, `pricing_view` per `[data-tier]`, `form_start`/`form_submit`. No cookies, no localStorage of PII, no fingerprinting. |
| PWA       | None                                      | `site.webmanifest` + icons in `assets/`; `bp-enhance.js` registers `sw.js` (relative, subpath-safe) on `https:`/localhost. Add `sw.js` at root + bump `CACHE_NAME` per release (see README). |
| Domain    | Undecided                                 | Canonical stays `https://thebackpanel.github.io/`. Custom domain (`backpanel.in` / `getbackpanel.com`) is a documented future playbook only — see `docs/DNS-CUSTOM-DOMAIN.md` (NOT active). |
| Legal     | Missing                                   | `404.html` + honest footer/contact (`founders@backpanel.in`); honeypot spam guard (`company_website`) instead of intrusive CAPTCHA. Add formal Privacy/Terms pages before collecting production leads. |
| Forms     | Backend-dependent                         | `app.js`: best-effort POST to Google Forms (`GF_CONFIG`) + `/api/*`, then `mailto:` fallback — works on a static host. Optional Formspree via `FORMSPREE_ENDPOINT` (see `.env.example`). |

## Content mapping (old sections → new structure)

| Old section / content            | New location                                  |
| -------------------------------- | --------------------------------------------- |
| Hero + value prop                | `index.html` hero                             |
| Social proof / trust signals     | `index.html` proof items (`.proof-item`, `.trust`) |
| Pricing tiers                    | `index.html` `[data-tier]` blocks (tracked as `pricing_view`) |
| Reach / CPM estimator            | `index.html` `#autos/#days → #reachOut` (`app.js` `calc()`) |
| Lead capture form                | `index.html` `#leadForm` → Google Forms + mailto |
| Secondary services (cards, neon, reels, influencer, LinkedIn, WhatsApp, launch packs) | `stack.html` + `#stackForm`/`#pitchForm` |
| Pitch submission                 | `stack.html` `#pitchForm` with `pitch_url` validation |
| 404 handling                     | `404.html`                                    |
| TS/React sources                 | `src/` (reference; not part of the served bundle) |

## Deploy cutover steps

1. **Freeze** edits to the old location; verify `site/` previews cleanly:
   `python3 -m http.server` from `site/`.
2. **Copy** the *contents* of `site/` (not the folder) to the root of the live
   repo `thebackpanel/thebackpanel.github.io`, preserving paths
   (`index.html`, `stack.html`, `assets/*`, …).
3. **Fix flagged SEO gaps** in the live repo: trim `stack.html` meta
   description to 100–170 chars; add canonical to `404.html`; add
   `sitemap.xml` (+ `robots.txt`) if missing.
4. **Add `.github/workflows/deploy.yml`** (this change) to the live repo;
   set repo Settings → Pages → Source = **GitHub Actions**.
5. **Push to `main`** → validate job runs (titles, descriptions, canonicals,
   sitemap↔files, manifest icons, no `http://` mixed content) then deploys.
6. **Verify live**: canonical URL, OG preview, forms end-to-end (Google Forms
   row arrives; mailto fallback fires), analytics events in provider
   dashboard, manifest/SW in DevTools, PageSpeed pass.
7. **Rollback**: revert the live-repo commit (previous Pages deployment
   remains restorable from Actions history).

# Custom domain playbook (FUTURE — NOT active)

> Status: **NOT active.** Canonical stays `https://thebackpanel.github.io/`.
> Do not point DNS or change canonicals until this playbook is explicitly
> approved. Candidate domains: `backpanel.in` or `getbackpanel.com`.

## 1. CNAME file

In the live repo root (`thebackpanel.github.io`), create a file named `CNAME`
(no extension) whose entire content is the bare domain:

```
backpanel.in
```

(Use `getbackpanel.com` instead if that candidate wins. Never list both —
one canonical host only. `www` subdomain is handled by DNS + redirect below.)

## 2. DNS records (at the registrar / DNS provider)

For an apex domain (`backpanel.in`), GitHub Pages supports either:

**Option A — ALIAS/ANAME (preferred if the provider offers it):**

| Type  | Host | Value                      |
| ----- | ---- | -------------------------- |
| ALIAS | `@`  | `thebackpanel.github.io`   |
| CNAME | `www`| `thebackpanel.github.io`   |

**Option B — A + AAAA (all four of each):**

| Type | Host | Values |
| ---- | ---- | ------ |
| A    | `@`  | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA | `@`  | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME| `www`| `thebackpanel.github.io` |

Keep TTL low (300–600s) during cutover; raise afterwards.

## 3. Enforce HTTPS

Repo Settings → Pages → Custom domain = `backpanel.in` → wait for DNS check
to pass → tick **Enforce HTTPS**. GitHub provisions the certificate (can take
up to ~24h). Do not announce the domain until `https://backpanel.in` loads
with a valid cert.

## 4. Canonical / OG / sitemap swap checklist

After HTTPS is enforced, replace **every** occurrence of the old canonical
across the live repo:

- [ ] `<link rel="canonical">` in all `*.html`
- [ ] `og:url`, `twitter:url` meta tags (all pages)
- [ ] JSON-LD `"url"` (+ Organization `url`/`logo` if absolute)
- [ ] `sitemap.xml` `<loc>` entries → new domain; update `robots.txt` Sitemap line
- [ ] `SITE_URL=` in `.env` / `.env.example`
- [ ] Plausible `data-domain` (switch to the custom domain)
- [ ] Re-verify: `curl -s https://backpanel.in/sitemap.xml`, View Source
      canonical on each page, social-card debuggers, Search Console +
      Bing Webmaster re-verification

## 5. Propagation wait

- DNS: 1–48h (commonly < 4h with low TTL).
- HTTPS cert: up to ~24h after the DNS check passes.
- Search engines: re-crawl over days; keep the `github.io` URLs returning
  (GitHub auto-redirects them to the custom domain once configured) — do not
  delete the Pages site during transition.

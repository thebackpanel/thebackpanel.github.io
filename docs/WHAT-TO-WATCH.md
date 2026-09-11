# What to watch — BACKPANEL launch sheet

One page. If a metric isn't here, it can wait.

| Metric | Tool | Cadence | Moves it |
|---|---|---|---|
| Lighthouse mobile (target 95+) | Lighthouse CI / Chrome | every deploy | font/CSS/JS weight |
| LCP < 1.5s, CLS < 0.05 | Search Console → Core Web Vitals | weekly | critical CSS, preloads |
| Clicks for 10 intent queries | Search Console | weekly | FAQ, H2 questions, schema |
| AI Overview captures | manual screenshots | monthly | AEO blocks, FAQ schema |
| ChatGPT / Perplexity citations | docs/AI-CITATION-BASELINE.md protocol | monthly | GEO chunks, third-party mentions |
| CTA clicks by variant (?cta=quote) | bpTrack → Umami/Plausible, else _bpq | weekly | copy test readout |
| Form starts → submits | bpTrack form_start/form_submit | weekly | form friction |
| Reviews + rating | Google Business Profile | monthly | QR cards, follow-up |
| NAP drift (name/address/phone) | docs/NAP-CONSISTENCY.md checklist | quarterly | GBP, LinkedIn, directories |

Red lines: LH mobile < 90 on any deploy → fix before next push. Schema ≠ visible content → same-commit correction. Any new superlative without source → remove or qualify.

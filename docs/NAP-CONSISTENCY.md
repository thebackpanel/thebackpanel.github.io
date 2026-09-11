# NAP Consistency Checklist: BACKPANEL

Canonical NAP string (use byte-identical everywhere):

> **BACKPANEL · Bengaluru, Karnataka, IN · founders@backpanel.in · https://thebackpanel.github.io/**

## Status per surface

| Surface | Name | Address | Contact | Status |
|---|---|---|---|---|
| This site (schema + footer) | BACKPANEL | Bengaluru, Karnataka, IN | founders@backpanel.in | ✅ live |
| Google Business Profile | BACKPANEL | Bengaluru, Karnataka, IN | founders@backpanel.in | ☐ TODO: claim, add geo 12.9716, 77.5946, upload GPS proof photos |
| LinkedIn company page | BACKPANEL | Bengaluru, Karnataka, IN | founders@backpanel.in | ☐ TODO: create/align tagline + URL |
| Directories (JustDial, Sulekha, IndiaMART) | BACKPANEL | Bengaluru, Karnataka, IN | founders@backpanel.in | ☐ TODO: add after GBP |

## Missing inputs (schema deliberately omits these — no placeholders)

- **telephone:** add a real business number, then add `telephone` to LocalBusiness JSON-LD and this doc in the same commit.
- **sameAs:** add LinkedIn + Instagram + GBP URLs once they exist, then add `sameAs` array in the same commit.
- **openingHoursSpecification:** add real hours (e.g., Mo–Sa 10:00–18:00 IST) once confirmed, then add to schema in the same commit.

Rule: schema mirrors verified reality. Never invent NAP fields to look complete.

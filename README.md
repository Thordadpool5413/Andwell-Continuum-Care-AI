# Andwell Continuum Care AI

Standalone clinical intelligence for identifying **potential additional care needs and Andwell service opportunities** from documented patient information.

This repository is intentionally independent from SpartanCoaching. It owns its own clinical contracts, service registry, screening engine, API, tests, and future OpenAI / Google Healthcare integration boundaries.

## What the MVP does

- maintains a versioned Andwell service/program registry
- accepts structured clinical facts with source provenance
- keeps `present`, `not_documented`, and `contradicted` separate
- screens documented needs against Andwell service pathways
- suppresses the patient's current service
- checks public service-area context when county is supplied
- surfaces potential exclusion signals as a **review hold**, never an automatic denial
- returns the evidence that caused each service to surface
- requires qualified human review
- never determines eligibility, coverage, admission, level of care, treatment, coding, billing, orders, or enrollment

## Target workflow

```text
Andwell EHR / approved source
        |
        v
FHIR / healthcare-data normalization
        |
        v
Clinical evidence extraction
        |
        v
Whole-patient fact set + provenance
        |
        v
Andwell service registry + deterministic screening
        |
        v
Potential Care Opportunities
        |
        v
Qualified Andwell reviewer
        |
        v
Patient/family choice + normal referral workflow
        |
        v
Approved EHR documentation/write-back
```

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
ALLOW_SYNTHETIC_API=true pnpm dev
```

Development endpoints:

- `GET /health`
- `GET /v1/services`
- `POST /v1/reviews`

The review endpoint is synthetic-development only and is disabled unless `ALLOW_SYNTHETIC_API=true`.

## Data boundary

Do not place real PHI, patient charts, production exports, credentials, API keys, or patient screenshots in GitHub.

The initial registry is seeded from Andwell's public service descriptions so the product can be developed. Public website content is **not** treated as the authoritative production eligibility source. Before production, Andwell owners must approve the versioned internal criteria, exclusions, payer rules, geography, capacity source, program compatibility, routing ownership, and effective dates.

See `docs/architecture.md` and `docs/implementation-plan.md`.

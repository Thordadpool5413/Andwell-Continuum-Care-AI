# Architecture

## Product boundary

Andwell Continuum Care AI is a standalone product. It does not depend on SpartanCoaching's application, database, authentication, tool registry, or deployment.

The platform is split into four layers:

1. healthcare data ingestion and provenance
2. clinical fact extraction
3. deterministic Andwell service screening
4. qualified human review and care coordination

## Design rule

The screening engine consumes structured facts, not raw chart text.

That preserves the distinction between:

- what a source record documented
- what an extraction layer represented
- what a program rule requires
- what a qualified reviewer decides

## Human authority

The system may surface potential care needs and service pathways. It does not autonomously decide diagnosis, hospice/GUIDE eligibility, coverage, admission, level of care, treatment, medication changes, coding, billing, or enrollment.

## Integration boundaries

The OpenAI and Google Healthcare files are explicit future integration boundaries and are disabled in the MVP. This lets the standalone domain model and screening behavior be validated before real healthcare infrastructure is connected.

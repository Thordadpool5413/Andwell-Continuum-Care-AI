# Implementation plan

## Milestone 1 - Standalone foundation

Implemented in the initial MVP branch:

- independent repository
- clinical fact/provenance contract
- versioned Andwell public-source service seed
- deterministic opportunity engine
- unknown vs contradicted states
- current-service suppression
- county availability screen
- potential exclusion review holds
- synthetic API and tests
- disabled OpenAI and Google Healthcare boundaries

## Milestone 2 - Andwell-owned service registry

Replace or approve the public-source seed with internally owned criteria for every program:

- inclusion indicators
- exclusions
- payer/program requirements
- geography
- required orders/referrals
- compatibility with other programs
- capacity source
- routing owner
- effective date
- approval owner
- source/version

## Milestone 3 - Clinical extraction

Implement versioned evidence extraction with provenance, temporality, negation, uncertainty, source revision and synthetic benchmark cases.

## Milestone 4 - Google Healthcare / FHIR

Implement approved patient/source retrieval and FHIR projection with identity resolution, source revision tracking, reference integrity and controlled write-back.

## Milestone 5 - OpenAI

Implement the approved API adapter in the covered production environment with store disabled, schema validation, provenance checks, bounded retries, versioned model/prompt settings and no patient data in logs.

## Milestone 6 - Reviewer workflow

Add authenticated role-based queues, evidence drill-down, dispositions, patient preference, routing SLAs and normal referral/order handoff.

## Milestone 7 - Clinical evaluations

Create independent synthetic gold cases measuring extraction accuracy, attribution, contradictions, false positives, false negatives, exclusion handling, routing correctness and critical safety sentinels.

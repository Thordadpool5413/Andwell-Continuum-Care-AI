import type {
  AndwellServiceDefinition,
  CareOpportunity,
  ClinicalFact,
  ContinuumReviewInput,
  ContinuumReviewResult,
  ScreeningSignal,
} from "../domain/contracts.js";
import {
  ANDWELL_REGISTRY_VERSION,
  ANDWELL_SERVICES,
  getServiceAvailability,
} from "../registry/andwellServices.js";

function normalize(value: string): string {
  return value.toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

function phraseMatches(text: string, phrase: string): boolean {
  const haystack = normalize(text);
  const needle = normalize(phrase);
  if (!needle) return false;

  if (/^[a-z0-9]{2,5}$/.test(needle)) {
    return haystack.split(/[^a-z0-9]+/).filter(Boolean).includes(needle);
  }

  return haystack.includes(needle);
}

function signalEvidence(
  signal: ScreeningSignal,
  facts: readonly ClinicalFact[],
): ClinicalFact[] {
  return facts.filter((fact) => {
    if (fact.status !== "present") return false;
    if (signal.categories?.length && !signal.categories.includes(fact.category)) {
      return false;
    }
    return signal.anyOf.some((phrase) => phraseMatches(fact.text, phrase));
  });
}

function potentialExclusions(
  service: AndwellServiceDefinition,
  input: ContinuumReviewInput,
): string[] {
  if (!service.potentialExclusionKeywords?.length) return [];
  const context = [
    input.context.payer ?? "",
    ...input.context.activePrograms,
    ...input.context.currentServiceIds,
  ];

  return service.potentialExclusionKeywords.filter((keyword) =>
    context.some((value) => phraseMatches(value, keyword)),
  );
}

function buildOpportunity(
  service: AndwellServiceDefinition,
  input: ContinuumReviewInput,
): CareOpportunity | null {
  if (input.context.currentServiceIds.includes(service.id)) return null;

  const matches = service.signals
    .map((signal) => ({ signal, evidence: signalEvidence(signal, input.facts) }))
    .filter((item) => item.evidence.length > 0);

  if (matches.length < service.minimumSignals) return null;

  const exclusions = potentialExclusions(service, input);
  const seen = new Set<string>();
  const evidence = matches.flatMap((item) => item.evidence)
    .filter((fact) => {
      if (seen.has(fact.id)) return false;
      seen.add(fact.id);
      return true;
    })
    .slice(0, 6)
    .map((fact) => ({
      factId: fact.id,
      category: fact.category,
      text: fact.text,
      ...(fact.source ? { source: fact.source } : {}),
    }));

  return {
    serviceId: service.id,
    serviceName: service.name,
    family: service.family,
    status: exclusions.length ? "review_hold" : "clinical_review_suggested",
    reasons: matches.map((item) => item.signal.label),
    evidence,
    evidenceSignalCount: matches.length,
    unresolvedChecks: [...service.eligibilityChecks],
    potentialExclusions: exclusions,
    availability: getServiceAvailability(service, input.context.county),
    reviewerRole: service.reviewerRole,
    sourceUrl: service.sourceUrl,
    humanReviewRequired: true,
    eligibilityDetermined: false,
  };
}

export function runContinuumReview(
  input: ContinuumReviewInput,
): ContinuumReviewResult {
  const opportunities = ANDWELL_SERVICES
    .map((service) => buildOpportunity(service, input))
    .filter((item): item is CareOpportunity => item !== null)
    .sort((a, b) =>
      b.evidenceSignalCount - a.evidenceSignalCount ||
      a.serviceName.localeCompare(b.serviceName),
    );

  return {
    registryVersion: ANDWELL_REGISTRY_VERSION,
    screenedServiceCount: ANDWELL_SERVICES.length,
    opportunities,
    limitations: [
      "Screening only: no eligibility, coverage, level-of-care, admission, treatment, order, coding, billing, or enrollment decision is made.",
      "No flag means only that the documented present facts did not satisfy the current screening rule. It does not mean a need is absent.",
      "Potential exclusion signals require qualified verification and are not final denials.",
      "Payer, geography, capacity, patient preference, current enrollment, required orders/referrals, and organization-approved criteria must be verified before action.",
      "The current registry is a public-source development seed and must be replaced or approved by Andwell before production use.",
    ],
    humanReviewRequired: true,
  };
}

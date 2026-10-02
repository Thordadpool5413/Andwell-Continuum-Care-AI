import { z } from "zod";

export const factCategorySchema = z.enum([
  "diagnosis",
  "symptom",
  "functional",
  "caregiver",
  "cognitive",
  "behavioral_health",
  "social",
  "wound",
  "therapy",
  "hearing",
  "maternal_pediatric",
  "utilization",
  "goals_of_care",
  "other",
]);

export const factStatusSchema = z.enum([
  "present",
  "not_documented",
  "contradicted",
]);

export const evidenceSourceSchema = z.object({
  documentId: z.string().min(1),
  locator: z.string().min(1).optional(),
  section: z.string().min(1).optional(),
  observedAt: z.string().min(1).optional(),
});

export const clinicalFactSchema = z.object({
  id: z.string().min(1),
  category: factCategorySchema,
  text: z.string().min(1),
  status: factStatusSchema.default("present"),
  source: evidenceSourceSchema.optional(),
});

export const patientContextSchema = z.object({
  county: z.string().min(1).optional(),
  payer: z.string().min(1).optional(),
  currentServiceIds: z.array(z.string()).default([]),
  activePrograms: z.array(z.string()).default([]),
});

export const continuumReviewInputSchema = z.object({
  facts: z.array(clinicalFactSchema),
  context: patientContextSchema.default({
    currentServiceIds: [],
    activePrograms: [],
  }),
});

export type FactCategory = z.infer<typeof factCategorySchema>;
export type EvidenceSource = z.infer<typeof evidenceSourceSchema>;
export type ClinicalFact = z.infer<typeof clinicalFactSchema>;
export type ContinuumReviewInput = z.infer<typeof continuumReviewInputSchema>;

export type ServiceAvailability = "available" | "not_listed" | "verify";
export type OpportunityStatus = "clinical_review_suggested" | "review_hold";

export interface ScreeningSignal {
  id: string;
  label: string;
  anyOf: readonly string[];
  categories?: readonly FactCategory[];
}

export interface AndwellServiceDefinition {
  id: string;
  name: string;
  family:
    | "At-Home Care"
    | "Hospice & Palliative"
    | "Community & Behavioral Health"
    | "Therapy & Specialty";
  summary: string;
  reviewerRole: string;
  sourceUrl: string;
  minimumSignals: number;
  signals: readonly ScreeningSignal[];
  eligibilityChecks: readonly string[];
  serviceAreaCounties?: readonly string[];
  potentialExclusionKeywords?: readonly string[];
}

export interface CareOpportunity {
  serviceId: string;
  serviceName: string;
  family: AndwellServiceDefinition["family"];
  status: OpportunityStatus;
  reasons: string[];
  evidence: Array<{
    factId: string;
    category: FactCategory;
    text: string;
    source?: EvidenceSource;
  }>;
  evidenceSignalCount: number;
  unresolvedChecks: string[];
  potentialExclusions: string[];
  availability: ServiceAvailability;
  reviewerRole: string;
  sourceUrl: string;
  humanReviewRequired: true;
  eligibilityDetermined: false;
}

export interface ContinuumReviewResult {
  registryVersion: string;
  screenedServiceCount: number;
  opportunities: CareOpportunity[];
  limitations: string[];
  humanReviewRequired: true;
}

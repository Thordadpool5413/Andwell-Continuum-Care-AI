import type {
  AndwellServiceDefinition,
  FactCategory,
  ServiceAvailability,
} from "../domain/contracts.js";

export const ANDWELL_REGISTRY_VERSION =
  "andwell-public-seed-2026-10-01-v1" as const;

const areas = {
  guide: ["Androscoggin", "Aroostook", "Cumberland", "Franklin", "Kennebec", "Lincoln", "Oxford", "Sagadahoc", "Somerset"],
  caregivers: ["Androscoggin", "Aroostook", "Cumberland", "Franklin", "Kennebec", "Oxford", "Penobscot", "Piscataquis", "Somerset", "Washington"],
  homeHealth: ["Androscoggin", "Aroostook", "Cumberland", "Franklin", "Kennebec", "Oxford", "Penobscot", "Piscataquis", "Somerset"],
  hospice: ["Androscoggin", "Aroostook", "Cumberland", "Franklin", "Kennebec", "Knox", "Lincoln", "Oxford", "Penobscot", "Piscataquis", "Sagadahoc", "Somerset", "Waldo", "York"],
  palliative: ["Androscoggin", "Aroostook", "Cumberland", "Franklin", "Kennebec", "Knox", "Lincoln", "Oxford", "Penobscot", "Piscataquis", "Sagadahoc", "Somerset", "Waldo", "York"],
  therapy: ["Androscoggin"],
  audiology: ["Androscoggin"],
  mobileWound: ["Androscoggin", "Cumberland", "Franklin", "Oxford", "Sagadahoc"],
  community: ["Androscoggin", "Aroostook", "Cumberland", "Franklin", "Hancock", "Kennebec", "Knox", "Lincoln", "Oxford", "Penobscot", "Piscataquis", "Sagadahoc", "Somerset", "Waldo", "Washington", "York"],
} as const;

function signal(
  id: string,
  label: string,
  anyOf: readonly string[],
  categories?: readonly FactCategory[],
) {
  return { id, label, anyOf, categories };
}

export const ANDWELL_SERVICES: readonly AndwellServiceDefinition[] = [
  {
    id: "home-health",
    name: "Home Healthcare",
    family: "At-Home Care",
    summary: "Skilled home care for recovery, chronic-condition management, rehabilitation and documented skilled needs.",
    reviewerRole: "Home Health intake / clinical reviewer",
    sourceUrl: "https://andwell.org/health-services/at-home-care/home-health/",
    minimumSignals: 2,
    serviceAreaCounties: areas.homeHealth,
    eligibilityChecks: ["Homebound status", "Skilled need", "Provider order/referral", "Payer/coverage", "Current capacity"],
    signals: [
      signal("transition", "recent transition or skilled-care need", ["hospital discharge", "recent hospitalization", "post-op", "skilled nursing"], ["utilization", "other"]),
      signal("homebound", "homebound or mobility limitation", ["homebound", "unable to leave home", "fall risk", "requires assistance"], ["functional"]),
      signal("rehab", "rehabilitation need", ["physical therapy", "occupational therapy", "speech therapy", "rehab", "gait", "transfer"], ["therapy", "functional"]),
      signal("complex", "complex home clinical need", ["infusion", "picc", "wound", "ostomy", "diabetes management", "medication management"], ["wound", "other"]),
    ],
  },
  {
    id: "caregivers",
    name: "CareGivers (In-Home Caregiving)",
    family: "At-Home Care",
    summary: "Personal care, companionship, respite and practical support when daily-living or caregiver needs are documented.",
    reviewerRole: "CareGivers intake",
    sourceUrl: "https://andwell.org/health-services/at-home-care/at-home-care-giving-caregivers/",
    minimumSignals: 1,
    serviceAreaCounties: areas.caregivers,
    eligibilityChecks: ["Requested support", "Patient/caregiver preference", "Payer or private-pay arrangement", "Current availability"],
    signals: [
      signal("adl", "activities-of-daily-living support", ["activities of daily living", "adl", "bathing", "dressing", "toileting", "meal preparation", "needs assistance"], ["functional"]),
      signal("strain", "caregiver strain or respite need", ["caregiver burden", "caregiver strain", "caregiver fatigue", "respite", "overwhelmed"], ["caregiver"]),
      signal("supervision", "supervision or companionship need", ["requires supervision", "cannot be left alone", "social isolation", "companionship"], ["functional", "caregiver", "social"]),
    ],
  },
  {
    id: "guide",
    name: "GUIDE Dementia Care Management",
    family: "At-Home Care",
    summary: "Dementia care management and caregiver support for patients who may meet GUIDE requirements.",
    reviewerRole: "GUIDE intake / dementia care team",
    sourceUrl: "https://andwell.org/health-services/at-home-care/dementia-care-management-guide/",
    minimumSignals: 1,
    serviceAreaCounties: areas.guide,
    eligibilityChecks: ["Dementia diagnosis", "Medicare status", "Residence/program setting", "Service area", "Program exclusions"],
    potentialExclusionKeywords: ["medicare advantage", "pace", "active hospice", "hospice benefit", "long-term skilled nursing"],
    signals: [
      signal("dementia", "documented dementia or cognitive need", ["dementia", "alzheimer", "cognitive decline", "memory loss", "memory impairment"], ["diagnosis", "cognitive"]),
    ],
  },
  {
    id: "mobile-wound",
    name: "Mobile Wound Care",
    family: "At-Home Care",
    summary: "Clinical review for wound, ostomy or continence needs.",
    reviewerRole: "Mobile Wound clinical intake",
    sourceUrl: "https://andwell.org/health-services/at-home-care/wound-care/",
    minimumSignals: 1,
    serviceAreaCounties: areas.mobileWound,
    eligibilityChecks: ["Wound/ostomy/continence need", "Provider referral as required", "Service area", "Payer/coverage", "Current capacity"],
    signals: [
      signal("wound", "wound, ostomy or continence need", ["wound", "pressure injury", "pressure ulcer", "diabetic ulcer", "non-healing", "ostomy", "stoma", "continence"], ["wound"]),
    ],
  },
  {
    id: "palliative-medicine",
    name: "Palliative Medicine",
    family: "Hospice & Palliative",
    summary: "Whole-person support review for serious illness, symptoms, goals of care and caregiver needs.",
    reviewerRole: "Palliative Medicine clinical intake",
    sourceUrl: "https://andwell.org/health-services/hospice-palliative-care/palliative-medicine/",
    minimumSignals: 2,
    serviceAreaCounties: areas.palliative,
    eligibilityChecks: ["Serious-illness clinical fit", "Patient goals/preferences", "Provider referral/order as required", "Payer/coverage", "Availability"],
    signals: [
      signal("illness", "serious illness", ["chf", "heart failure", "copd", "cancer", "metastatic", "advanced disease", "serious illness", "life-limiting"], ["diagnosis"]),
      signal("symptoms", "significant symptom burden", ["dyspnea", "shortness of breath", "pain", "nausea", "fatigue", "symptom burden"], ["symptom"]),
      signal("utilization", "high utilization or disease progression", ["recurrent hospitalization", "multiple hospitalizations", "frequent emergency", "progressive decline", "disease progression"], ["utilization", "functional"]),
      signal("goals", "goals-of-care or caregiver need", ["goals of care", "treatment decision", "caregiver burden", "quality of life"], ["goals_of_care", "caregiver"]),
    ],
  },
  {
    id: "hospice-home-care",
    name: "Hospice Home Care",
    family: "Hospice & Palliative",
    summary: "Hospice clinical review when documented illness and decline may warrant qualified eligibility assessment.",
    reviewerRole: "Hospice intake / hospice clinician / certifying physician",
    sourceUrl: "https://andwell.org/health-services/hospice-palliative-care/hospice-home-care/",
    minimumSignals: 2,
    serviceAreaCounties: areas.hospice,
    eligibilityChecks: ["Terminal illness and prognosis review", "Physician certification", "Goals/election discussion", "Payer benefit", "Capacity"],
    signals: [
      signal("advanced", "terminal or advanced illness", ["terminal", "end-stage", "advanced disease", "metastatic", "life expectancy", "prognosis"], ["diagnosis", "goals_of_care"]),
      signal("decline", "documented decline", ["functional decline", "progressive decline", "weight loss", "poor intake", "bedbound", "increased dependence"], ["functional", "symptom"]),
      signal("utilization", "recurrent utilization", ["recurrent hospitalization", "multiple hospitalizations", "frequent emergency"], ["utilization"]),
      signal("symptoms", "significant symptom burden", ["uncontrolled pain", "refractory", "dyspnea", "shortness of breath"], ["symptom"]),
    ],
  },
  {
    id: "inpatient-hospice",
    name: "Hospice House / Gosnell Memorial Hospice House",
    family: "Hospice & Palliative",
    summary: "Inpatient hospice review for an existing hospice patient with intensive symptom-management needs.",
    reviewerRole: "Hospice clinical team / level-of-care reviewer",
    sourceUrl: "https://andwell.org/health-services/hospice-palliative-care/",
    minimumSignals: 2,
    eligibilityChecks: ["Current hospice status", "Level-of-care criteria", "Symptom-management need", "Bed/capacity", "Patient/family preference"],
    signals: [
      signal("hospice", "current hospice context", ["current hospice", "enrolled in hospice", "hospice patient"], ["other"]),
      signal("crisis", "intensive symptom-management need", ["uncontrolled pain", "uncontrolled symptoms", "refractory symptoms", "symptom crisis", "severe dyspnea"], ["symptom"]),
    ],
  },
  {
    id: "forget-me-not",
    name: "Forget-Me-Not Dementia Program",
    family: "Hospice & Palliative",
    summary: "Dementia-focused support review for hospice patients with memory, agitation or confusion needs.",
    reviewerRole: "Hospice interdisciplinary team",
    sourceUrl: "https://andwell.org/health-services/hospice-palliative-care/hospice-home-care/",
    minimumSignals: 2,
    eligibilityChecks: ["Current Andwell hospice status", "Dementia/memory need", "Patient/family preference", "Availability"],
    signals: [
      signal("hospice", "hospice context", ["hospice patient", "current hospice", "enrolled in hospice"], ["other"]),
      signal("dementia", "dementia or memory need", ["dementia", "alzheimer", "memory loss", "agitation", "confusion"], ["diagnosis", "cognitive"]),
    ],
  },
  {
    id: "emotional-spiritual-support",
    name: "Emotional & Spiritual Support",
    family: "Hospice & Palliative",
    summary: "Psychosocial or spiritual review when distress, fear, family conflict or existential suffering is documented.",
    reviewerRole: "Hospice/palliative social work or spiritual-care team",
    sourceUrl: "https://andwell.org/health-services/hospice-palliative-care/emotional-spiritual-support/",
    minimumSignals: 1,
    eligibilityChecks: ["Current care context", "Documented emotional/spiritual need", "Patient/family preference", "Team assignment"],
    signals: [
      signal("distress", "emotional or spiritual distress", ["spiritual distress", "existential", "fear of dying", "family conflict", "emotional distress", "loss of meaning", "chaplain"], ["behavioral_health", "goals_of_care", "other"]),
    ],
  },
  {
    id: "bereavement-support",
    name: "Bereavement Support",
    family: "Hospice & Palliative",
    summary: "Grief and bereavement support review for patients, caregivers or family members.",
    reviewerRole: "Bereavement team",
    sourceUrl: "https://andwell.org/health-services/hospice-palliative-care/bereavement-support/",
    minimumSignals: 1,
    eligibilityChecks: ["Relationship to loss/care episode", "Requested support", "Age/program fit if applicable", "Availability"],
    signals: [
      signal("grief", "grief or loss need", ["bereavement", "anticipatory grief", "grief", "recent death", "loss of family"], ["caregiver", "behavioral_health", "other"]),
    ],
  },
  {
    id: "behavioral-health-outpatient",
    name: "Outpatient Mental Health & Co-Occurring Counseling",
    family: "Community & Behavioral Health",
    summary: "Behavioral-health review for documented mental-health, substance-use or co-occurring needs.",
    reviewerRole: "Behavioral Health intake",
    sourceUrl: "https://andwell.org/health-services/behavioral-health-services/",
    minimumSignals: 1,
    serviceAreaCounties: areas.community,
    eligibilityChecks: ["Presenting need", "Level-of-care appropriateness", "Payer/coverage", "Availability"],
    signals: [
      signal("behavioral", "mental-health or co-occurring need", ["depression", "anxiety", "trauma", "ptsd", "substance use", "alcohol use disorder", "opioid use disorder", "behavioral health"], ["behavioral_health", "diagnosis"]),
    ],
  },
  {
    id: "behavioral-health-home-adult",
    name: "Behavioral Health Home - Adults",
    family: "Community & Behavioral Health",
    summary: "Integrated adult behavioral-health and care-coordination review when medical, social and behavioral needs intersect.",
    reviewerRole: "Adult Behavioral Health Home intake",
    sourceUrl: "https://andwell.org/health-services/behavioral-health-services/",
    minimumSignals: 2,
    serviceAreaCounties: areas.community,
    eligibilityChecks: ["Age/program criteria", "Behavioral-health eligibility", "Care-coordination need", "Program/payer requirements", "Availability"],
    signals: [
      signal("behavioral", "adult behavioral-health need", ["adult behavioral health", "depression", "anxiety", "ptsd", "serious mental illness"], ["behavioral_health", "diagnosis"]),
      signal("complexity", "care-coordination complexity", ["care coordination", "multiple chronic", "frequent emergency", "housing instability", "food insecurity", "transportation barrier"], ["social", "utilization", "other"]),
    ],
  },
  {
    id: "behavioral-health-home-child",
    name: "Behavioral Health Home - Children",
    family: "Community & Behavioral Health",
    summary: "Child/family behavioral-health care coordination when clinical, school, medical or social needs are documented.",
    reviewerRole: "Children's Behavioral Health Home intake",
    sourceUrl: "https://andwell.org/health-services/behavioral-health-services/",
    minimumSignals: 2,
    serviceAreaCounties: areas.community,
    eligibilityChecks: ["Age/program criteria", "Behavioral-health eligibility", "Care-coordination need", "Program/payer requirements", "Availability"],
    signals: [
      signal("child", "child or youth context", ["pediatric", "child", "adolescent", "youth"], ["maternal_pediatric", "other"]),
      signal("behavioral", "behavioral-health concern", ["behavioral health", "depression", "anxiety", "adhd", "trauma", "emotional dysregulation"], ["behavioral_health", "diagnosis"]),
      signal("coordination", "coordination need", ["school support", "care coordination", "family support", "community support"], ["social", "caregiver", "other"]),
    ],
  },
  {
    id: "community-care-team",
    name: "Community Care Team",
    family: "Community & Behavioral Health",
    summary: "Care-management review for complex chronic illness, high utilization and social/resource barriers.",
    reviewerRole: "Community Care Team intake / care manager",
    sourceUrl: "https://andwell.org/health-services/behavioral-health-services/",
    minimumSignals: 2,
    serviceAreaCounties: areas.community,
    eligibilityChecks: ["Program/payer criteria", "Complex care-management need", "Social/resource barriers", "Existing care-management relationships", "Availability"],
    signals: [
      signal("complexity", "complex medical or utilization need", ["multiple chronic", "complex chronic", "frequent emergency", "recurrent hospitalization", "care coordination"], ["diagnosis", "utilization", "other"]),
      signal("social", "social or resource barrier", ["food insecurity", "housing instability", "transportation barrier", "unable to access primary care", "social determinant"], ["social"]),
    ],
  },
  {
    id: "home-program",
    name: "Housing Outreach Member Engagement (H.O.M.E.)",
    family: "Community & Behavioral Health",
    summary: "Specialized care-management review for homelessness or significant housing instability.",
    reviewerRole: "H.O.M.E. / Community Care Team",
    sourceUrl: "https://andwell.org/health-services/behavioral-health-services/",
    minimumSignals: 1,
    serviceAreaCounties: areas.community,
    eligibilityChecks: ["Housing-status criteria", "Program/payer criteria", "Care-management need", "Availability"],
    signals: [
      signal("housing", "homelessness or housing instability", ["homeless", "unsheltered", "housing instability", "unstable housing", "housing insecurity"], ["social"]),
    ],
  },
  {
    id: "adult-hcbs",
    name: "Adult Home & Community Based Services",
    family: "Community & Behavioral Health",
    summary: "Home/community support review for adults with intellectual disability or autism and independent-living needs.",
    reviewerRole: "Adult HCBS intake",
    sourceUrl: "https://andwell.org/health-services/behavioral-health-services/",
    minimumSignals: 2,
    eligibilityChecks: ["Age 18+", "Intellectual disability/autism criteria", "MaineCare Section 21/29 eligibility", "Functional/support need", "Availability"],
    signals: [
      signal("adult", "adult context", ["adult", "age 18", "age 19", "age 20"], ["other"]),
      signal("idd", "intellectual disability or autism", ["intellectual disability", "developmental disability", "autism", "asd"], ["diagnosis"]),
      signal("support", "functional or community support need", ["independent living", "community integration", "daily living support", "adl"], ["functional", "social"]),
    ],
  },
  {
    id: "adult-day",
    name: "Adult Day Program",
    family: "Community & Behavioral Health",
    summary: "Structured day/community support review for adults with intellectual/developmental disability.",
    reviewerRole: "Adult Day program intake",
    sourceUrl: "https://andwell.org/health-services/behavioral-health-services/",
    minimumSignals: 2,
    eligibilityChecks: ["Adult program criteria", "Intellectual/developmental disability", "Functional/support need", "Location/capacity", "Payer/program requirements"],
    signals: [
      signal("idd", "intellectual or developmental disability", ["intellectual disability", "developmental disability", "autism"], ["diagnosis"]),
      signal("day", "structured day or supervision need", ["day program", "structured activity", "requires supervision", "community integration", "social support"], ["functional", "social"]),
    ],
  },
  {
    id: "child-rcs",
    name: "Rehabilitative & Community Support (RCS)",
    family: "Community & Behavioral Health",
    summary: "Child/youth community-support review when behavioral-health and functional skill needs are documented.",
    reviewerRole: "Children's RCS intake",
    sourceUrl: "https://andwell.org/health-services/behavioral-health-services/",
    minimumSignals: 2,
    eligibilityChecks: ["Age through 20", "Qualifying behavioral-health need", "Functional assessment", "MaineCare Section 28 requirements", "Availability"],
    signals: [
      signal("child", "child or youth context", ["pediatric", "child", "adolescent", "youth"], ["maternal_pediatric", "other"]),
      signal("behavioral", "behavioral-health diagnosis or need", ["behavioral health", "emotional dysregulation", "anxiety", "depression", "adhd", "trauma"], ["behavioral_health", "diagnosis"]),
      signal("function", "functional skill need", ["functional impairment", "self-regulation", "social skills", "daily living"], ["functional", "social"]),
    ],
  },
  {
    id: "adult-therapy",
    name: "Adult Therapy Care (PT/OT/Speech)",
    family: "Therapy & Specialty",
    summary: "Therapy review for mobility, function, swallowing, speech/language or rehabilitation needs.",
    reviewerRole: "Therapy Care intake",
    sourceUrl: "https://andwell.org/health-services/therapycare-specialty-services/",
    minimumSignals: 1,
    serviceAreaCounties: areas.therapy,
    eligibilityChecks: ["Therapy discipline/clinical need", "Order/referral as required", "Payer/coverage", "Service area", "Availability"],
    signals: [
      signal("therapy", "adult therapy or rehabilitation need", ["physical therapy", "occupational therapy", "speech therapy", "dysphagia", "gait", "stroke", "parkinson", "traumatic brain injury", "tbi"], ["therapy", "functional", "diagnosis"]),
    ],
  },
  {
    id: "pediatric-therapy",
    name: "Pediatric Therapy",
    family: "Therapy & Specialty",
    summary: "Pediatric PT/OT/speech review for developmental, sensory, motor, communication or functional needs.",
    reviewerRole: "Pediatric Therapy intake",
    sourceUrl: "https://andwell.org/health-services/therapycare-specialty-services/pediatric-therapy/",
    minimumSignals: 2,
    eligibilityChecks: ["Age/program criteria", "PT/OT/speech need", "Order/referral as required", "Payer/coverage", "Availability"],
    signals: [
      signal("child", "pediatric context", ["pediatric", "child", "infant", "adolescent"], ["maternal_pediatric", "other"]),
      signal("therapy", "developmental or therapy need", ["developmental delay", "speech delay", "language delay", "sensory", "fine motor", "gross motor", "occupational therapy", "physical therapy", "speech therapy"], ["maternal_pediatric", "therapy", "functional"]),
    ],
  },
  {
    id: "audiology",
    name: "Audiology",
    family: "Therapy & Specialty",
    summary: "Audiology review when hearing loss, hearing difficulty or device concerns are documented.",
    reviewerRole: "Audiology intake",
    sourceUrl: "https://andwell.org/health-services/therapycare-specialty-services/audiology/",
    minimumSignals: 1,
    serviceAreaCounties: areas.audiology,
    eligibilityChecks: ["Hearing/audiology need", "Payer/self-pay requirements", "Service area", "Availability"],
    signals: [
      signal("hearing", "hearing or audiology need", ["hearing loss", "hearing impairment", "hearing aid", "difficulty hearing", "audiology"], ["hearing"]),
    ],
  },
  {
    id: "maternal-child-health",
    name: "Maternal & Child Health",
    family: "Therapy & Specialty",
    summary: "Maternal/pediatric specialty review for high-risk pregnancy or medically fragile children with complex needs.",
    reviewerRole: "Maternal & Child Health clinical intake",
    sourceUrl: "https://andwell.org/health-services/therapycare-specialty-services/maternal-child-health/",
    minimumSignals: 2,
    eligibilityChecks: ["Age/maternal program criteria", "Clinical/skilled need", "Provider order/referral", "Payer/coverage", "Availability"],
    signals: [
      signal("context", "maternal or pediatric context", ["pregnant", "pregnancy", "postpartum", "newborn", "infant", "pediatric", "child"], ["maternal_pediatric"]),
      signal("complex", "complex maternal or child clinical need", ["high-risk pregnancy", "feeding tube", "g-tube", "failure to thrive", "congenital heart", "genetic condition", "pediatric cancer", "picc", "port", "infusion", "medically fragile"], ["maternal_pediatric", "diagnosis", "other"]),
    ],
  },
] as const;

const byId = new Map(ANDWELL_SERVICES.map((service) => [service.id, service]));

export function getAndwellService(id: string) {
  return byId.get(id);
}

function normalizeCounty(value: string): string {
  return value.trim().replace(/\s+county$/i, "").toLowerCase();
}

export function getServiceAvailability(
  service: AndwellServiceDefinition,
  county?: string,
): ServiceAvailability {
  if (!county?.trim() || !service.serviceAreaCounties) return "verify";
  const target = normalizeCounty(county);
  return service.serviceAreaCounties.some(
    (candidate) => normalizeCounty(candidate) === target,
  ) ? "available" : "not_listed";
}

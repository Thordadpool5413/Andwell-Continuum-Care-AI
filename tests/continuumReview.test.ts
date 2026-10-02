import { describe, expect, it } from "vitest";
import { runContinuumReview } from "../src/engine/continuumReview.js";
import {
  ANDWELL_SERVICES,
  getServiceAvailability,
} from "../src/registry/andwellServices.js";

describe("Andwell continuum review", () => {
  it("surfaces palliative medicine from serious illness plus symptom burden", () => {
    const result = runContinuumReview({
      facts: [
        { id: "dx-1", category: "diagnosis", status: "present", text: "Advanced CHF documented.", source: { documentId: "synthetic-1", locator: "p.2" } },
        { id: "sx-1", category: "symptom", status: "present", text: "Persistent dyspnea and fatigue.", source: { documentId: "synthetic-1", locator: "p.5" } },
        { id: "u-1", category: "utilization", status: "present", text: "Multiple hospitalizations during the prior five months." },
      ],
      context: {
        county: "Cumberland County",
        payer: "Traditional Medicare",
        currentServiceIds: ["home-health"],
        activePrograms: [],
      },
    });

    const item = result.opportunities.find((x) => x.serviceId === "palliative-medicine");
    expect(item).toBeDefined();
    expect(item?.availability).toBe("available");
    expect(item?.eligibilityDetermined).toBe(false);
    expect(item?.humanReviewRequired).toBe(true);
  });

  it("does not treat not documented as positive evidence", () => {
    const result = runContinuumReview({
      facts: [
        { id: "c-1", category: "cognitive", status: "not_documented", text: "Dementia not documented." },
      ],
      context: { currentServiceIds: [], activePrograms: [] },
    });

    expect(result.opportunities.some((x) => x.serviceId === "guide")).toBe(false);
  });

  it("suppresses the current service", () => {
    const result = runContinuumReview({
      facts: [
        { id: "c-1", category: "cognitive", status: "present", text: "Documented Alzheimer dementia with memory loss." },
      ],
      context: { currentServiceIds: ["guide"], activePrograms: [] },
    });

    expect(result.opportunities.some((x) => x.serviceId === "guide")).toBe(false);
  });

  it("puts a potential GUIDE exclusion on review hold rather than denying", () => {
    const result = runContinuumReview({
      facts: [
        { id: "c-1", category: "diagnosis", status: "present", text: "Documented dementia." },
      ],
      context: {
        payer: "Traditional Medicare",
        currentServiceIds: [],
        activePrograms: ["Active hospice benefit"],
      },
    });

    const guide = result.opportunities.find((x) => x.serviceId === "guide");
    expect(guide?.status).toBe("review_hold");
    expect(guide?.potentialExclusions).toContain("active hospice");
    expect(guide?.eligibilityDetermined).toBe(false);
  });

  it("requires multiple independent hospice signals", () => {
    const one = runContinuumReview({
      facts: [
        { id: "d-1", category: "diagnosis", status: "present", text: "Advanced metastatic cancer." },
      ],
      context: { currentServiceIds: [], activePrograms: [] },
    });
    expect(one.opportunities.some((x) => x.serviceId === "hospice-home-care")).toBe(false);

    const two = runContinuumReview({
      facts: [
        { id: "d-1", category: "diagnosis", status: "present", text: "Advanced metastatic cancer." },
        { id: "f-1", category: "functional", status: "present", text: "Progressive functional decline with increased dependence." },
      ],
      context: { currentServiceIds: [], activePrograms: [] },
    });
    expect(two.opportunities.some((x) => x.serviceId === "hospice-home-care")).toBe(true);
  });

  it("screens wound care", () => {
    const result = runContinuumReview({
      facts: [
        { id: "w-1", category: "wound", status: "present", text: "Chronic non-healing lower-extremity wound." },
      ],
      context: { currentServiceIds: [], activePrograms: [] },
    });

    expect(result.opportunities.some((x) => x.serviceId === "mobile-wound")).toBe(true);
  });

  it("uses county only as an availability screen", () => {
    const service = ANDWELL_SERVICES.find((x) => x.id === "mobile-wound");
    expect(service).toBeDefined();
    expect(getServiceAvailability(service!, "Cumberland County")).toBe("available");
    expect(getServiceAvailability(service!, "Aroostook County")).toBe("not_listed");
    expect(getServiceAvailability(service!)).toBe("verify");
  });

  it("keeps service IDs unique and every service human-routed", () => {
    const ids = ANDWELL_SERVICES.map((service) => service.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const service of ANDWELL_SERVICES) {
      expect(service.reviewerRole.length).toBeGreaterThan(0);
      expect(service.eligibilityChecks.length).toBeGreaterThan(0);
      expect(service.sourceUrl.startsWith("https://andwell.org/")).toBe(true);
    }
  });
});

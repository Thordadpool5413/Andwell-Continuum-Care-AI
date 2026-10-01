import type { ClinicalFact } from "../domain/contracts.js";

export interface ClinicalExtractionResult {
  facts: ClinicalFact[];
  model: string;
  humanReviewRequired: true;
}

export class OpenAIClinicalExtractor {
  async extract(_syntheticRecordText: string): Promise<ClinicalExtractionResult> {
    throw new Error(
      "OpenAI clinical extraction is intentionally disabled in the standalone MVP until the approved production adapter and evidence contract are implemented.",
    );
  }
}

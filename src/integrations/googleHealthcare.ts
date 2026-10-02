export interface FhirReference {
  resourceType: string;
  id: string;
}

export interface PatientClinicalProjection {
  patient: FhirReference;
  encounter?: FhirReference;
  sourceRevision: string;
  resourceRefs: FhirReference[];
}

export interface HealthcareDataSource {
  loadPatientProjection(patientId: string): Promise<PatientClinicalProjection>;
}

export class GoogleHealthcareDataSource implements HealthcareDataSource {
  async loadPatientProjection(_patientId: string): Promise<PatientClinicalProjection> {
    throw new Error(
      "Google Healthcare integration is intentionally disabled in the standalone MVP.",
    );
  }
}

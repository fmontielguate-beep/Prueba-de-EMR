
export interface ParentInfo {
  name: string;
  age: number | '';
  profession: string;
}

export type MilestoneCategory = 'motor' | 'language' | 'social' | 'cognitive';

// Added Vaccine interface for AAP schedule
export interface Vaccine {
  id: string;
  name: string;
  dose: string;
  recommendedAge: string;
  offsetMonths: number;
}

// Added Milestone interface for development tracking
export interface Milestone {
  id: string;
  ageGroup: string;
  category: MilestoneCategory;
  description: string;
}

export interface MilestoneData {
  achievedAge: string;
  status: 'normal' | 'abnormal';
}

export interface MedicalHistory {
  perinatal: {
    gestationalAge: string;
    birthWeight: string;
    deliveryType: string;
    birthComplications: string;
    apgar: string;
  };
  pathological: {
    allergies: string;
    hospitalizations: string;
    surgeries: string;
    medications: string;
  };
  family: {
    diabetes: boolean;
    hypertension: boolean;
    asthma: boolean;
    other: string;
  };
}

export interface OtherVaccine {
  id: string;
  name: string;
  date: string;
  notes?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  address: string;
  phone: string;
  email: string;
  nit: string;
  father: ParentInfo;
  mother: ParentInfo;
  history: MedicalHistory;
  vaccines: Record<string, string>;
  otherVaccines: OtherVaccine[];
  milestones: Record<string, MilestoneData>;
}

export interface ClinicalDiagnosis {
  id: string;
  assessment: string;
  treatment: string;
  educationalPlan: string;
  labRequests: string;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  diagnoses: ClinicalDiagnosis[];
}

export interface VitalSigns {
  weightKg: string;
  heightCm: string;
  headCircumferenceCm: string;
  oxygenSaturation: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  bloodPressure?: string;
}

export type LabCategory = 'blood' | 'urine' | 'stool' | 'radiology' | 'other';

export interface LabResult {
  id: string;
  category: LabCategory;
  testName: string;
  result: string;
  date: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  date: string;
  patientAge: string;
  vitalSigns: VitalSigns;
  labResults?: LabResult[];
  soap: SoapNote;
  aiAnalysis?: string;
}

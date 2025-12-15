export interface ParentInfo {
  name: string;
  age: number | '';
  profession: string;
}

export type MilestoneCategory = 'motor' | 'language' | 'social' | 'cognitive';

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
  gender: 'male' | 'female' | 'other'; // Added gender for growth charts
  dob: string;
  address: string;
  phone: string;
  email: string;
  nit: string;
  father: ParentInfo;
  mother: ParentInfo;
  history: MedicalHistory;
  vaccines: Record<string, string>; // VaccineID -> Date string
  otherVaccines: OtherVaccine[]; // Added for custom vaccines
  milestones: Record<string, MilestoneData>;
}

export interface Vaccine {
  id: string;
  name: string;
  dose: string;
  recommendedAge: string;
  offsetMonths: number;
}

export interface Milestone {
  id: string;
  ageGroup: string;
  description: string;
  category: MilestoneCategory;
}

export interface VitalSigns {
  weightKg: string;
  heightCm: string;
  headCircumferenceCm: string;
  oxygenSaturation: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  bloodPressure?: string; // Added field
}

export type LabCategory = 'blood' | 'urine' | 'stool' | 'radiology' | 'other';

export interface LabResult {
  id: string;
  category: LabCategory;
  testName: string;
  result: string;
  date: string;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  date: string;
  patientAge: string;
  vitalSigns: VitalSigns; // Added vitals to consultation
  labResults?: LabResult[]; // Added lab results
  soap: SoapNote;
  aiAnalysis?: string;
}
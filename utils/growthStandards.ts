// utils/growthStandards.ts

// DATA SOURCES:
// 1. WHO Child Growth Standards (0-5 years)
// 2. CDC 2000 Growth Charts (> 5 years)
// 3. AAP 2017 for Blood Pressure

interface LMS {
  L: number;
  M: number;
  S: number;
}

interface GrowthDataPoint {
  key: number; // Can be Month (for Age-based) or Cm (for Length-based)
  l: number;
  m: number;
  s: number;
}

// ----------------------------------------------------------------------
// 1. AGE-BASED STANDARDS (P/E, T/E, CC/E)
// ----------------------------------------------------------------------

// Weight-for-age Boys (0-24m WHO, 2-20y CDC)
const WFA_BOYS: GrowthDataPoint[] = [
  { key: 0, l: 0.1815, m: 3.346, s: 0.127 }, { key: 1, l: 0.160, m: 4.47, s: 0.13 },
  { key: 3, l: 0.1132, m: 6.421, s: 0.123 }, { key: 6, l: 0.063, m: 7.939, s: 0.119 },
  { key: 12, l: 0.005, m: 9.683, s: 0.114 }, { key: 24, l: -0.16, m: 12.7, s: 0.11 }, // Switch to CDC approx
  { key: 36, l: -0.22, m: 14.7, s: 0.11 }, { key: 48, l: -0.28, m: 16.7, s: 0.12 },
  { key: 60, l: -0.34, m: 18.7, s: 0.12 }, { key: 72, l: -0.40, m: 21.0, s: 0.13 },
  { key: 84, l: -0.46, m: 23.5, s: 0.13 }, { key: 96, l: -0.52, m: 26.1, s: 0.14 },
  { key: 108, l: -0.58, m: 29.3, s: 0.15 }, { key: 120, l: -0.64, m: 32.9, s: 0.16 },
  { key: 144, l: -0.76, m: 41.5, s: 0.17 }, { key: 168, l: -0.88, m: 53.0, s: 0.17 }
];

const WFA_GIRLS: GrowthDataPoint[] = [
  { key: 0, l: 0.1548, m: 3.232, s: 0.135 }, { key: 1, l: 0.135, m: 4.18, s: 0.13 },
  { key: 3, l: 0.0637, m: 5.859, s: 0.128 }, { key: 6, l: 0.0075, m: 7.297, s: 0.123 },
  { key: 12, l: -0.055, m: 8.951, s: 0.119 }, { key: 24, l: -0.46, m: 12.1, s: 0.12 },
  { key: 36, l: -0.52, m: 14.2, s: 0.13 }, { key: 48, l: -0.58, m: 16.2, s: 0.14 },
  { key: 60, l: -0.64, m: 18.2, s: 0.15 }, { key: 72, l: -0.70, m: 20.5, s: 0.16 },
  { key: 84, l: -0.76, m: 23.0, s: 0.17 }, { key: 120, l: -0.9, m: 34.0, s: 0.18 },
  { key: 168, l: -1.1, m: 52.0, s: 0.16 }
];

// Height-for-age Boys (0-24m WHO, 2-20y CDC)
const HFA_BOYS: GrowthDataPoint[] = [
  { key: 0, l: 1, m: 49.88, s: 0.038 }, { key: 6, l: 1, m: 67.62, s: 0.032 },
  { key: 12, l: 1, m: 75.75, s: 0.033 }, { key: 24, l: 1, m: 86.5, s: 0.04 },
  { key: 36, l: 1, m: 95.0, s: 0.04 }, { key: 48, l: 1, m: 103.0, s: 0.04 },
  { key: 60, l: 1, m: 109.5, s: 0.04 }, { key: 72, l: 1, m: 116.0, s: 0.04 },
  { key: 84, l: 1, m: 122.0, s: 0.04 }, { key: 96, l: 1, m: 128.0, s: 0.04 },
  { key: 108, l: 1, m: 133.5, s: 0.04 }, { key: 120, l: 1, m: 138.5, s: 0.04 },
  { key: 144, l: 1, m: 149.0, s: 0.05 }, { key: 168, l: 1, m: 164.0, s: 0.04 }
];

const HFA_GIRLS: GrowthDataPoint[] = [
  { key: 0, l: 1, m: 49.15, s: 0.038 }, { key: 6, l: 1, m: 65.73, s: 0.032 },
  { key: 12, l: 1, m: 74.02, s: 0.033 }, { key: 24, l: 1, m: 85.5, s: 0.04 },
  { key: 36, l: 1, m: 94.0, s: 0.04 }, { key: 48, l: 1, m: 102.5, s: 0.04 },
  { key: 60, l: 1, m: 109.0, s: 0.04 }, { key: 72, l: 1, m: 115.5, s: 0.04 },
  { key: 84, l: 1, m: 121.5, s: 0.04 }, { key: 96, l: 1, m: 127.5, s: 0.04 },
  { key: 120, l: 1, m: 139.0, s: 0.04 }, { key: 144, l: 1, m: 152.0, s: 0.04 },
  { key: 168, l: 1, m: 161.0, s: 0.04 }
];

// Head Circumference Boys (WHO 0-5y)
const HC_BOYS: GrowthDataPoint[] = [
  { key: 0, l: 1, m: 34.46, s: 0.038 }, { key: 3, l: 1, m: 40.5, s: 0.032 },
  { key: 6, l: 1, m: 43.25, s: 0.030 }, { key: 12, l: 1, m: 46.06, s: 0.027 },
  { key: 24, l: 1, m: 48.31, s: 0.026 }, { key: 36, l: 1, m: 49.5, s: 0.027 },
  { key: 60, l: 1, m: 50.8, s: 0.028 }
];

const HC_GIRLS: GrowthDataPoint[] = [
  { key: 0, l: 1, m: 33.87, s: 0.038 }, { key: 3, l: 1, m: 39.5, s: 0.032 },
  { key: 6, l: 1, m: 42.06, s: 0.030 }, { key: 12, l: 1, m: 44.73, s: 0.027 },
  { key: 24, l: 1, m: 47.11, s: 0.026 }, { key: 36, l: 1, m: 48.5, s: 0.027 },
  { key: 60, l: 1, m: 50.0, s: 0.028 }
];

// ----------------------------------------------------------------------
// 2. WEIGHT-FOR-LENGTH/HEIGHT STANDARDS (P/T)
// ----------------------------------------------------------------------
// Critical for independent analysis of wasting vs stunting.
// Range 45cm to 120cm (covers approx 0-5 years)

const WFH_BOYS: GrowthDataPoint[] = [
  { key: 45, l: 0.85, m: 2.4, s: 0.08 }, { key: 50, l: 0.85, m: 3.4, s: 0.08 },
  { key: 55, l: 0.85, m: 4.5, s: 0.08 }, { key: 60, l: 0.85, m: 5.7, s: 0.08 },
  { key: 65, l: 0.85, m: 7.0, s: 0.08 }, { key: 70, l: 0.85, m: 8.3, s: 0.08 },
  { key: 75, l: 0.85, m: 9.5, s: 0.08 }, { key: 80, l: 0.85, m: 10.7, s: 0.08 },
  { key: 85, l: 0.85, m: 11.9, s: 0.08 }, { key: 90, l: 0.85, m: 13.2, s: 0.08 },
  { key: 95, l: 0.85, m: 14.5, s: 0.08 }, { key: 100, l: 0.85, m: 15.9, s: 0.08 },
  { key: 105, l: 0.85, m: 17.4, s: 0.08 }, { key: 110, l: 0.85, m: 19.0, s: 0.08 },
  { key: 120, l: 0.85, m: 22.4, s: 0.09 }
];

const WFH_GIRLS: GrowthDataPoint[] = [
  { key: 45, l: 0.85, m: 2.4, s: 0.08 }, { key: 50, l: 0.85, m: 3.2, s: 0.08 },
  { key: 55, l: 0.85, m: 4.2, s: 0.08 }, { key: 60, l: 0.85, m: 5.4, s: 0.08 },
  { key: 65, l: 0.85, m: 6.6, s: 0.08 }, { key: 70, l: 0.85, m: 7.8, s: 0.08 },
  { key: 75, l: 0.85, m: 9.0, s: 0.08 }, { key: 80, l: 0.85, m: 10.2, s: 0.08 },
  { key: 85, l: 0.85, m: 11.4, s: 0.08 }, { key: 90, l: 0.85, m: 12.7, s: 0.08 },
  { key: 95, l: 0.85, m: 14.0, s: 0.08 }, { key: 100, l: 0.85, m: 15.4, s: 0.08 },
  { key: 105, l: 0.85, m: 17.0, s: 0.08 }, { key: 110, l: 0.85, m: 18.7, s: 0.08 },
  { key: 120, l: 0.85, m: 22.1, s: 0.09 }
];

// ----------------------------------------------------------------------
// UTILITIES
// ----------------------------------------------------------------------

const interpolateLMS = (data: GrowthDataPoint[], value: number): LMS => {
  if (value <= data[0].key) return { L: data[0].l, M: data[0].m, S: data[0].s };
  if (value >= data[data.length - 1].key) {
    const last = data[data.length - 1];
    return { L: last.l, M: last.m, S: last.s };
  }
  
  let i = 0;
  while (i < data.length - 1 && data[i+1].key < value) i++;
  
  const lower = data[i];
  const upper = data[i+1];
  
  const range = upper.key - lower.key;
  const progress = (value - lower.key) / range;

  const L = lower.l + (upper.l - lower.l) * progress;
  const M = lower.m + (upper.m - lower.m) * progress;
  const S = lower.s + (upper.s - lower.s) * progress;

  return { L, M, S };
};

const getLMS = (
  type: 'weightAge' | 'heightAge' | 'weightHeight' | 'hcAge', 
  gender: 'male' | 'female' | 'other', 
  key: number
): LMS => {
  if (gender === 'other') return { L: 0, M: 0, S: 0 }; 

  let table: GrowthDataPoint[] = [];

  if (type === 'weightAge') {
    table = gender === 'male' ? WFA_BOYS : WFA_GIRLS;
  } else if (type === 'heightAge') {
    table = gender === 'male' ? HFA_BOYS : HFA_GIRLS;
  } else if (type === 'hcAge') {
    table = gender === 'male' ? HC_BOYS : HC_GIRLS;
  } else if (type === 'weightHeight') {
    table = gender === 'male' ? WFH_BOYS : WFH_GIRLS;
  }

  return interpolateLMS(table, key);
};

export const calculateZScore = (
  type: 'weightAge' | 'heightAge' | 'weightHeight' | 'hcAge',
  gender: 'male' | 'female' | 'other',
  key: number, // Age in Months OR Height in CM
  value: number // The measurement value
): number => {
  if (!value || value <= 0) return 0;
  if (gender === 'other') return 0;
  
  const { L, M, S } = getLMS(type, gender, key);
  
  if (M === 0 || S === 0) return 0;

  // Box-Cox Transformation
  if (Math.abs(L) < 0.01) {
    return Math.log(value / M) / S;
  } else {
    return (Math.pow(value / M, L) - 1) / (L * S);
  }
};

export const calculateAgeInMonths = (dob: string): number => {
  if (!dob) return 0;
  const birth = new Date(dob);
  const now = new Date();
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += now.getMonth();
  
  const dayFraction = (now.getDate() - birth.getDate()) / 30;
  
  const total = months + dayFraction;
  return total > 0 ? total : 0;
};

// ----------------------------------------------------------------------
// COMPREHENSIVE GROWTH ANALYSIS
// ----------------------------------------------------------------------

interface IndicatorAnalysis {
  label: string;
  status: string;
  color: string;
  zScore: number;
}

export const analyzeGrowth = (
  gender: 'male' | 'female' | 'other',
  ageMonths: number,
  weight: number,
  height: number,
  hc: number
): { 
  wfa: IndicatorAnalysis | null, 
  hfa: IndicatorAnalysis | null, 
  wfh: IndicatorAnalysis | null,
  hca: IndicatorAnalysis | null
} => {
  if (gender === 'other') return { wfa: null, hfa: null, wfh: null, hca: null };

  // 1. Weight for Age (P/E) - Global Nutrition
  let wfa = null;
  if (weight > 0) {
    const z = calculateZScore('weightAge', gender, ageMonths, weight);
    let status = 'Normal';
    let color = 'text-green-600';
    if (z < -3) { status = 'Desnutrición Severa (P/E)'; color = 'text-red-700 font-bold'; }
    else if (z < -2) { status = 'Desnutrición (P/E)'; color = 'text-red-600 font-bold'; }
    else if (z > 2) { status = 'Peso Elevado (P/E)'; color = 'text-orange-600'; }
    
    wfa = { label: 'Peso/Edad', status, color, zScore: z };
  }

  // 2. Height for Age (T/E) - Chronic Malnutrition
  let hfa = null;
  if (height > 0) {
    const z = calculateZScore('heightAge', gender, ageMonths, height);
    let status = 'Normal';
    let color = 'text-green-600';
    if (z < -3) { status = 'Talla Baja Severa'; color = 'text-red-700 font-bold'; }
    else if (z < -2) { status = 'Talla Baja (Crónica)'; color = 'text-red-600 font-bold'; }
    else if (z > 3) { status = 'Talla Alta'; color = 'text-blue-600'; }
    
    hfa = { label: 'Talla/Edad', status, color, zScore: z };
  }

  // 3. Weight for Height (P/T) - Acute Malnutrition (Wasting)
  // Only applicable if height is between 45 and 120 cm (approx 0-5 years)
  let wfh = null;
  if (weight > 0 && height >= 45 && height <= 120) {
    const z = calculateZScore('weightHeight', gender, height, weight);
    let status = 'Eutrófico (Adecuado)';
    let color = 'text-green-600';
    
    if (z < -3) { status = 'Desnutrición Aguda Severa'; color = 'text-red-700 font-bold'; }
    else if (z < -2) { status = 'Desnutrición Aguda'; color = 'text-red-600 font-bold'; }
    else if (z < -1) { status = 'Riesgo Desnutrición'; color = 'text-yellow-600'; }
    else if (z > 3) { status = 'Obesidad'; color = 'text-red-700 font-bold'; }
    else if (z > 2) { status = 'Sobrepeso'; color = 'text-orange-600 font-bold'; }
    else if (z > 1) { status = 'Riesgo Sobrepeso'; color = 'text-yellow-600'; }

    wfh = { label: 'Peso/Talla', status, color, zScore: z };
  }

  // 4. Head Circumference (CC/E)
  let hca = null;
  if (hc > 0 && ageMonths <= 60) {
    const z = calculateZScore('hcAge', gender, ageMonths, hc);
    let status = 'Normocéfalo';
    let color = 'text-green-600';
    
    if (z < -3) { status = 'Microcefalia Severa'; color = 'text-red-700 font-bold'; }
    else if (z < -2) { status = 'Microcefalia'; color = 'text-red-600 font-bold'; }
    else if (z > 3) { status = 'Macrocefalia Severa'; color = 'text-red-700 font-bold'; }
    else if (z > 2) { status = 'Macrocefalia'; color = 'text-orange-600'; }

    hca = { label: 'CC/Edad', status, color, zScore: z };
  }

  return { wfa, hfa, wfh, hca };
};

// ----------------------------------------------------------------------
// BLOOD PRESSURE (Existing logic maintained)
// ----------------------------------------------------------------------
const BP_COEFFS = {
  male: {
    sys: {
      alpha: 102.19768,
      beta: [1.824298, 0.127775, 0.0024961, -0.0013507], 
      gamma: [2.735038, -0.357675, 0.181727, -0.0439845] 
    },
    dia: {
      alpha: 61.0104,
      beta: [0.683800, -0.098350, 0.017113, 0.0004593],
      gamma: [1.469936, -0.078492, 0.113502, -0.0097425]
    }
  },
  female: {
    sys: {
      alpha: 102.01027,
      beta: [1.943970, 0.0059838, -0.0078961, -0.0005952],
      gamma: [2.035264, 0.025349, -0.018845, 0.012124]
    },
    dia: {
      alpha: 60.5051,
      beta: [1.013010, 0.011572, 0.0042426, -0.0013781],
      gamma: [1.166411, 0.127952, -0.038084, -0.0102054]
    }
  }
};

const calculateExpectedBP = (
  sex: 'male' | 'female',
  ageYears: number,
  heightZ: number,
  type: 'sys' | 'dia'
): number => {
  const c = BP_COEFFS[sex][type];
  const a = ageYears - 10;
  const h = Math.max(-3, Math.min(3, heightZ));

  let val = c.alpha;
  val += c.beta[0] * a;
  val += c.beta[1] * Math.pow(a, 2);
  val += c.beta[2] * Math.pow(a, 3);
  val += c.beta[3] * Math.pow(a, 4);

  val += c.gamma[0] * h;
  val += c.gamma[1] * Math.pow(h, 2);
  val += c.gamma[2] * Math.pow(h, 3);
  val += c.gamma[3] * Math.pow(h, 4);

  return val;
};

export const analyzeBloodPressure = (
  gender: 'male' | 'female' | 'other',
  ageMonths: number,
  heightCm: number,
  sys: number,
  dia: number
): { status: string; color: string; detail: string } | null => {
  if (gender === 'other' || !heightCm || !sys || !dia) return null;
  const ageYears = ageMonths / 12;

  if (ageYears >= 13) {
    if (sys >= 140 || dia >= 90) return { status: 'HTN Nivel 2', color: 'text-red-700 font-bold', detail: '≥140/90' };
    if (sys >= 130 || dia >= 80) return { status: 'HTN Nivel 1', color: 'text-red-600 font-bold', detail: '130-139/80-89' };
    if (sys >= 120 && sys < 130 && dia < 80) return { status: 'Elevada', color: 'text-yellow-600 font-bold', detail: '120-129/<80' };
    return { status: 'Normal', color: 'text-green-600', detail: '<120/80' };
  }

  if (ageYears < 1) return null; 

  const hZ = calculateZScore('heightAge', gender, ageMonths, heightCm);
  const expectedMeanSys = calculateExpectedBP(gender, ageYears, hZ, 'sys');
  const expectedMeanDia = calculateExpectedBP(gender, ageYears, hZ, 'dia');
  
  const sdSys = 10.5; 
  const sdDia = 10.5;

  const p90Sys = expectedMeanSys + 1.28 * sdSys;
  const p95Sys = expectedMeanSys + 1.645 * sdSys;
  const p95Plus12Sys = p95Sys + 12;

  const p90Dia = expectedMeanDia + 1.28 * sdDia;
  const p95Dia = expectedMeanDia + 1.645 * sdDia;
  const p95Plus12Dia = p95Dia + 12;

  if (sys >= p95Plus12Sys || dia >= p95Plus12Dia || sys >= 140 || dia >= 90) {
    return { status: 'HTN Nivel 2', color: 'text-red-700 font-bold', detail: '>95th + 12mmHg' };
  }
  if (sys >= p95Sys || dia >= p95Dia) {
    return { status: 'HTN Nivel 1', color: 'text-red-600 font-bold', detail: '95th-99th Percentil' };
  }
  if (sys >= p90Sys || dia >= p90Dia) {
    return { status: 'Elevada', color: 'text-yellow-600 font-bold', detail: '90th-95th Percentil' };
  }

  return { status: 'Normal', color: 'text-green-600', detail: '<90th Percentil' };
};
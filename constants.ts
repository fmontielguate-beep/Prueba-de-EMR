import { Vaccine, Milestone } from './types';

export const VACCINES_AAP: Vaccine[] = [
  // Birth to 15 months
  { id: 'hepb-1', name: 'Hepatitis B (1ra)', dose: '1', recommendedAge: 'Nacimiento', offsetMonths: 0 },
  { id: 'hepb-2', name: 'Hepatitis B (2da)', dose: '2', recommendedAge: '1-2 meses', offsetMonths: 1 },
  { id: 'hepb-3', name: 'Hepatitis B (3ra)', dose: '3', recommendedAge: '6-18 meses', offsetMonths: 6 },
  
  { id: 'rv-1', name: 'Rotavirus (RV)', dose: '1', recommendedAge: '2 meses', offsetMonths: 2 },
  { id: 'rv-2', name: 'Rotavirus (RV)', dose: '2', recommendedAge: '4 meses', offsetMonths: 4 },
  { id: 'rv-3', name: 'Rotavirus (RV)', dose: '3', recommendedAge: '6 meses', offsetMonths: 6 }, // RotaTeq requires 3 doses

  { id: 'dtap-1', name: 'DTaP (1ra)', dose: '1', recommendedAge: '2 meses', offsetMonths: 2 },
  { id: 'dtap-2', name: 'DTaP (2da)', dose: '2', recommendedAge: '4 meses', offsetMonths: 4 },
  { id: 'dtap-3', name: 'DTaP (3ra)', dose: '3', recommendedAge: '6 meses', offsetMonths: 6 },
  { id: 'dtap-4', name: 'DTaP (4ta)', dose: '4', recommendedAge: '15-18 meses', offsetMonths: 15 },

  { id: 'hib-1', name: 'Hib (1ra)', dose: '1', recommendedAge: '2 meses', offsetMonths: 2 },
  { id: 'hib-2', name: 'Hib (2da)', dose: '2', recommendedAge: '4 meses', offsetMonths: 4 },
  { id: 'hib-3', name: 'Hib (3ra)', dose: '3', recommendedAge: '6 meses', offsetMonths: 6 },
  { id: 'hib-4', name: 'Hib (Refuerzo)', dose: '4', recommendedAge: '12-15 meses', offsetMonths: 12 },

  { id: 'pcv-1', name: 'Neumococo (1ra)', dose: '1', recommendedAge: '2 meses', offsetMonths: 2 },
  { id: 'pcv-2', name: 'Neumococo (2da)', dose: '2', recommendedAge: '4 meses', offsetMonths: 4 },
  { id: 'pcv-3', name: 'Neumococo (3ra)', dose: '3', recommendedAge: '6 meses', offsetMonths: 6 },
  { id: 'pcv-4', name: 'Neumococo (Refuerzo)', dose: '4', recommendedAge: '12-15 meses', offsetMonths: 12 },

  { id: 'ipv-1', name: 'Polio (1ra)', dose: '1', recommendedAge: '2 meses', offsetMonths: 2 },
  { id: 'ipv-2', name: 'Polio (2da)', dose: '2', recommendedAge: '4 meses', offsetMonths: 4 },
  { id: 'ipv-3', name: 'Polio (3ra)', dose: '3', recommendedAge: '6-18 meses', offsetMonths: 6 },

  { id: 'flu-1', name: 'Influenza (Anual)', dose: '1', recommendedAge: '> 6 meses', offsetMonths: 6 },
  
  { id: 'mmr-1', name: 'Sarampión, Rubeola, Paperas', dose: '1', recommendedAge: '12-15 meses', offsetMonths: 12 },
  { id: 'var-1', name: 'Varicela', dose: '1', recommendedAge: '12-15 meses', offsetMonths: 12 },
  { id: 'hepa-1', name: 'Hepatitis A (1ra)', dose: '1', recommendedAge: '12-23 meses', offsetMonths: 12 },
  { id: 'hepa-2', name: 'Hepatitis A (2da)', dose: '2', recommendedAge: '+6 meses de 1ra', offsetMonths: 18 },

  // 4 - 6 Years
  { id: 'dtap-5', name: 'DTaP (Refuerzo)', dose: '5', recommendedAge: '4-6 años', offsetMonths: 48 },
  { id: 'ipv-4', name: 'Polio (Refuerzo)', dose: '4', recommendedAge: '4-6 años', offsetMonths: 48 },
  { id: 'mmr-2', name: 'Sarampión, Rubeola, Paperas', dose: '2', recommendedAge: '4-6 años', offsetMonths: 48 },
  { id: 'var-2', name: 'Varicela', dose: '2', recommendedAge: '4-6 años', offsetMonths: 48 },

  // 11 - 12 Years
  { id: 'tdap-1', name: 'Tdap (Adolescente)', dose: '1', recommendedAge: '11-12 años', offsetMonths: 132 },
  { id: 'menacwy-1', name: 'Meningococo ACWY', dose: '1', recommendedAge: '11-12 años', offsetMonths: 132 },
  { id: 'hpv-1', name: 'VPH (1ra)', dose: '1', recommendedAge: '11-12 años', offsetMonths: 132 },
  { id: 'hpv-2', name: 'VPH (2da)', dose: '2', recommendedAge: '+6-12 meses', offsetMonths: 138 },

  // 16 Years
  { id: 'menacwy-2', name: 'Meningococo ACWY', dose: '2', recommendedAge: '16 años', offsetMonths: 192 },
  { id: 'menb-1', name: 'Meningococo B (Opcional)', dose: '1', recommendedAge: '16-18 años', offsetMonths: 192 },
];

export const MILESTONES: Milestone[] = [
  { id: 'm-2mo-1', ageGroup: '2 Meses', category: 'social', description: 'Sonríe a las personas' },
  { id: 'm-2mo-2', ageGroup: '2 Meses', category: 'cognitive', description: 'Puede calmarse brevemente (se chupa la mano)' },
  { id: 'm-2mo-3', ageGroup: '2 Meses', category: 'motor', description: 'Trata de mirar a sus padres (Control cefálico)' },
  { id: 'm-4mo-1', ageGroup: '4 Meses', category: 'social', description: 'Sonríe espontáneamente' },
  { id: 'm-4mo-2', ageGroup: '4 Meses', category: 'social', description: 'Le gusta jugar con la gente' },
  { id: 'm-4mo-3', ageGroup: '4 Meses', category: 'motor', description: 'Copia algunos movimientos y gestos faciales' },
  { id: 'm-6mo-1', ageGroup: '6 Meses', category: 'cognitive', description: 'Reconoce caras familiares' },
  { id: 'm-6mo-2', ageGroup: '6 Meses', category: 'social', description: 'Le gusta mirarse en el espejo' },
  { id: 'm-6mo-3', ageGroup: '6 Meses', category: 'motor', description: 'Se sienta sin apoyo' },
  { id: 'm-9mo-1', ageGroup: '9 Meses', category: 'social', description: 'Tiene miedo a los desconocidos' },
  { id: 'm-9mo-2', ageGroup: '9 Meses', category: 'language', description: 'Entiende el "no"' },
  { id: 'm-1y-1', ageGroup: '1 Año', category: 'motor', description: 'Se pone de pie agarrándose' },
  { id: 'm-1y-2', ageGroup: '1 Año', category: 'motor', description: 'Puede dar unos pasos sin apoyo' },
  { id: 'm-1y-3', ageGroup: '1 Año', category: 'language', description: 'Dice "mamá" o "papá"' },
  { id: 'm-2y-1', ageGroup: '2 Años', category: 'motor', description: 'Patea una pelota' },
  { id: 'm-2y-2', ageGroup: '2 Años', category: 'language', description: 'Dice frases de 2 a 4 palabras' },
  { id: 'm-3y-1', ageGroup: '3 Años', category: 'cognitive', description: 'Puede armar rompecabezas de 3 o 4 piezas' },
  { id: 'm-4y-1', ageGroup: '4 Años', category: 'social', description: 'Juega a "mamá" y "papá"' },
];
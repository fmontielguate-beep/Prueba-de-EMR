
// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { SoapNote } from "../types";

/**
 * Analyzes a SOAP note using Gemini 3 Pro to provide clinical insights and recommendations.
 */
export const analyzeSoapNote = async (note: SoapNote, patientSummary: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Error: API Key no configurada. No se puede realizar el análisis.";

  // Fix: Create the client instance right before the call to ensure fresh configuration
  const ai = new GoogleGenAI({ apiKey });

  // Fix: Extract assessment and plan details from the diagnoses array within the SoapNote
  const diagnosisDetails = note.diagnoses.map((d, i) => `
    Diagnóstico ${i + 1}:
    - Impresión Clínica (Assessment): ${d.assessment}
    - Tratamiento: ${d.treatment}
    - Plan Educacional: ${d.educationalPlan}
    - Laboratorios: ${d.labRequests}
  `).join('\n');

  const prompt = `
    Actúa como un asistente médico pediátrico experto.
    Analiza la siguiente nota clínica basada en el método de Weed (SOAP) para el paciente: ${patientSummary}.

    Nota SOAP:
    Subjetivo: ${note.subjective}
    Objetivo: ${note.objective}
    
    Resumen de Diagnósticos y Planes:
    ${diagnosisDetails}

    Por favor provee:
    1. Un resumen breve y formal del caso.
    2. Sugerencias si detectas alguna inconsistencia o falta de información crítica basada en los datos (como discrepancias entre vitales y sospecha clínica).
    3. Recomendaciones generales basadas en guías clínicas estándar (AAP/OMS).

    Mantén un tono profesional y médico.
  `;

  try {
    // Fix: Use gemini-3-pro-preview for complex medical reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Fix: Use .text property instead of text() method as per guidelines
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error al conectar con el servicio de IA. Por favor intente más tarde.";
  }
};

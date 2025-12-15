import { GoogleGenAI } from "@google/genai";
import { SoapNote } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeSoapNote = async (note: SoapNote, patientSummary: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Error: API Key no configurada. No se puede realizar el análisis.";

  const prompt = `
    Actúa como un asistente médico pediátrico experto.
    Analiza la siguiente nota clínica basada en el método de Weed (SOAP) para el paciente: ${patientSummary}.

    Nota SOAP:
    Subjetivo: ${note.subjective}
    Objetivo: ${note.objective}
    Análisis (Assessment): ${note.assessment}
    Plan: ${note.plan}

    Por favor provee:
    1. Un resumen breve y formal del caso.
    2. Sugerencias si detectas alguna inconsistencia o falta de información crítica basada en los datos.
    3. Recomendaciones generales basadas en guías clínicas estándar (si aplica).

    Mantén un tono profesional y médico.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error al conectar con el servicio de IA. Por favor intente más tarde.";
  }
};

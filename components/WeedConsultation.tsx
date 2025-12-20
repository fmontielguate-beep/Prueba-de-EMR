
import React, { useState } from 'react';
import { SoapNote, Patient, VitalSigns, LabResult, ClinicalDiagnosis } from '../types';
import { Stethoscope, Sparkles, Save, Activity, Plus, Trash2, Pill, BookOpen, ClipboardList, Microscope } from 'lucide-react';
import { analyzeSoapNote } from '../services/geminiService';

interface Props {
  patient: Patient;
  onSave: (note: SoapNote, vitals: VitalSigns, labs: LabResult[], aiAnalysis?: string) => void;
}

const WeedConsultation: React.FC<Props> = ({ patient, onSave }) => {
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const [note, setNote] = useState<SoapNote>({
    subjective: '',
    objective: '',
    diagnoses: [{ id: generateId(), assessment: '', treatment: '', educationalPlan: '', labRequests: '' }]
  });
  
  const [vitals, setVitals] = useState<VitalSigns>({
    weightKg: '', heightCm: '', headCircumferenceCm: '', oxygenSaturation: '',
    temperature: '', heartRate: '', respiratoryRate: '', bloodPressure: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleDiagnosisChange = (id: string, field: keyof ClinicalDiagnosis, value: string) => {
    setNote(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const addDiagnosis = () => {
    setNote(prev => ({
      ...prev,
      diagnoses: [...prev.diagnoses, { id: generateId(), assessment: '', treatment: '', educationalPlan: '', labRequests: '' }]
    }));
  };

  const handleAIAnalysis = async () => {
    if (!note.subjective && !note.objective) return;
    setIsAnalyzing(true);
    const result = await analyzeSoapNote(note, `${patient.firstName} (${patient.dob})`);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Signos Vitales */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
           <h3 className="text-xs font-black text-slate-400 mb-4 uppercase flex items-center gap-2"><Activity className="text-red-500 w-4 h-4" /> Signos Vitales</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['weightKg', 'heightCm', 'temperature', 'bloodPressure'].map((f) => (
                <div key={f} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">{f}</label>
                  <input type="text" value={(vitals as any)[f]} onChange={(e) => setVitals({...vitals, [f]: e.target.value})} className="w-full bg-transparent border-b outline-none font-bold text-sm" />
                </div>
              ))}
           </div>
        </div>

        {/* SOAP S y O */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Stethoscope className="text-blue-500 w-4 h-4" /> Subjetivo y Objetivo</h3>
          <textarea value={note.subjective} onChange={(e) => setNote({...note, subjective: e.target.value})} placeholder="S: Motivo de consulta..." className="w-full h-24 p-4 rounded-xl border text-sm resize-none" />
          <textarea value={note.objective} onChange={(e) => setNote({...note, objective: e.target.value})} placeholder="O: Examen físico..." className="w-full h-24 p-4 rounded-xl border text-sm resize-none" />
        </div>

        {/* DIAGNÓSTICOS MÚLTIPLES */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><ClipboardList className="text-emerald-500 w-4 h-4" /> Impresión Clínica y Planes</h3>
             <button onClick={addDiagnosis} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"><Plus className="w-4 h-4" /> Añadir Diagnóstico</button>
          </div>

          {note.diagnoses.map((diag, index) => (
            <div key={diag.id} className="bg-white p-6 rounded-2xl border-2 border-emerald-50 shadow-sm relative animate-in slide-in-from-left-4">
               {note.diagnoses.length > 1 && (
                 <button onClick={() => setNote({...note, diagnoses: note.diagnoses.filter(d => d.id !== diag.id)})} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
               )}
               <div className="flex items-center gap-3 mb-4">
                  <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded flex items-center justify-center font-bold text-xs">{index+1}</span>
                  <input type="text" value={diag.assessment} onChange={(e) => handleDiagnosisChange(diag.id, 'assessment', e.target.value)} placeholder="Diagnóstico..." className="flex-1 border-b font-black text-sm uppercase outline-none" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Pill className="w-3 h-3 text-blue-500" /> Tratamiento</label>
                    <textarea value={diag.treatment} onChange={(e) => handleDiagnosisChange(diag.id, 'treatment', e.target.value)} placeholder="Medicamentos y dosis..." className="w-full h-24 p-3 rounded-xl border text-xs bg-slate-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><BookOpen className="w-3 h-3 text-orange-500" /> Plan Educacional</label>
                    <textarea value={diag.educationalPlan} onChange={(e) => handleDiagnosisChange(diag.id, 'educationalPlan', e.target.value)} placeholder="Indicaciones y alarmas..." className="w-full h-24 p-3 rounded-xl border text-xs bg-slate-50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Microscope className="w-3 h-3 text-purple-500" /> Estudios Solicitados</label>
                    <input type="text" value={diag.labRequests} onChange={(e) => handleDiagnosisChange(diag.id, 'labRequests', e.target.value)} className="w-full border-b text-xs outline-none" placeholder="Laboratorios, Rx..." />
                  </div>
               </div>
            </div>
          ))}
        </div>

        <button onClick={() => onSave(note, vitals, [], aiAnalysis || undefined)} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"><Save /> Guardar Consulta Completa</button>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          <button onClick={handleAIAnalysis} disabled={isAnalyzing} className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
            {isAnalyzing ? <span className="animate-spin">...</span> : <Sparkles className="w-5 h-5" />} Análisis IA
          </button>
          {aiAnalysis && (
             <div className="bg-white border-2 border-indigo-100 p-6 rounded-2xl shadow-xl animate-in zoom-in-95">
               <h4 className="text-indigo-900 font-bold text-xs uppercase mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Recomendaciones IA</h4>
               <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">{aiAnalysis}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeedConsultation;

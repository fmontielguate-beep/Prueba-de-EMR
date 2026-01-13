import React, { useState, useMemo } from 'react';
import { SoapNote, Patient, VitalSigns, LabResult, ClinicalDiagnosis } from '../types';
import { Stethoscope, Sparkles, Save, Activity, Plus, Trash2, Pill, BookOpen, ClipboardList, Microscope, Scale, Ruler, Brain, HeartPulse, Wind, TrendingUp, Search, Info } from 'lucide-react';
import { analyzeSoapNote } from '../services/geminiService';
import { calculateAgeInMonths, analyzeGrowth, analyzeBloodPressure } from '../utils/growthStandards';

interface Props {
  patient: Patient;
  onSave: (note: SoapNote, vitals: VitalSigns, labs: LabResult[], aiAnalysis?: string) => void;
  lastVitals?: VitalSigns | null;
}

const WeedConsultation: React.FC<Props> = ({ patient, onSave, lastVitals }) => {
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

  const biometrics = useMemo(() => {
    const ageMonths = calculateAgeInMonths(patient.dob);
    const weight = parseFloat(vitals.weightKg);
    const height = parseFloat(vitals.heightCm);
    const hc = parseFloat(vitals.headCircumferenceCm || '0');
    
    const growth = analyzeGrowth(patient.gender, ageMonths, weight, height, hc);

    let bpResult = null;
    if (vitals.bloodPressure && vitals.bloodPressure.includes('/')) {
      const [sys, dia] = vitals.bloodPressure.split('/').map(n => parseInt(n.trim()));
      if (sys && dia) {
        bpResult = analyzeBloodPressure(patient.gender, ageMonths, height, sys, dia);
      }
    }

    const bmi = (weight > 0 && height > 0) ? (weight / Math.pow(height/100, 2)).toFixed(1) : '--';

    return { growth, bpResult, bmi };
  }, [patient.dob, patient.gender, vitals]);

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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Activity className="text-red-500 w-4 h-4" /> Signos Vitales</h3>
              {lastVitals && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border border-blue-100">
                  <Info className="w-3 h-3" /> Último Peso: {lastVitals.weightKg} kg | Talla: {lastVitals.heightCm} cm
                </div>
              )}
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <VitalInput label="Peso (Kg)" value={vitals.weightKg} onChange={(v) => setVitals({...vitals, weightKg: v})} icon={<Scale className="w-3 h-3"/>} placeholder={lastVitals?.weightKg || '0.0'} />
              <VitalInput label="Talla (Cm)" value={vitals.heightCm} onChange={(v) => setVitals({...vitals, heightCm: v})} icon={<Ruler className="w-3 h-3"/>} placeholder={lastVitals?.heightCm || '0.0'} />
              <VitalInput label="C. Cefálica" value={vitals.headCircumferenceCm} onChange={(v) => setVitals({...vitals, headCircumferenceCm: v})} icon={<Brain className="w-3 h-3"/>} placeholder={lastVitals?.headCircumferenceCm || '0.0'} />
              <VitalInput label="T° (°C)" value={vitals.temperature} onChange={(v) => setVitals({...vitals, temperature: v})} icon={<HeartPulse className="w-3 h-3 text-red-400"/>} />
              <VitalInput label="Sat O2 (%)" value={vitals.oxygenSaturation} onChange={(v) => setVitals({...vitals, oxygenSaturation: v})} icon={<Wind className="w-3 h-3 text-sky-400"/>} />
              <VitalInput label="F.C." value={vitals.heartRate} onChange={(v) => setVitals({...vitals, heartRate: v})} icon={<HeartPulse className="w-3 h-3"/>} />
              <VitalInput label="F.R." value={vitals.respiratoryRate} onChange={(v) => setVitals({...vitals, respiratoryRate: v})} icon={<Wind className="w-3 h-3"/>} />
              <VitalInput label="P.A. (mmHg)" value={vitals.bloodPressure || ''} onChange={(v) => setVitals({...vitals, bloodPressure: v})} placeholder="110/70" icon={<Activity className="w-3 h-3"/>} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border">
              <PercentileTag analysis={biometrics.growth.wfa} />
              <PercentileTag analysis={biometrics.growth.hfa} />
              <PercentileTag analysis={biometrics.growth.wfh} />
              <div className="bg-white p-2.5 rounded-xl border shadow-sm">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Presión Arterial</p>
                {biometrics.bpResult ? (
                  <span className={`text-[10px] font-black uppercase ${biometrics.bpResult.color}`}>{biometrics.bpResult.status}</span>
                ) : <span className="text-[10px] text-slate-300 italic">--</span>}
              </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Stethoscope className="text-blue-500 w-4 h-4" /> Historia Clínica</h3>
          <div className="space-y-4">
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Subjetivo</label>
               <textarea value={note.subjective} onChange={(e) => setNote({...note, subjective: e.target.value})} placeholder="S: Motivo de consulta..." className="w-full h-32 p-4 rounded-2xl border bg-slate-50/30 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Objetivo</label>
               <textarea value={note.objective} onChange={(e) => setNote({...note, objective: e.target.value})} placeholder="O: Examen físico..." className="w-full h-32 p-4 rounded-2xl border bg-slate-50/30 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
             </div>
          </div>
        </div>

        <div className="space-y-4 pb-12">
          <div className="flex justify-between items-center px-4">
             <h3 className="text-xs font-black text-slate-400 uppercase"><ClipboardList className="inline w-4 h-4 mr-2" /> Diagnóstico y Plan</h3>
             <button onClick={addDiagnosis} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all">+ Diagnóstico</button>
          </div>

          {note.diagnoses.map((diag, index) => (
            <div key={diag.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-emerald-50 shadow-sm relative">
               <div className="absolute top-6 right-6">
                 {note.diagnoses.length > 1 && (
                   <button onClick={() => setNote({...note, diagnoses: note.diagnoses.filter(d => d.id !== diag.id)})} className="text-slate-300 hover:text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                 )}
               </div>
               <div className="flex items-center gap-4 mb-6">
                  <span className="bg-emerald-600 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm">{index+1}</span>
                  <input type="text" value={diag.assessment} onChange={(e) => handleDiagnosisChange(diag.id, 'assessment', e.target.value)} placeholder="DIAGNÓSTICO..." className="flex-1 border-b-2 font-black text-lg uppercase outline-none py-1 bg-transparent border-slate-100 focus:border-emerald-500" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tratamiento</label>
                    <textarea value={diag.treatment} onChange={(e) => handleDiagnosisChange(diag.id, 'treatment', e.target.value)} placeholder="Receta médica..." className="w-full h-32 p-4 rounded-2xl border text-xs bg-slate-50/50 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Plan Educativo / Alarmas</label>
                    <textarea value={diag.educationalPlan} onChange={(e) => handleDiagnosisChange(diag.id, 'educationalPlan', e.target.value)} placeholder="Instrucciones..." className="w-full h-32 p-4 rounded-2xl border text-xs bg-slate-50/50 outline-none" />
                  </div>
               </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[45] w-full max-w-lg px-6">
           <button onClick={() => onSave(note, vitals, [], aiAnalysis || undefined)} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest">
             <Save className="w-5 h-5" /> Finalizar y Guardar Consulta
           </button>
        </div>
      </div>

      <div className="lg:col-span-1 no-print">
        <div className="sticky top-24 space-y-4">
          <button onClick={handleAIAnalysis} disabled={isAnalyzing} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all">
            {isAnalyzing ? "Analizando..." : "Análisis IA"}
          </button>
          {aiAnalysis && (
             <div className="bg-white border-2 border-indigo-100 p-6 rounded-[2rem] shadow-xl">
               <h4 className="text-indigo-900 font-black text-[10px] uppercase mb-3 border-b pb-2">Resultados IA</h4>
               <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">{aiAnalysis}</p>
             </div>
          )}
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Nutrición (Z-Score)</h4>
             <div className="space-y-3">
               <SummaryItem label="P/E" analysis={biometrics.growth.wfa} />
               <SummaryItem label="T/E" analysis={biometrics.growth.hfa} />
               <SummaryItem label="P/T" analysis={biometrics.growth.wfh} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VitalInput = ({ label, value, onChange, icon, placeholder }: { label: string, value: string, onChange: (v: string) => void, icon: React.ReactNode, placeholder?: string }) => (
  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-blue-300 transition-all">
    <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5 mb-1">{icon} {label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || '0.0'} className="w-full bg-transparent border-none outline-none font-black text-lg text-slate-800" />
  </div>
);

const PercentileTag = ({ analysis }: { analysis: any }) => (
  <div className="bg-white p-2.5 rounded-xl border shadow-sm">
    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{analysis?.label || "---"}</p>
    <span className={`text-[10px] font-black uppercase ${analysis?.color || "text-slate-300"}`}>{analysis?.status || "Pendiente"}</span>
  </div>
);

const SummaryItem = ({ label, analysis }: { label: string, analysis: any }) => (
  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
    <span className="text-[10px] font-bold text-slate-500">{label}</span>
    <span className={`text-[10px] font-black ${analysis?.color || "text-slate-300"}`}>{analysis?.zScore.toFixed(1) || "--"}</span>
  </div>
);

export default WeedConsultation;
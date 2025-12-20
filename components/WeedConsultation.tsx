import React, { useState, useMemo } from 'react';
import { SoapNote, Patient, VitalSigns, LabResult, ClinicalDiagnosis } from '../types';
// Added TrendingUp to imports
import { Stethoscope, Sparkles, Save, Activity, Plus, Trash2, Pill, BookOpen, ClipboardList, Microscope, Scale, Ruler, Brain, HeartPulse, Wind, TrendingUp } from 'lucide-react';
import { analyzeSoapNote } from '../services/geminiService';
import { calculateAgeInMonths, analyzeGrowth, analyzeBloodPressure } from '../utils/growthStandards';

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

  // Biometric calculations in real-time
  const biometrics = useMemo(() => {
    const ageMonths = calculateAgeInMonths(patient.dob);
    const weight = parseFloat(vitals.weightKg);
    const height = parseFloat(vitals.heightCm);
    const hc = parseFloat(vitals.headCircumferenceCm || '0');
    
    // Growth analysis
    const growth = analyzeGrowth(patient.gender, ageMonths, weight, height, hc);

    // Blood pressure analysis
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
        
        {/* Panel de Signos Vitales y Biometría */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Activity className="text-red-500 w-4 h-4" /> Registro de Signos Vitales</h3>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                IMC: {biometrics.bmi}
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <VitalInput label="Peso (Kg)" value={vitals.weightKg} onChange={(v) => setVitals({...vitals, weightKg: v})} icon={<Scale className="w-3 h-3"/>} />
              <VitalInput label="Talla (Cm)" value={vitals.heightCm} onChange={(v) => setVitals({...vitals, heightCm: v})} icon={<Ruler className="w-3 h-3"/>} />
              <VitalInput label="C. Cefálica (Cm)" value={vitals.headCircumferenceCm} onChange={(v) => setVitals({...vitals, headCircumferenceCm: v})} icon={<Brain className="w-3 h-3"/>} />
              <VitalInput label="T° (°C)" value={vitals.temperature} onChange={(v) => setVitals({...vitals, temperature: v})} icon={<Activity className="w-3 h-3"/>} />
              <VitalInput label="Sat O2 (%)" value={vitals.oxygenSaturation} onChange={(v) => setVitals({...vitals, oxygenSaturation: v})} icon={<Wind className="w-3 h-3"/>} />
              <VitalInput label="F.C. (Lpm)" value={vitals.heartRate} onChange={(v) => setVitals({...vitals, heartRate: v})} icon={<HeartPulse className="w-3 h-3"/>} />
              <VitalInput label="F.R. (Rpm)" value={vitals.respiratoryRate} onChange={(v) => setVitals({...vitals, respiratoryRate: v})} icon={<Wind className="w-3 h-3"/>} />
              <VitalInput label="P.A. (mmHg)" value={vitals.bloodPressure || ''} onChange={(v) => setVitals({...vitals, bloodPressure: v})} placeholder="120/80" icon={<Activity className="w-3 h-3"/>} />
           </div>

           {/* Feedback de Percentiles y Z-Scores */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <PercentileTag analysis={biometrics.growth.wfa} />
              <PercentileTag analysis={biometrics.growth.hfa} />
              <PercentileTag analysis={biometrics.growth.wfh} />
              <div className="bg-white p-2.5 rounded-xl border shadow-sm">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Presión Arterial</p>
                {biometrics.bpResult ? (
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[10px] font-black uppercase ${biometrics.bpResult.color}`}>{biometrics.bpResult.status}</span>
                    <span className="text-[8px] text-slate-400">{biometrics.bpResult.detail}</span>
                  </div>
                ) : <span className="text-[10px] text-slate-300 font-bold italic">Esperando datos...</span>}
              </div>
           </div>
        </div>

        {/* SOAP S y O */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Stethoscope className="text-blue-500 w-4 h-4" /> Historia Clínica y Exploración Física</h3>
          <div className="space-y-4">
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subjetivo (Anamnesis)</label>
               <textarea value={note.subjective} onChange={(e) => setNote({...note, subjective: e.target.value})} placeholder="S: Motivo de consulta, evolución de síntomas, interrogatorio..." className="w-full h-32 p-4 rounded-2xl border bg-slate-50/30 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objetivo (Hallazgos Clínicos)</label>
               <textarea value={note.objective} onChange={(e) => setNote({...note, objective: e.target.value})} placeholder="O: Hallazgos positivos al examen físico por sistemas..." className="w-full h-32 p-4 rounded-2xl border bg-slate-50/30 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
             </div>
          </div>
        </div>

        {/* DIAGNÓSTICOS MÚLTIPLES */}
        <div className="space-y-4 pb-12">
          <div className="flex justify-between items-center px-4">
             <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><ClipboardList className="text-emerald-500 w-4 h-4" /> Impresión Clínica y Plan de Manejo</h3>
             <button onClick={addDiagnosis} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-100 transition-all active:scale-95"><Plus className="w-4 h-4" /> Nuevo Diagnóstico</button>
          </div>

          {note.diagnoses.map((diag, index) => (
            <div key={diag.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-emerald-50 shadow-sm relative animate-in slide-in-from-left-4 duration-500">
               {note.diagnoses.length > 1 && (
                 <button onClick={() => setNote({...note, diagnoses: note.diagnoses.filter(d => d.id !== diag.id)})} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 className="w-5 h-5" /></button>
               )}
               <div className="flex items-center gap-4 mb-6">
                  <span className="bg-emerald-600 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-md">{index+1}</span>
                  <input type="text" value={diag.assessment} onChange={(e) => handleDiagnosisChange(diag.id, 'assessment', e.target.value)} placeholder="Diagnóstico o Impresión Clínica..." className="flex-1 border-b-2 border-slate-100 focus:border-emerald-500 font-black text-lg uppercase outline-none py-1 bg-transparent transition-all" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5 tracking-widest ml-1"><Pill className="w-3.5 h-3.5 text-blue-500" /> Tratamiento (Dosis y Vía)</label>
                    <textarea value={diag.treatment} onChange={(e) => handleDiagnosisChange(diag.id, 'treatment', e.target.value)} placeholder="Ej: Acetaminofén 150mg/5ml: dar 5ml cada 6 horas por fiebre..." className="w-full h-32 p-4 rounded-2xl border text-xs bg-slate-50/50 focus:bg-white transition-all outline-none border-slate-100 focus:border-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5 tracking-widest ml-1"><BookOpen className="w-3.5 h-3.5 text-orange-500" /> Plan Educacional y Alarmas</label>
                    <textarea value={diag.educationalPlan} onChange={(e) => handleDiagnosisChange(diag.id, 'educationalPlan', e.target.value)} placeholder="Instrucciones a padres, medidas generales y signos de alerta para volver..." className="w-full h-32 p-4 rounded-2xl border text-xs bg-slate-50/50 focus:bg-white transition-all outline-none border-slate-100 focus:border-orange-400" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5 tracking-widest ml-1"><Microscope className="w-3.5 h-3.5 text-purple-500" /> Estudios Complementarios</label>
                    <input type="text" value={diag.labRequests} onChange={(e) => handleDiagnosisChange(diag.id, 'labRequests', e.target.value)} className="w-full border-b border-slate-200 py-2 text-sm outline-none focus:border-purple-500 transition-all" placeholder="Laboratorios, Rayos X, Ultrasonidos solicitados..." />
                  </div>
               </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[45] w-full max-w-lg px-6">
           <button onClick={() => onSave(note, vitals, [], aiAnalysis || undefined)} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 text-sm uppercase tracking-widest">
             <Save className="w-5 h-5" /> Finalizar y Guardar Consulta
           </button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          <button onClick={handleAIAnalysis} disabled={isAnalyzing} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all group overflow-hidden relative">
            {isAnalyzing ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" />}
            <span className="text-xs uppercase tracking-widest">Análisis Clínico IA</span>
          </button>
          
          {aiAnalysis && (
             <div className="bg-white border-2 border-indigo-100 p-6 rounded-[2rem] shadow-xl animate-in zoom-in-95 duration-500">
               <div className="flex items-center gap-2 mb-4 border-b pb-3">
                 <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><Sparkles className="w-4 h-4" /></div>
                 <h4 className="indigo-900 font-black text-[10px] uppercase tracking-widest">Insights PediaCare</h4>
               </div>
               <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed font-medium italic">{aiAnalysis}</p>
             </div>
          )}

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               {/* TrendingUp is now correctly imported */}
               <TrendingUp className="w-4 h-4 text-blue-500"/> Resumen Somatometría
             </h4>
             <div className="space-y-4">
               <SummaryItem label="Peso para Edad" analysis={biometrics.growth.wfa} />
               <SummaryItem label="Talla para Edad" analysis={biometrics.growth.hfa} />
               <SummaryItem label="Peso para Talla" analysis={biometrics.growth.wfh} />
               <SummaryItem label="Circ. Cefálica" analysis={biometrics.growth.hca} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componentes Auxiliares
const VitalInput = ({ label, value, onChange, icon, placeholder = '0.0' }: { label: string, value: string, onChange: (v: string) => void, icon: React.ReactNode, placeholder?: string }) => (
  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group focus-within:bg-white focus-within:border-blue-300 transition-all">
    <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5 mb-1 tracking-tight">
      {icon} {label}
    </label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full bg-transparent border-none outline-none font-black text-lg text-slate-800 placeholder:text-slate-200" 
    />
  </div>
);

const PercentileTag = ({ analysis }: { analysis: any }) => {
  if (!analysis) return (
    <div className="bg-white p-2.5 rounded-xl border shadow-sm opacity-50">
      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">N/A</p>
      <span className="text-[10px] text-slate-200 font-bold italic">Sin datos</span>
    </div>
  );
  return (
    <div className="bg-white p-2.5 rounded-xl border shadow-sm hover:border-blue-200 transition-colors">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{analysis.label}</p>
      <div className="flex flex-col gap-0.5">
        <span className={`text-[10px] font-black uppercase ${analysis.color}`}>{analysis.status}</span>
        <span className="text-[8px] text-slate-400 font-bold">Z: {analysis.zScore.toFixed(2)}</span>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, analysis }: { label: string, analysis: any }) => (
  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
    <span className="text-[10px] font-bold text-slate-500">{label}</span>
    {analysis ? (
      <span className={`text-[10px] font-black uppercase ${analysis.color}`}>{analysis.zScore > 0 ? '+' : ''}{analysis.zScore.toFixed(1)}</span>
    ) : (
      <span className="text-[10px] text-slate-300">--</span>
    )}
  </div>
);

export default WeedConsultation;
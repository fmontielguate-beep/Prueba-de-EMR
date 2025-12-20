
import React, { useState } from 'react';
import { SoapNote, Patient, VitalSigns, LabResult, LabCategory, ClinicalDiagnosis } from '../types';
import { Stethoscope, Sparkles, Save, Loader2, Activity, Scale, Ruler, Thermometer, HeartPulse, Calculator, FlaskConical, Plus, Trash2, Microscope, BookOpen, ClipboardList, Pill } from 'lucide-react';
import { analyzeSoapNote } from '../services/geminiService';
import { calculateAgeInMonths, analyzeBloodPressure, analyzeGrowth } from '../utils/growthStandards';

interface Props {
  patient: Patient;
  onSave: (note: SoapNote, vitals: VitalSigns, labs: LabResult[], aiAnalysis?: string) => void;
}

const WeedConsultation: React.FC<Props> = ({ patient, onSave }) => {
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const [note, setNote] = useState<SoapNote>({
    subjective: '',
    objective: '',
    diagnoses: [{
      id: generateId(),
      assessment: '',
      treatment: '',
      educationalPlan: '',
      labRequests: ''
    }]
  });
  
  const [vitals, setVitals] = useState<VitalSigns>({
    weightKg: '',
    heightCm: '',
    headCircumferenceCm: '',
    oxygenSaturation: '',
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    bloodPressure: ''
  });

  const [labs, setLabs] = useState<LabResult[]>([]);
  const [newLab, setNewLab] = useState<{ category: LabCategory; testName: string; result: string }>({
    category: 'blood',
    testName: '',
    result: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleNoteChange = (field: 'subjective' | 'objective', value: string) => {
    setNote(prev => ({ ...prev, [field]: value }));
  };

  const handleDiagnosisChange = (id: string, field: keyof ClinicalDiagnosis, value: string) => {
    setNote(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const addDiagnosis = () => {
    setNote(prev => ({
      ...prev,
      diagnoses: [
        ...prev.diagnoses,
        {
          id: generateId(),
          assessment: '',
          treatment: '',
          educationalPlan: '',
          labRequests: ''
        }
      ]
    }));
  };

  const removeDiagnosis = (id: string) => {
    if (note.diagnoses.length <= 1) return;
    setNote(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.filter(d => d.id !== id)
    }));
  };

  const handleVitalChange = (field: keyof VitalSigns, value: string) => setVitals(prev => ({ ...prev, [field]: value }));

  const handleAddLab = () => {
    if (!newLab.testName || !newLab.result) return;
    const labEntry: LabResult = {
      id: generateId(),
      category: newLab.category,
      testName: newLab.testName,
      result: newLab.result,
      date: new Date().toISOString()
    };
    setLabs([...labs, labEntry]);
    setNewLab({ category: 'blood', testName: '', result: '' });
  };

  const handleAIAnalysis = async () => {
    if (!note.subjective && !note.objective) return;
    setIsAnalyzing(true);
    const vitalSummary = `Peso ${vitals.weightKg}kg, Talla ${vitals.heightCm}cm, T ${vitals.temperature}°C`;
    const patientSummary = `${patient.firstName}, ${patient.dob}. ${vitalSummary}`;
    const result = await analyzeSoapNote(note, patientSummary);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const confirmSave = () => {
    onSave(note, vitals, labs, aiAnalysis || undefined);
    setShowConfirmModal(false);
  };

  const renderGrowthAnalysis = () => {
    if (!vitals.weightKg || !vitals.heightCm || !patient.dob || patient.gender === 'other') return null;
    const ageMonths = calculateAgeInMonths(patient.dob);
    const analysis = analyzeGrowth(patient.gender, ageMonths, parseFloat(vitals.weightKg), parseFloat(vitals.heightCm), parseFloat(vitals.headCircumferenceCm || '0'));
    return (
      <div className="col-span-2 md:col-span-4 mt-2 mb-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Calculator className="w-3 h-3" /> Evaluación Nutricional (OMS)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['wfa', 'hfa', 'wfh', 'hca'].map((key) => {
            const item = (analysis as any)[key];
            if (!item) return null;
            return (
              <div key={key} className="bg-white p-2 rounded border border-slate-100">
                <div className="text-[9px] text-slate-400 font-bold uppercase">{item.label}</div>
                <div className={`text-[10px] font-black ${item.color}`}>{item.status}</div>
                <div className="text-[8px] text-slate-400">Z: {item.zScore.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Signos Vitales */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4 uppercase tracking-widest"><Activity className="w-4 h-4 text-red-500" /> Signos Vitales</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['weightKg', 'heightCm', 'headCircumferenceCm', 'temperature', 'heartRate', 'bloodPressure'].map((f) => (
                <div key={f} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{f.replace(/([A-Z])/g, ' $1')}</label>
                  <input type="text" value={(vitals as any)[f]} onChange={(e) => handleVitalChange(f as any, e.target.value)} className="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none text-sm font-bold" />
                </div>
              ))}
              {renderGrowthAnalysis()}
           </div>
        </div>

        {/* SOAP: S y O */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2 uppercase tracking-widest"><Stethoscope className="w-4 h-4 text-blue-600" /> Anamnesis y Hallazgos</h3>
          <textarea value={note.subjective} onChange={(e) => handleNoteChange('subjective', e.target.value)} placeholder="Subjetivo: Motivo de consulta..." className="w-full h-24 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          <textarea value={note.objective} onChange={(e) => handleNoteChange('objective', e.target.value)} placeholder="Objetivo: Examen físico..." className="w-full h-24 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
        </div>

        {/* MÚLTIPLES DIAGNÓSTICOS (Reforzado) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><ClipboardList className="w-4 h-4 text-emerald-600" /> Impresión Clínica y Plan</h3>
             <button onClick={addDiagnosis} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-xs font-bold shadow-md"><Plus className="w-4 h-4" /> Añadir Diagnóstico</button>
          </div>

          {note.diagnoses.map((diag, index) => (
            <div key={diag.id} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-emerald-50 relative group animate-in slide-in-from-left-4">
               {note.diagnoses.length > 1 && (
                 <button onClick={() => removeDiagnosis(diag.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
               )}
               <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                  <input type="text" value={diag.assessment} onChange={(e) => handleDiagnosisChange(diag.id, 'assessment', e.target.value)} placeholder="Escriba el Diagnóstico aquí..." className="flex-1 border-b-2 border-slate-100 focus:border-emerald-500 outline-none py-1 text-slate-800 font-black text-sm uppercase bg-transparent" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Pill className="w-3 h-3 text-blue-500"/> Tratamiento Farmacológico</label>
                    <textarea value={diag.treatment} onChange={(e) => handleDiagnosisChange(diag.id, 'treatment', e.target.value)} placeholder="Dosis, frecuencia, duración..." className="w-full h-28 p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs resize-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3 text-orange-500"/> Plan Educacional / Alarma</label>
                    <textarea value={diag.educationalPlan} onChange={(e) => handleDiagnosisChange(diag.id, 'educationalPlan', e.target.value)} placeholder="Cuidados y signos de alarma..." className="w-full h-28 p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs resize-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Microscope className="w-3 h-3 text-purple-500"/> Laboratorios / Estudios Solicitados</label>
                    <input type="text" value={diag.labRequests} onChange={(e) => handleDiagnosisChange(diag.id, 'labRequests', e.target.value)} placeholder="Ej. Hematología completa, Rx de Tórax..." className="w-full border-b border-slate-100 focus:border-emerald-500 outline-none py-1 text-slate-700 text-xs bg-transparent" />
                  </div>
               </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={() => setShowConfirmModal(true)} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg transition-all transform hover:-translate-y-1"><Save className="w-5 h-5" /> Guardar Expediente de Consulta</button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          <button onClick={handleAIAnalysis} disabled={isAnalyzing} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg disabled:opacity-50 transition-all">
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
            <span className="font-bold">Análisis Clínico IA</span>
          </button>
          {aiAnalysis && (
             <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-xl animate-in zoom-in-95"><h4 className="text-indigo-900 font-bold flex items-center gap-2 mb-4 text-xs uppercase tracking-widest"><Sparkles className="w-4 h-4" /> Sugerencias de la IA</h4><div className="text-slate-700 text-[11px] leading-relaxed whitespace-pre-wrap">{aiAnalysis}</div></div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border border-slate-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Save className="w-8 h-8" /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">¿Finalizar Atención?</h3>
            <p className="text-slate-500 text-sm mb-8">Se guardará el registro para {patient.firstName}.</p>
            <div className="grid grid-cols-2 gap-4"><button onClick={() => setShowConfirmModal(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">Revisar</button><button onClick={confirmSave} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all">Confirmar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeedConsultation;

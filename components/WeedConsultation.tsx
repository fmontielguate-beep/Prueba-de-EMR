
import React, { useState } from 'react';
import { SoapNote, Patient, VitalSigns, LabResult, LabCategory, ClinicalDiagnosis } from '../types';
import { Stethoscope, Sparkles, Save, Loader2, Activity, Scale, Ruler, Thermometer, HeartPulse, Calculator, FlaskConical, Plus, Trash2, FileText, Microscope, AlertCircle, BookOpen, ClipboardList, Pill } from 'lucide-react';
import { analyzeSoapNote } from '../services/geminiService';
import { calculateAgeInMonths, analyzeBloodPressure, analyzeGrowth } from '../utils/growthStandards';

interface Props {
  patient: Patient;
  onSave: (note: SoapNote, vitals: VitalSigns, labs: LabResult[]) => void;
}

const WeedConsultation: React.FC<Props> = ({ patient, onSave }) => {
  const [note, setNote] = useState<SoapNote>({
    subjective: '',
    objective: '',
    diagnoses: [{
      id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
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

  const handleVitalChange = (field: keyof VitalSigns, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleAddLab = () => {
    if (!newLab.testName || !newLab.result) return;
    const labEntry: LabResult = {
      id: crypto.randomUUID(),
      category: newLab.category,
      testName: newLab.testName,
      result: newLab.result,
      date: new Date().toISOString()
    };
    setLabs([...labs, labEntry]);
    setNewLab({ category: 'blood', testName: '', result: '' });
  };

  const handleRemoveLab = (id: string) => {
    setLabs(labs.filter(l => l.id !== id));
  };

  const getCategoryLabel = (cat: LabCategory) => {
    switch(cat) {
      case 'blood': return 'Sangre';
      case 'urine': return 'Orina';
      case 'stool': return 'Heces';
      case 'radiology': return 'Radiología';
      case 'other': return 'Otra';
    }
  };

  const handleAIAnalysis = async () => {
    if (!note.subjective && !note.objective) return;
    
    setIsAnalyzing(true);
    setAiAnalysis(null);
    
    const vitalSummary = `Signos Vitales: Peso ${vitals.weightKg}kg, Talla ${vitals.heightCm}cm, T ${vitals.temperature}°C, Sat ${vitals.oxygenSaturation}%, P/A ${vitals.bloodPressure || 'N/A'}`;
    const labSummary = labs.length > 0 
      ? `Laboratorios: ${labs.map(l => `${l.testName}: ${l.result}`).join('; ')}`
      : 'Sin labs.';
    const diagnosisSummary = note.diagnoses.map(d => d.assessment).join(', ');

    const patientSummary = `${patient.firstName} ${patient.lastName}, ${patient.dob}. Diagnósticos actuales: ${diagnosisSummary}. ${vitalSummary}. ${labSummary}`;
    
    // Fix: Pass the actual SoapNote object to the service to ensure full context for analysis
    const result = await analyzeSoapNote(note, patientSummary);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const triggerSave = () => {
    setShowConfirmModal(true);
  };

  const confirmSave = () => {
    onSave(note, vitals, labs);
    setShowConfirmModal(false);
    // Limpiar formulario opcionalmente o redireccionar
  };

  const renderBPAnalysis = () => {
    if (!vitals.bloodPressure || !vitals.heightCm || !patient.dob || patient.gender === 'other') return null;
    const parts = vitals.bloodPressure.split('/');
    if (parts.length !== 2) return null;
    const sys = parseInt(parts[0]);
    const dia = parseInt(parts[1]);
    const height = parseFloat(vitals.heightCm);
    const ageMonths = calculateAgeInMonths(patient.dob);
    if (isNaN(sys) || isNaN(dia) || isNaN(height)) return null;
    const analysis = analyzeBloodPressure(patient.gender, ageMonths, height, sys, dia);
    if (!analysis) return null;
    return (
      <div className="mt-1">
        <span className={`text-[10px] uppercase font-bold block ${analysis.color}`}>{analysis.status}</span>
        <span className="text-[9px] text-slate-400 block">Ref: {analysis.detail}</span>
      </div>
    );
  };

  const renderGrowthAnalysis = () => {
    if (!vitals.weightKg || !vitals.heightCm || !patient.dob || patient.gender === 'other') return null;
    const weight = parseFloat(vitals.weightKg);
    const height = parseFloat(vitals.heightCm);
    const hc = vitals.headCircumferenceCm ? parseFloat(vitals.headCircumferenceCm) : 0;
    const ageMonths = calculateAgeInMonths(patient.dob);
    if (isNaN(weight) || isNaN(height)) return null;
    const analysis = analyzeGrowth(patient.gender, ageMonths, weight, height, hc);
    return (
      <div className="col-span-2 md:col-span-4 mt-2 mb-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1">
          <Calculator className="w-3 h-3" /> Evaluación Antropométrica
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-2 rounded border border-slate-100">
             <div className="text-[10px] text-slate-400 font-bold uppercase">Peso/Edad</div>
             <div className={`text-xs font-bold ${analysis.wfa?.color || 'text-slate-600'}`}>{analysis.wfa?.status || 'N/A'}</div>
             {analysis.wfa && <div className="text-[9px] text-slate-400">Z: {analysis.wfa.zScore.toFixed(2)}</div>}
          </div>
          <div className="bg-white p-2 rounded border border-slate-100">
             <div className="text-[10px] text-slate-400 font-bold uppercase">Talla/Edad</div>
             <div className={`text-xs font-bold ${analysis.hfa?.color || 'text-slate-600'}`}>{analysis.hfa?.status || 'N/A'}</div>
             {analysis.hfa && <div className="text-[9px] text-slate-400">Z: {analysis.hfa.zScore.toFixed(2)}</div>}
          </div>
          <div className="bg-white p-2 rounded border border-slate-100">
             <div className="text-[10px] text-slate-400 font-bold uppercase">Peso/Talla</div>
             <div className={`text-xs font-bold ${analysis.wfh?.color || 'text-slate-600'}`}>{analysis.wfh?.status || 'N/A'}</div>
             {analysis.wfh && <div className="text-[9px] text-slate-400">Z: {analysis.wfh.zScore.toFixed(2)}</div>}
          </div>
           <div className="bg-white p-2 rounded border border-slate-100">
             <div className="text-[10px] text-slate-400 font-bold uppercase">CC/Edad</div>
             <div className={`text-xs font-bold ${analysis.hca?.color || 'text-slate-600'}`}>{analysis.hca?.status || 'N/A'}</div>
             {analysis.hca && <div className="text-[9px] text-slate-400">Z: {analysis.hca.zScore.toFixed(2)}</div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Vitals Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-red-500" />
              Signos Vitales y Antropometría
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                  <Scale className="w-3 h-3" /> Peso (Kg)
                </label>
                <input type="number" value={vitals.weightKg} onChange={(e) => handleVitalChange('weightKg', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800" placeholder="0.0" />
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                  <Ruler className="w-3 h-3" /> Talla (cm)
                </label>
                <input type="number" value={vitals.heightCm} onChange={(e) => handleVitalChange('heightCm', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800" placeholder="0" />
              </div>
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">C. Cefálica (cm)</label>
                <input type="number" value={vitals.headCircumferenceCm} onChange={(e) => handleVitalChange('headCircumferenceCm', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800" placeholder="0" />
              </div>
              {renderGrowthAnalysis()}
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">Sat O2 (%)</label>
                <input type="number" value={vitals.oxygenSaturation} onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800" placeholder="%" />
              </div>
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1"><Thermometer className="w-3 h-3" /> Temp (°C)</label>
                <input type="number" value={vitals.temperature} onChange={(e) => handleVitalChange('temperature', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800" placeholder="37.0" />
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1"><HeartPulse className="w-3 h-3" /> P/A (mmHg)</label>
                <input type="text" value={vitals.bloodPressure} onChange={(e) => handleVitalChange('bloodPressure', e.target.value)} className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800" placeholder="120/80" />
                {renderBPAnalysis()}
              </div>
           </div>
        </div>

        {/* Labs Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-purple-500" />
              Laboratorio y Gabinete (Actuales)
           </h3>
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="w-full md:w-1/4">
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Categoría</label>
                   <select value={newLab.category} onChange={(e) => setNewLab({...newLab, category: e.target.value as LabCategory})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                     <option value="blood">Sangre</option>
                     <option value="urine">Orina</option>
                     <option value="stool">Heces</option>
                     <option value="radiology">Radiología</option>
                     <option value="other">Otras</option>
                   </select>
                </div>
                <div className="w-full md:w-1/3">
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Prueba</label>
                   <input type="text" placeholder="Ej. Hemograma" value={newLab.testName} onChange={(e) => setNewLab({...newLab, testName: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div className="flex-1 w-full">
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Resultados</label>
                   <input type="text" placeholder="Resultados relevantes..." value={newLab.result} onChange={(e) => setNewLab({...newLab, result: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <button onClick={handleAddLab} className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"><Plus className="w-5 h-5" /></button>
              </div>
           </div>
           {labs.length > 0 && (
             <div className="space-y-2">
               {labs.map((lab) => (
                 <div key={lab.id} className="flex items-start justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-0.5"><Microscope className="w-4 h-4"/></div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">{lab.testName}</p>
                         <p className="text-[10px] text-slate-500 uppercase tracking-wide">{getCategoryLabel(lab.category)}</p>
                         <p className="text-sm text-slate-600 mt-0.5">{lab.result}</p>
                       </div>
                    </div>
                    <button onClick={() => handleRemoveLab(lab.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* SOAP Note - Subjective & Objective */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            Anamnesis y Examen Físico
          </h3>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">S - Subjetivo (Motivo de consulta e Historia)</label>
            <textarea value={note.subjective} onChange={(e) => handleNoteChange('subjective', e.target.value)} placeholder="Historia de la enfermedad actual..." className="w-full h-24 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">O - Objetivo (Hallazgos al Examen Físico)</label>
            <textarea value={note.objective} onChange={(e) => handleNoteChange('objective', e.target.value)} placeholder="Hallazgos físicos relevantes..." className="w-full h-24 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          </div>
        </div>

        {/* Dynamic Diagnoses List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                Diagnóstico y Plan de Manejo
             </h3>
             <button onClick={addDiagnosis} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold border border-emerald-200">
                <Plus className="w-4 h-4" /> Añadir Diagnóstico
             </button>
          </div>

          {note.diagnoses.map((diag, index) => (
            <div key={diag.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group animate-in slide-in-from-left-4 duration-300">
               {note.diagnoses.length > 1 && (
                 <button onClick={() => removeDiagnosis(diag.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                   <Trash2 className="w-4 h-4" />
                 </button>
               )}
               
               <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Entrada de Diagnóstico</h4>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">A - Diagnóstico (Impresión Clínica)</label>
                    <input type="text" value={diag.assessment} onChange={(e) => handleDiagnosisChange(diag.id, 'assessment', e.target.value)} placeholder="Ej. Faringoamigdalitis bacteriana" className="w-full border-b border-slate-300 focus:border-emerald-500 outline-none py-1.5 text-slate-800 font-medium bg-transparent" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Pill className="w-3 h-3"/> P - Tratamiento Farmacológico</label>
                    <textarea value={diag.treatment} onChange={(e) => handleDiagnosisChange(diag.id, 'treatment', e.target.value)} placeholder="Medicamentos, dosis, frecuencia..." className="w-full h-24 p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs resize-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3"/> Plan Educacional</label>
                    <textarea value={diag.educationalPlan} onChange={(e) => handleDiagnosisChange(diag.id, 'educationalPlan', e.target.value)} placeholder="Signos de alarma, cuidados en casa..." className="w-full h-24 p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs resize-none transition-all" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Microscope className="w-3 h-3"/> Nuevos Laboratorios / Pruebas Diag.</label>
                    <input type="text" value={diag.labRequests} onChange={(e) => handleDiagnosisChange(diag.id, 'labRequests', e.target.value)} placeholder="Ej. Cultivo faríngeo, Rayos X tórax..." className="w-full border-b border-slate-300 focus:border-emerald-500 outline-none py-1.5 text-slate-800 text-sm bg-transparent" />
                  </div>
               </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={triggerSave} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg transition-all transform hover:-translate-y-1 active:scale-95">
            <Save className="w-5 h-5" /> Guardar Consulta Completa
          </button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          <button onClick={handleAIAnalysis} disabled={isAnalyzing} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50">
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
            <span className="font-bold">Analizar con IA Médica</span>
          </button>

          {aiAnalysis ? (
             <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-500">
              <h4 className="text-indigo-900 font-bold flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" /> Asistente Clínico Inteligente
              </h4>
              <div className="prose prose-sm prose-indigo text-slate-700 max-h-[60vh] overflow-y-auto whitespace-pre-wrap leading-relaxed text-xs">
                {aiAnalysis}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center">
              <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h4 className="text-slate-400 font-bold text-sm">IA de Apoyo Diagnóstico</h4>
              <p className="text-slate-400 text-xs mt-2">Analiza tu nota SOAP para recibir sugerencias de diagnóstico diferencial y guías clínicas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Save className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">¿Finalizar Consulta?</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Esta acción guardará permanentemente el registro en el expediente de <strong>{patient.firstName}</strong>. Asegúrese de haber revisado todos los diagnósticos y tratamientos.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowConfirmModal(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">Revisar</button>
                <button onClick={confirmSave} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100">Confirmar y Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeedConsultation;

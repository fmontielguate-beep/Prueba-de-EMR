import React, { useState, useEffect } from 'react';
import { SoapNote, Patient, VitalSigns, LabResult, LabCategory } from '../types';
import { Stethoscope, Sparkles, Save, Loader2, Activity, Scale, Ruler, Thermometer, HeartPulse, Calculator, FlaskConical, Plus, Trash2, FileText, Microscope } from 'lucide-react';
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
    assessment: '',
    plan: ''
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

  // Lab Results State
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [newLab, setNewLab] = useState<{ category: LabCategory; testName: string; result: string }>({
    category: 'blood',
    testName: '',
    result: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleNoteChange = (field: keyof SoapNote, value: string) => {
    setNote(prev => ({ ...prev, [field]: value }));
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
    setNewLab({ category: 'blood', testName: '', result: '' }); // Reset form
  };

  const handleRemoveLab = (id: string) => {
    setLabs(labs.filter(l => l.id !== id));
  };

  const getCategoryLabel = (cat: LabCategory) => {
    switch(cat) {
      case 'blood': return 'Sanguínea';
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
    
    // Include vitals in summary for AI
    const vitalSummary = `Signos Vitales: Peso ${vitals.weightKg}kg, Talla ${vitals.heightCm}cm, T ${vitals.temperature}°C, Sat ${vitals.oxygenSaturation}%, P/A ${vitals.bloodPressure || 'N/A'}`;
    
    // Include Labs
    const labSummary = labs.length > 0 
      ? `Resultados de Laboratorio: ${labs.map(l => `[${getCategoryLabel(l.category)}] ${l.testName}: ${l.result}`).join('; ')}`
      : 'Sin resultados de laboratorio.';

    const patientSummary = `${patient.firstName} ${patient.lastName}, ${patient.dob} (Género: ${patient.gender}). ${vitalSummary}. ${labSummary}`;
    
    const result = await analyzeSoapNote(note, patientSummary);
    
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const renderBPAnalysis = () => {
    if (!vitals.bloodPressure || !vitals.heightCm || !patient.dob || patient.gender === 'other') return null;
    
    // Parse BP
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
        <span className={`text-[10px] uppercase font-bold block ${analysis.color}`}>
          {analysis.status}
        </span>
        <span className="text-[9px] text-slate-400 block">
          Ref: {analysis.detail}
        </span>
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
          {/* Peso/Edad */}
          <div className="bg-white p-2 rounded border border-slate-100">
             <div className="text-[10px] text-slate-400 font-bold uppercase">Peso/Edad (Global)</div>
             <div className={`text-xs font-bold ${analysis.wfa?.color || 'text-slate-600'}`}>
               {analysis.wfa?.status || 'N/A'}
             </div>
             {analysis.wfa && <div className="text-[9px] text-slate-400">Z: {analysis.wfa.zScore.toFixed(2)}</div>}
          </div>

          {/* Talla/Edad */}
          <div className="bg-white p-2 rounded border border-slate-100">
             <div className="text-[10px] text-slate-400 font-bold uppercase">Talla/Edad (Crónica)</div>
             <div className={`text-xs font-bold ${analysis.hfa?.color || 'text-slate-600'}`}>
               {analysis.hfa?.status || 'N/A'}
             </div>
             {analysis.hfa && <div className="text-[9px] text-slate-400">Z: {analysis.hfa.zScore.toFixed(2)}</div>}
          </div>

          {/* Peso/Talla */}
          <div className="bg-white p-2 rounded border border-slate-100">
             <div className="text-[10px] text-slate-400 font-bold uppercase">Peso/Talla (Aguda)</div>
             <div className={`text-xs font-bold ${analysis.wfh?.color || 'text-slate-600'}`}>
               {analysis.wfh?.status || (height > 120 ? 'No aplica (>120cm)' : 'N/A')}
             </div>
             {analysis.wfh && <div className="text-[9px] text-slate-400">Z: {analysis.wfh.zScore.toFixed(2)}</div>}
          </div>

           {/* CC/Edad */}
           <div className="bg-white p-2 rounded border border-slate-100">
             <div className="text-[10px] text-slate-400 font-bold uppercase">CC/Edad (Neuro)</div>
             <div className={`text-xs font-bold ${analysis.hca?.color || 'text-slate-600'}`}>
               {analysis.hca?.status || 'N/A'}
             </div>
             {analysis.hca && <div className="text-[9px] text-slate-400">Z: {analysis.hca.zScore.toFixed(2)}</div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <input 
                  type="number" 
                  value={vitals.weightKg}
                  onChange={(e) => handleVitalChange('weightKg', e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800"
                  placeholder="0.0"
                />
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                  <Ruler className="w-3 h-3" /> Talla (cm)
                </label>
                <input 
                  type="number" 
                  value={vitals.heightCm}
                  onChange={(e) => handleVitalChange('heightCm', e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800"
                  placeholder="0"
                />
              </div>

               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                  C. Cefálica (cm)
                </label>
                <input 
                  type="number" 
                  value={vitals.headCircumferenceCm}
                  onChange={(e) => handleVitalChange('headCircumferenceCm', e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800"
                  placeholder="0"
                />
              </div>

              {/* Comprehensive Growth Analysis Panel (Takes full width of grid) */}
              {renderGrowthAnalysis()}

               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                  Sat O2 (%)
                </label>
                <input 
                  type="number" 
                  value={vitals.oxygenSaturation}
                  onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800"
                  placeholder="%"
                />
              </div>

               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                  <Thermometer className="w-3 h-3" /> Temp (°C)
                </label>
                <input 
                  type="number" 
                  value={vitals.temperature}
                  onChange={(e) => handleVitalChange('temperature', e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800"
                  placeholder="37.0"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                  <HeartPulse className="w-3 h-3" /> P/A (mmHg)
                </label>
                <input 
                  type="text" 
                  value={vitals.bloodPressure}
                  onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-lg font-semibold text-slate-800"
                  placeholder="120/80"
                />
                {renderBPAnalysis()}
              </div>
           </div>
        </div>

        {/* Labs & Diagnostic Tests */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-purple-500" />
              Laboratorio y Gabinete
           </h3>
           
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="w-full md:w-1/4">
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Categoría</label>
                   <select 
                      value={newLab.category}
                      onChange={(e) => setNewLab({...newLab, category: e.target.value as LabCategory})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                   >
                     <option value="blood">Sangre</option>
                     <option value="urine">Orina</option>
                     <option value="stool">Heces</option>
                     <option value="radiology">Radiología</option>
                     <option value="other">Otras</option>
                   </select>
                </div>
                <div className="w-full md:w-1/3">
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre de la Prueba</label>
                   <input 
                      type="text"
                      placeholder="Ej. Hemograma Completo"
                      value={newLab.testName}
                      onChange={(e) => setNewLab({...newLab, testName: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                   />
                </div>
                <div className="flex-1 w-full">
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Resultados / Hallazgos</label>
                   <input 
                      type="text"
                      placeholder="Ej. Leucocitosis 15,000"
                      value={newLab.result}
                      onChange={(e) => setNewLab({...newLab, result: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                   />
                </div>
                <button 
                  onClick={handleAddLab}
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                  title="Agregar Resultado"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
           </div>

           {/* List of Added Labs */}
           {labs.length > 0 ? (
             <div className="space-y-2">
               {labs.map((lab) => (
                 <div key={lab.id} className="flex items-start justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-purple-200 transition-colors">
                    <div className="flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                         {lab.category === 'radiology' ? <FileText className="w-4 h-4"/> : <Microscope className="w-4 h-4"/>}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">{lab.testName}</p>
                         <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{getCategoryLabel(lab.category)}</p>
                         <p className="text-sm text-slate-600">{lab.result}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveLab(lab.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-4 text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-lg">
               No hay resultados agregados para esta visita.
             </div>
           )}
        </div>

        {/* SOAP Note */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-blue-600" />
              Consulta (Método de Weed)
            </h3>
            <button
               onClick={handleAIAnalysis}
               disabled={isAnalyzing}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-200"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4" />}
              {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
            </button>
          </div>

          <div className="space-y-4">
            {/* Subjective */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                S - Subjetivo (Anamnesis)
              </label>
              <textarea
                value={note.subjective}
                onChange={(e) => handleNoteChange('subjective', e.target.value)}
                placeholder="Motivo de consulta, historia de la enfermedad actual..."
                className="w-full h-32 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>

            {/* Objective */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                O - Objetivo (Examen Físico)
              </label>
              <textarea
                value={note.objective}
                onChange={(e) => handleNoteChange('objective', e.target.value)}
                placeholder="Hallazgos físicos relevantes... (Los signos vitales y laboratorios se guardarán automáticamente)"
                className="w-full h-32 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>

            {/* Assessment */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                A - Análisis (Diagnóstico)
              </label>
              <textarea
                value={note.assessment}
                onChange={(e) => handleNoteChange('assessment', e.target.value)}
                placeholder="Impresión diagnóstica..."
                className="w-full h-24 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>

            {/* Plan */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                P - Plan (Tratamiento)
              </label>
              <textarea
                value={note.plan}
                onChange={(e) => handleNoteChange('plan', e.target.value)}
                placeholder="Medicamentos, estudios, indicaciones..."
                className="w-full h-24 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onSave(note, vitals, labs)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar Consulta
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        {aiAnalysis ? (
           <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 sticky top-24">
            <h4 className="text-indigo-900 font-semibold flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              Asistente Inteligente
            </h4>
            <div className="prose prose-sm prose-indigo text-slate-700 max-h-[80vh] overflow-y-auto whitespace-pre-wrap">
              {aiAnalysis}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center sticky top-24">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-slate-500 font-medium">Asistente IA inactivo</h4>
            <p className="text-slate-400 text-sm mt-2">
              Complete los datos clínicos y presione "Analizar con IA" para recibir sugerencias.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeedConsultation;
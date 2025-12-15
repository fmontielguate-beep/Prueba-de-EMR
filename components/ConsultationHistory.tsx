import React, { useState } from 'react';
import { Consultation, Patient, LabCategory } from '../types';
import { Search, FileText, ChevronDown, ChevronUp, History, AlertOctagon, Sparkles, Calendar, User, FlaskConical, Microscope } from 'lucide-react';

interface Props {
  consultations: Consultation[];
  patient: Patient;
}

const ConsultationHistory: React.FC<Props> = ({ consultations, patient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredConsultations = consultations.filter(c => 
    c.date.includes(searchTerm) || 
    c.soap.assessment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Allergies Alert Box */}
      <div className={`rounded-xl p-5 border shadow-sm transition-all ${
        patient.history.pathological.allergies 
          ? 'bg-red-50 border-red-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <h3 className={`font-bold flex items-center gap-2 mb-2 ${
          patient.history.pathological.allergies ? 'text-red-800' : 'text-green-800'
        }`}>
          <AlertOctagon className="w-5 h-5" />
          Alergias Conocidas
        </h3>
        <p className={`text-sm ${
          patient.history.pathological.allergies ? 'text-red-700 font-medium' : 'text-green-700'
        }`}>
          {patient.history.pathological.allergies || "No refiere alergias conocidas."}
        </p>
      </div>

      {/* Clinical History List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Resumen de Visitas
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar diagnóstico..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-0">
          {filteredConsultations.length === 0 ? (
             <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full">
               <div className="bg-slate-100 p-4 rounded-full mb-3">
                 <FileText className="w-8 h-8 text-slate-300" />
               </div>
               <p className="text-sm font-medium">Sin historial disponible.</p>
               <p className="text-xs text-slate-400 mt-1">Las consultas guardadas aparecerán aquí.</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32 md:w-40">Fecha</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnóstico (A)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tratamiento (P)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConsultations.map((consultation) => {
                  const hasAI = !!consultation.aiAnalysis;
                  const isExpanded = expandedId === consultation.id;

                  return (
                    <React.Fragment key={consultation.id}>
                      <tr 
                        className={`group transition-all cursor-pointer ${
                          isExpanded ? 'bg-blue-50/30' : 'hover:bg-slate-50'
                        }`} 
                        onClick={() => toggleExpand(consultation.id)}
                      >
                        {/* Date Column with AI Indicator border */}
                        <td className={`px-4 py-4 align-top relative ${
                          hasAI ? 'border-l-[3px] border-l-indigo-500' : 'border-l-[3px] border-l-transparent'
                        }`}>
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(consultation.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1.5 pl-0.5">
                              <User className="w-3 h-3 text-slate-400" />
                              {consultation.patientAge || 'N/A'}
                            </span>
                            {hasAI && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-100 text-[10px] font-bold text-indigo-700 w-fit mt-1">
                                <Sparkles className="w-2.5 h-2.5" /> IA
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Assessment Column */}
                        <td className="px-4 py-4 align-top">
                          <div className="text-sm text-slate-800 font-medium line-clamp-2 leading-relaxed">
                             {consultation.soap.assessment || <span className="text-slate-400 italic">Sin diagnóstico registrado</span>}
                          </div>
                          {/* Show Plan briefly on mobile since column is hidden */}
                          <div className="md:hidden text-xs text-slate-500 mt-1 line-clamp-1">
                            <span className="font-semibold text-slate-600">Plan: </span>
                            {consultation.soap.plan || '...'}
                          </div>
                        </td>

                        {/* Plan Column (Hidden on Mobile) */}
                        <td className="px-4 py-4 align-top hidden md:table-cell">
                           <div className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                             {consultation.soap.plan || <span className="text-slate-400 italic">--</span>}
                           </div>
                        </td>

                        {/* Expand Icon */}
                        <td className="px-4 py-4 text-right align-middle">
                          <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={4} className="p-0 border-b border-slate-200">
                             <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                                
                                {/* Vitals Snapshot */}
                                {consultation.vitalSigns && (
                                  <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="text-xs text-slate-500">
                                      <span className="block font-semibold">Peso</span>
                                      {consultation.vitalSigns.weightKg ? `${consultation.vitalSigns.weightKg} kg` : '--'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      <span className="block font-semibold">Talla</span>
                                      {consultation.vitalSigns.heightCm ? `${consultation.vitalSigns.heightCm} cm` : '--'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      <span className="block font-semibold">Temp</span>
                                      {consultation.vitalSigns.temperature ? `${consultation.vitalSigns.temperature}°C` : '--'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      <span className="block font-semibold">SatO2</span>
                                      {consultation.vitalSigns.oxygenSaturation ? `${consultation.vitalSigns.oxygenSaturation}%` : '--'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      <span className="block font-semibold">P/A</span>
                                      {consultation.vitalSigns.bloodPressure ? `${consultation.vitalSigns.bloodPressure}` : '--'}
                                    </div>
                                  </div>
                                )}

                                {/* Lab Results Block */}
                                {consultation.labResults && consultation.labResults.length > 0 && (
                                  <div className="lg:col-span-2 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                     <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                                       <FlaskConical className="w-4 h-4" /> Resultados de Laboratorio y Gabinete
                                     </h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                       {consultation.labResults.map((lab) => (
                                         <div key={lab.id} className="bg-white p-2 rounded-lg border border-purple-100 shadow-sm text-sm">
                                            <div className="flex justify-between items-start">
                                              <span className="font-bold text-slate-700">{lab.testName}</span>
                                              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">{getCategoryLabel(lab.category)}</span>
                                            </div>
                                            <p className="text-slate-600 text-xs mt-1">{lab.result}</p>
                                         </div>
                                       ))}
                                     </div>
                                  </div>
                                )}

                                {/* SOAP Details */}
                                <div className="space-y-4">
                                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">S - Subjetivo</span>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                      {consultation.soap.subjective || "Sin datos."}
                                    </p>
                                  </div>
                                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">O - Objetivo</span>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                      {consultation.soap.objective || "Sin datos."}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">A - Análisis</span>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                      {consultation.soap.assessment || "Sin datos."}
                                    </p>
                                  </div>
                                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">P - Plan</span>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                      {consultation.soap.plan || "Sin datos."}
                                    </p>
                                  </div>

                                  {/* AI Analysis Block */}
                                  {consultation.aiAnalysis && (
                                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative overflow-hidden">
                                      <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Sparkles className="w-16 h-16 text-indigo-500" />
                                      </div>
                                      <strong className="block mb-2 text-indigo-800 text-sm flex items-center gap-2 relative z-10">
                                        <Sparkles className="w-4 h-4"/> Análisis Inteligente
                                      </strong>
                                      <p className="text-sm text-indigo-900/80 whitespace-pre-wrap relative z-10 leading-relaxed">
                                        {consultation.aiAnalysis}
                                      </p>
                                    </div>
                                  )}
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationHistory;
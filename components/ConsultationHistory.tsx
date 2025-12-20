
import React, { useState } from 'react';
import { Consultation, Patient, LabCategory } from '../types';
import { Search, FileText, ChevronDown, ChevronUp, History, AlertOctagon, Sparkles, Calendar, User, FlaskConical, Pill, BookOpen, Microscope, Trash2, ClipboardList } from 'lucide-react';

interface Props {
  consultations: Consultation[];
  patient: Patient;
  onDelete?: (e: React.MouseEvent, id: string) => void;
}

const ConsultationHistory: React.FC<Props> = ({ consultations, patient, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredConsultations = consultations.filter(c => 
    c.date.includes(searchTerm) || 
    c.soap.diagnoses.some(d => d.assessment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
          {patient.history.pathological.allergies || "No refiere alergias."}
        </p>
      </div>

      {/* Clinical History List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" /> Historial de Visitas
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por diagnóstico..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-0">
          {filteredConsultations.length === 0 ? (
             <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full">
               <FileText className="w-8 h-8 text-slate-300 mb-2" />
               <p className="text-sm font-medium">Sin historial disponible.</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Fecha</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnósticos</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConsultations.map((consultation) => {
                  const isExpanded = expandedId === consultation.id;
                  return (
                    <React.Fragment key={consultation.id}>
                      <tr 
                        className={`group transition-all cursor-pointer ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`} 
                        onClick={() => toggleExpand(consultation.id)}
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs">{new Date(consultation.date).toLocaleDateString()}</span>
                            <span className="text-[10px] text-slate-500">{consultation.patientAge}</span>
                            {consultation.aiAnalysis && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-100 text-[10px] font-bold text-indigo-700 w-fit mt-1">IA</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                             {consultation.soap.diagnoses.map(d => (
                               <span key={d.id} className="text-[10px] font-bold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded shadow-sm">
                                 {d.assessment}
                               </span>
                             ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            {onDelete && (
                              <button onClick={(e) => onDelete(e, consultation.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <div className={`p-1.5 rounded-full ${isExpanded ? 'bg-blue-100 text-blue-600' : 'text-slate-400'}`}>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={3} className="p-0 border-b border-slate-200">
                             <div className="p-6 space-y-6 animate-in slide-in-from-top-2">
                                {/* SOAP Common Sections */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                      <span className="text-[10px] font-black text-blue-600 uppercase mb-2 block tracking-widest">S - Subjetivo</span>
                                      <p className="text-xs text-slate-700 leading-relaxed italic">{consultation.soap.subjective || "Sin datos."}</p>
                                   </div>
                                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                      <span className="text-[10px] font-black text-blue-600 uppercase mb-2 block tracking-widest">O - Objetivo</span>
                                      <p className="text-xs text-slate-700 leading-relaxed italic">{consultation.soap.objective || "Sin datos."}</p>
                                   </div>
                                </div>

                                {/* List of Detailed Diagnoses */}
                                <div className="space-y-4">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                     <ClipboardList className="w-4 h-4 text-emerald-600" /> Detalle de Diagnósticos y Planes
                                  </h4>
                                  {consultation.soap.diagnoses.map((diag, i) => (
                                    <div key={diag.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                       <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">{i+1}</span>
                                          <h5 className="font-bold text-slate-800 text-sm">{diag.assessment || "Sin diagnóstico especificado"}</h5>
                                       </div>
                                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="space-y-1">
                                             <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Pill className="w-3 h-3 text-blue-500" /> Tratamiento</label>
                                             <p className="text-xs text-slate-700 leading-normal">{diag.treatment || "--"}</p>
                                          </div>
                                          <div className="space-y-1">
                                             <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><BookOpen className="w-3 h-3 text-orange-500" /> Plan Educacional</label>
                                             <p className="text-xs text-slate-700 leading-normal">{diag.educationalPlan || "--"}</p>
                                          </div>
                                          <div className="space-y-1">
                                             <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Microscope className="w-3 h-3 text-purple-500" /> Laboratorios Solicitados</label>
                                             <p className="text-xs text-slate-700 leading-normal">{diag.labRequests || "Ninguno"}</p>
                                          </div>
                                       </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Vitals & Labs existing summary (simplified) */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                                    <div className="text-[10px] text-slate-500 text-center"><span className="block font-bold">Peso</span>{consultation.vitalSigns.weightKg}kg</div>
                                    <div className="text-[10px] text-slate-500 text-center"><span className="block font-bold">Talla</span>{consultation.vitalSigns.heightCm}cm</div>
                                    <div className="text-[10px] text-slate-500 text-center"><span className="block font-bold">P/A</span>{consultation.vitalSigns.bloodPressure || "--"}</div>
                                    <div className="text-[10px] text-slate-500 text-center"><span className="block font-bold">SatO2</span>{consultation.vitalSigns.oxygenSaturation}%</div>
                                    <div className="text-[10px] text-slate-500 text-center"><span className="block font-bold">Temp</span>{consultation.vitalSigns.temperature}°C</div>
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

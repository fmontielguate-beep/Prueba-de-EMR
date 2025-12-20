
import React, { useState } from 'react';
import { Consultation, Patient } from '../types';
import { ChevronDown, ChevronUp, History, ClipboardList, Pill, BookOpen, Microscope, Trash2 } from 'lucide-react';

interface Props {
  consultations: Consultation[];
  patient: Patient;
  onDelete?: (e: React.MouseEvent, id: string) => void;
}

const ConsultationHistory: React.FC<Props> = ({ consultations, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {consultations.length === 0 ? (
        <div className="text-center py-10 text-slate-400 italic text-sm">Sin registros previos.</div>
      ) : (
        consultations.map((c) => (
          <div key={c.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm transition-all hover:border-blue-200">
            <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
              <div>
                <p className="text-xs font-bold text-slate-800">{new Date(c.date).toLocaleDateString()}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.soap.diagnoses.map(d => (
                    <span key={d.id} className="text-[9px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 uppercase">{d.assessment || "Control"}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onDelete && <button onClick={(e) => onDelete(e, c.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                {expandedId === c.id ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-slate-300" />}
              </div>
            </div>

            {expandedId === c.id && (
              <div className="p-6 bg-slate-50 border-t space-y-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border"><span className="text-[9px] font-black text-blue-600 block mb-1">SUBJETIVO</span><p className="text-xs italic text-slate-600">{c.soap.subjective || "Sin datos."}</p></div>
                  <div className="bg-white p-3 rounded-xl border"><span className="text-[9px] font-black text-blue-600 block mb-1">OBJETIVO</span><p className="text-xs italic text-slate-600">{c.soap.objective || "Sin datos."}</p></div>
                </div>
                
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Diagnósticos y Tratamientos</h4>
                   {c.soap.diagnoses.map((diag, i) => (
                     <div key={diag.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                        <p className="font-bold text-sm text-slate-800 border-b pb-2 flex items-center gap-2"><span className="bg-slate-100 text-slate-500 w-5 h-5 rounded flex items-center justify-center text-[10px]">{i+1}</span> {diag.assessment}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="text-[11px]"><span className="font-bold text-blue-600 flex items-center gap-1 mb-1"><Pill className="w-3 h-3" /> Tratamiento</span><p className="text-slate-700">{diag.treatment || "--"}</p></div>
                           <div className="text-[11px]"><span className="font-bold text-orange-600 flex items-center gap-1 mb-1"><BookOpen className="w-3 h-3" /> Plan Educacional</span><p className="text-slate-700">{diag.educationalPlan || "--"}</p></div>
                        </div>
                        {diag.labRequests && <div className="text-[11px] pt-2 border-t"><span className="font-bold text-purple-600 flex items-center gap-1 mb-1"><Microscope className="w-3 h-3" /> Estudios Solicitados</span><p className="text-slate-700">{diag.labRequests}</p></div>}
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ConsultationHistory;

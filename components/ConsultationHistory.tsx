import React from 'react';
import { Consultation, Patient } from '../types';
import { ChevronRight, ClipboardList, Trash2, Eye } from 'lucide-react';

interface Props {
  consultations: Consultation[];
  patient: Patient;
  onDelete?: (e: React.MouseEvent, id: string) => void;
  onSelect?: (consultation: Consultation) => void;
}

const ConsultationHistory: React.FC<Props> = ({ consultations, onDelete, onSelect }) => {
  return (
    <div className="space-y-4">
      {consultations.length === 0 ? (
        <div className="text-center py-20 text-slate-400 italic text-sm">Sin registros previos.</div>
      ) : (
        consultations.map((c, i) => (
          <div 
            key={c.id} 
            className="bg-white border rounded-[2rem] overflow-hidden shadow-sm transition-all hover:border-blue-200 hover:shadow-md cursor-pointer group"
            onClick={() => onSelect && onSelect(c)}
          >
            <div className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">Visita {consultations.length - i}</span>
                    <p className="text-xs font-bold text-slate-800">{new Date(c.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.soap.diagnoses.map(d => (
                      <span key={d.id} className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1"><ClipboardList className="w-3 h-3" /> {d.assessment || "Control"}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onDelete && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(e, c.id);
                    }} 
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Eliminar consulta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ConsultationHistory;
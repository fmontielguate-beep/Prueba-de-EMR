
import React from 'react';
import { Consultation, Patient } from '../types';
import { X, Calendar, User, Activity, Stethoscope, ClipboardList, Pill, BookOpen, Microscope, Sparkles, HeartPulse, Scale, Ruler, Wind } from 'lucide-react';

interface Props {
  consultation: Consultation;
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

const ConsultationDetailModal: React.FC<Props> = ({ consultation, patient, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Resumen de Consulta</h2>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-500 mt-1">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-blue-500" /> {new Date(consultation.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="flex items-center gap-1 text-blue-600"><User className="w-4 h-4" /> Edad: {consultation.patientAge}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white custom-scrollbar">
          
          {/* Signos Vitales Rápido */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
             <VitalMini label="Peso" value={`${consultation.vitalSigns.weightKg} kg`} icon={<Scale className="w-3.5 h-3.5" />} color="bg-blue-50 text-blue-700" />
             <VitalMini label="Talla" value={`${consultation.vitalSigns.heightCm} cm`} icon={<Ruler className="w-3.5 h-3.5" />} color="bg-emerald-50 text-emerald-700" />
             <VitalMini label="T°" value={`${consultation.vitalSigns.temperature} °C`} icon={<HeartPulse className="w-3.5 h-3.5" />} color="bg-red-50 text-red-700" />
             <VitalMini label="F.C." value={`${consultation.vitalSigns.heartRate} lpm`} icon={<Activity className="w-3.5 h-3.5" />} color="bg-indigo-50 text-indigo-700" />
             <VitalMini label="F.R." value={`${consultation.vitalSigns.respiratoryRate} rpm`} icon={<Wind className="w-3.5 h-3.5" />} color="bg-sky-50 text-sky-700" />
             <VitalMini label="SatO2" value={`${consultation.vitalSigns.oxygenSaturation}%`} icon={<Wind className="w-3.5 h-3.5" />} color="bg-cyan-50 text-cyan-700" />
             <VitalMini label="P.A." value={consultation.vitalSigns.bloodPressure || '--'} icon={<Activity className="w-3.5 h-3.5" />} color="bg-slate-100 text-slate-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SOAP Section: Subjective & Objective */}
            <div className="space-y-6">
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-[10px]">S</span> Subjetivo
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    {consultation.soap.subjective || "No se registraron datos subjetivos."}
                  </p>
               </div>
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-[10px]">O</span> Objetivo
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    {consultation.soap.objective || "No se registraron hallazgos físicos."}
                  </p>
               </div>
               
               {consultation.aiAnalysis && (
                  <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-indigo-600/10 rounded-full" />
                    <h4 className="text-[11px] font-black text-indigo-700 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10">
                      <Sparkles className="w-4 h-4" /> Análisis IA
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium relative z-10 whitespace-pre-wrap">
                      {consultation.aiAnalysis}
                    </p>
                  </div>
               )}
            </div>

            {/* Assessment & Plan */}
            <div className="space-y-6">
               <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 px-4">
                 <ClipboardList className="w-4 h-4 text-emerald-500" /> Diagnósticos y Tratamientos (A/P)
               </h4>
               {consultation.soap.diagnoses.map((diag, idx) => (
                 <div key={diag.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                       <span className="bg-emerald-600 text-white w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black">{idx + 1}</span>
                       <h5 className="font-black text-slate-800 uppercase text-sm tracking-tight">{diag.assessment || "Control / Seguimiento"}</h5>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1.5"><Pill className="w-3.5 h-3.5" /> Tratamiento</p>
                          <div className="bg-blue-50/30 p-4 rounded-2xl text-xs text-slate-700 font-medium leading-relaxed border border-blue-50">
                            {diag.treatment || "Sin tratamiento específico."}
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Plan / Alarmas</p>
                          <div className="bg-orange-50/30 p-4 rounded-2xl text-xs text-slate-700 font-medium leading-relaxed border border-orange-50">
                            {diag.educationalPlan || "Instrucciones generales de cuidado."}
                          </div>
                       </div>
                       {diag.labRequests && (
                         <div className="space-y-1.5 pt-2 border-t border-slate-50">
                           <p className="text-[10px] font-black text-purple-600 uppercase flex items-center gap-1.5"><Microscope className="w-3.5 h-3.5" /> Estudios Solicitados</p>
                           <p className="text-xs text-slate-600 font-bold px-4">{diag.labRequests}</p>
                         </div>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">PediaCare EMR Clinical Summary</p>
          <button 
            onClick={onClose}
            className="px-10 py-3 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95"
          >
            Cerrar Resumen
          </button>
        </div>
      </div>
    </div>
  );
};

const VitalMini = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className={`${color} p-3 rounded-2xl border border-white/50 flex flex-col items-center justify-center text-center shadow-sm`}>
    <span className="text-[8px] font-black uppercase opacity-60 mb-0.5 flex items-center gap-1">{icon} {label}</span>
    <span className="text-xs font-black tracking-tighter">{value}</span>
  </div>
);

export default ConsultationDetailModal;

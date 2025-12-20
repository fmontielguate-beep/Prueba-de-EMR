
import React from 'react';
import { Consultation, Patient } from '../types';
import { calculateAgeInMonths, analyzeGrowth } from '../utils/growthStandards';
import { TrendingUp, Scale, Ruler, Brain, Activity, X } from 'lucide-react';

interface Props {
  patient: Patient;
  consultations: Consultation[];
  isOpen: boolean;
  onClose: () => void;
}

const GrowthHistory: React.FC<Props> = ({ patient, consultations, isOpen, onClose }) => {
  if (!isOpen) return null;

  const history = [...consultations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const calculateBMI = (weight: string, height: string) => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return '--';
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Evolución del Crecimiento</h2>
              <p className="text-sm text-slate-500 font-medium">Histórico de Antropometría • {patient.firstName} {patient.lastName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Activity className="w-16 h-16 opacity-20" />
              <p className="font-medium italic">No hay registros de consultas previas con signos vitales.</p>
            </div>
          ) : (
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha / Edad</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest bg-blue-50/50">
                        <div className="flex items-center justify-center gap-1"><Scale className="w-3 h-3"/> Peso (kg)</div>
                      </th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest bg-emerald-50/50">
                        <div className="flex items-center justify-center gap-1"><Ruler className="w-3 h-3"/> Talla (cm)</div>
                      </th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">IMC</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest bg-purple-50/50">
                        <div className="flex items-center justify-center gap-1"><Brain className="w-3 h-3"/> C. Cefálica</div>
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Interpretación OMS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {history.map((c) => {
                      const analysis = analyzeGrowth(
                        patient.gender,
                        calculateAgeInMonths(patient.dob),
                        parseFloat(c.vitalSigns.weightKg),
                        parseFloat(c.vitalSigns.heightCm),
                        parseFloat(c.vitalSigns.headCircumferenceCm || '0')
                      );

                      return (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-slate-800">{new Date(c.date).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{c.patientAge}</div>
                          </td>
                          <td className="px-6 py-4 text-center bg-blue-50/20">
                            <div className="text-sm font-black text-blue-700">{c.vitalSigns.weightKg}</div>
                            {analysis.wfa && (
                              <div className={`text-[9px] font-bold ${analysis.wfa.color}`}>Z: {analysis.wfa.zScore.toFixed(2)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center bg-emerald-50/20">
                            <div className="text-sm font-black text-emerald-700">{c.vitalSigns.heightCm}</div>
                            {analysis.hfa && (
                              <div className={`text-[9px] font-bold ${analysis.hfa.color}`}>Z: {analysis.hfa.zScore.toFixed(2)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-xs text-slate-600">
                            {calculateBMI(c.vitalSigns.weightKg, c.vitalSigns.heightCm)}
                          </td>
                          <td className="px-6 py-4 text-center bg-purple-50/20">
                            <div className="text-sm font-black text-purple-700">{c.vitalSigns.headCircumferenceCm || '--'}</div>
                            {analysis.hca && (
                              <div className={`text-[9px] font-bold ${analysis.hca.color}`}>Z: {analysis.hca.zScore.toFixed(2)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {analysis.wfa && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${analysis.wfa.color} bg-white shadow-sm whitespace-nowrap`}>
                                  P/E: {analysis.wfa.status}
                                </span>
                              )}
                              {analysis.hfa && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${analysis.hfa.color} bg-white shadow-sm whitespace-nowrap`}>
                                  T/E: {analysis.hfa.status}
                                </span>
                              )}
                              {analysis.wfh && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${analysis.wfh.color} bg-white shadow-sm whitespace-nowrap`}>
                                  P/T: {analysis.wfh.status}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center">
          <p className="text-[10px] text-slate-400 font-medium italic">
            * Referencias basadas en Patrones de Crecimiento Infantil de la OMS (Z-Scores).
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-lg"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrowthHistory;

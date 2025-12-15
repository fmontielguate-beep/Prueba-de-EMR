import React, { useState } from 'react';
import { Calculator, X, Pill, Syringe } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultWeight?: string;
}

const DosageCalculator: React.FC<Props> = ({ isOpen, onClose, defaultWeight = '' }) => {
  const [weight, setWeight] = useState(defaultWeight);
  const [medicationName, setMedicationName] = useState('');
  const [dosePerKg, setDosePerKg] = useState('');
  const [frequency, setFrequency] = useState('1'); // Doses per day
  const [concentrationMg, setConcentrationMg] = useState('');
  const [concentrationMl, setConcentrationMl] = useState('');
  const [calculationMode, setCalculationMode] = useState<'daily' | 'perDose'>('daily');

  if (!isOpen) return null;

  // Calculation Logic
  const w = parseFloat(weight);
  const d = parseFloat(dosePerKg);
  const f = parseFloat(frequency);
  const cMg = parseFloat(concentrationMg);
  const cMl = parseFloat(concentrationMl);

  let resultMl = 0;
  let resultMg = 0;
  let valid = false;

  if (w && d && f && cMg && cMl) {
    valid = true;
    if (calculationMode === 'daily') {
      // (Weight * DosePerKg) / Frequency = Mg per dose
      resultMg = (w * d) / f;
    } else {
      // Weight * DosePerKg = Mg per dose
      resultMg = w * d;
    }
    // (Mg per dose * Ml concentration) / Mg concentration = Ml per dose
    resultMl = (resultMg * cMl) / cMg;
  }

  const handleReset = () => {
    setMedicationName('');
    setDosePerKg('');
    setFrequency('1');
    setConcentrationMg('');
    setConcentrationMl('');
    setCalculationMode('daily');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de Dosis
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Weight */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Peso del Paciente (Kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="w-full text-lg font-semibold border-b-2 border-slate-200 focus:border-blue-500 outline-none py-1 text-slate-800 bg-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Medication Name */}
             <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Medicamento
              </label>
              <div className="relative">
                <Pill className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  placeholder="Ej. Amoxicilina"
                  className="w-full pl-6 border-b border-slate-200 focus:border-blue-500 outline-none py-1 text-slate-700 bg-transparent"
                />
              </div>
            </div>

            {/* Dose */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Dosis por Kg
              </label>
              <div className="flex items-center gap-2">
                 <input
                  type="number"
                  value={dosePerKg}
                  onChange={(e) => setDosePerKg(e.target.value)}
                  placeholder="Ej. 45"
                  className="w-full border-b border-slate-200 focus:border-blue-500 outline-none py-1 text-slate-700 bg-transparent"
                />
                <span className="text-xs text-slate-400">mg/kg</span>
              </div>
            </div>

             {/* Frequency */}
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Veces al día
              </label>
              <input
                type="number"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="Ej. 2"
                className="w-full border-b border-slate-200 focus:border-blue-500 outline-none py-1 text-slate-700 bg-transparent"
              />
            </div>
          </div>

          {/* Mode Switch */}
          <div className="bg-slate-50 p-2 rounded-lg flex gap-1">
             <button
                onClick={() => setCalculationMode('daily')}
                className={`flex-1 text-xs font-medium py-1.5 rounded transition-all ${
                  calculationMode === 'daily' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                Dosis Diaria Total (Dividir)
             </button>
             <button
                onClick={() => setCalculationMode('perDose')}
                 className={`flex-1 text-xs font-medium py-1.5 rounded transition-all ${
                  calculationMode === 'perDose' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                Dosis Por Toma (Directa)
             </button>
          </div>

          {/* Concentration */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Presentación (Concentración)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={concentrationMg}
                  onChange={(e) => setConcentrationMg(e.target.value)}
                  placeholder="Mg"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">mg</span>
              </div>
              <span className="text-slate-400">en</span>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={concentrationMl}
                  onChange={(e) => setConcentrationMl(e.target.value)}
                  placeholder="Ml"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">ml</span>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className={`mt-6 rounded-xl p-4 flex items-center justify-between border-2 transition-all ${
            valid ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'
          }`}>
             <div>
               <p className="text-xs text-slate-500 uppercase font-bold">Administrar</p>
               <h2 className={`text-3xl font-bold ${valid ? 'text-slate-800' : 'text-slate-300'}`}>
                 {valid ? resultMl.toFixed(1) : '--'} <span className="text-lg text-slate-500 font-medium">ml/cc</span>
               </h2>
               {valid && (
                 <p className="text-xs text-green-700 font-medium mt-1">
                   {resultMg.toFixed(0)} mg por toma • Cada toma
                 </p>
               )}
             </div>
             <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
               valid ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
             }`}>
               <Syringe className="w-6 h-6" />
             </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 flex justify-between border-t border-slate-100">
           <button onClick={handleReset} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2">
             Limpiar
           </button>
           <button 
             onClick={onClose}
             className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
           >
             Cerrar
           </button>
        </div>
      </div>
    </div>
  );
};

export default DosageCalculator;
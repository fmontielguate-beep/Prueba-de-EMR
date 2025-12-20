
import React, { useState, useEffect } from 'react';
import { Calculator, X, Pill, Syringe, Scale } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultWeight?: string;
}

const DosageCalculator: React.FC<Props> = ({ isOpen, onClose, defaultWeight = '' }) => {
  const [weight, setWeight] = useState(defaultWeight);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [medicationName, setMedicationName] = useState('');
  const [dosePerKg, setDosePerKg] = useState('');
  const [frequency, setFrequency] = useState('1'); // Doses per day
  const [concentrationMg, setConcentrationMg] = useState('');
  const [concentrationMl, setConcentrationMl] = useState('');
  const [calculationMode, setCalculationMode] = useState<'daily' | 'perDose'>('daily');

  // Sync weight if defaultWeight changes
  useEffect(() => {
    if (defaultWeight) setWeight(defaultWeight);
  }, [defaultWeight]);

  if (!isOpen) return null;

  // Conversion Logic
  const LB_TO_KG = 2.20462;
  
  const handleUnitToggle = (unit: 'kg' | 'lb') => {
    if (unit === weightUnit || !weight) {
      setWeightUnit(unit);
      return;
    }

    const currentWeight = parseFloat(weight);
    if (isNaN(currentWeight)) {
      setWeightUnit(unit);
      return;
    }

    let convertedWeight;
    if (unit === 'lb') {
      // Kg to Lb
      convertedWeight = (currentWeight * LB_TO_KG).toFixed(2);
    } else {
      // Lb to Kg
      convertedWeight = (currentWeight / LB_TO_KG).toFixed(2);
    }
    
    setWeight(convertedWeight);
    setWeightUnit(unit);
  };

  // Internal normalized weight in KG for dosage formulas
  const weightVal = parseFloat(weight);
  const weightInKg = !isNaN(weightVal) 
    ? (weightUnit === 'lb' ? weightVal / LB_TO_KG : weightVal) 
    : 0;

  const d = parseFloat(dosePerKg);
  const f = parseFloat(frequency);
  const cMg = parseFloat(concentrationMg);
  const cMl = parseFloat(concentrationMl);

  let resultMl = 0;
  let resultMg = 0;
  let valid = false;

  if (weightInKg > 0 && d && f && cMg && cMl) {
    valid = true;
    if (calculationMode === 'daily') {
      // (WeightInKg * DosePerKg) / Frequency = Mg per dose
      resultMg = (weightInKg * d) / f;
    } else {
      // WeightInKg * DosePerKg = Mg per dose
      resultMg = weightInKg * d;
    }
    // (Mg per dose * Ml concentration) / Mg concentration = Ml per dose
    resultMl = (resultMg * cMl) / cMg;
  }

  const handleReset = () => {
    setWeight('');
    setWeightUnit('kg');
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
          {/* Weight with Conversion Toggle */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Peso del Paciente
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button 
                  onClick={() => handleUnitToggle('kg')}
                  className={`px-3 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                    weightUnit === 'kg' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  KG
                </button>
                <button 
                  onClick={() => handleUnitToggle('lb')}
                  className={`px-3 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                    weightUnit === 'lb' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  LB
                </button>
              </div>
            </div>
            <div className="relative group">
              <Scale className="w-5 h-5 absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-500" />
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                className="w-full pl-7 text-2xl font-black border-b-2 border-slate-100 focus:border-blue-500 outline-none py-1 text-slate-800 bg-transparent transition-all"
              />
              <span className="absolute right-0 bottom-2 text-xs font-bold text-slate-400 uppercase">
                {weightUnit}
              </span>
            </div>
            {weightUnit === 'lb' && weight && (
              <p className="text-[10px] text-blue-500 font-bold mt-1 animate-in fade-in">
                ≈ {weightInKg.toFixed(2)} kg (valor usado para el cálculo)
              </p>
            )}
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
                className={`flex-1 text-[10px] font-bold py-2 rounded transition-all uppercase tracking-tight ${
                  calculationMode === 'daily' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                Dosis Diaria Total
             </button>
             <button
                onClick={() => setCalculationMode('perDose')}
                 className={`flex-1 text-[10px] font-bold py-2 rounded transition-all uppercase tracking-tight ${
                  calculationMode === 'perDose' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                Dosis Por Toma
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
                  className="w-full border rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none border-slate-200"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black">MG</span>
              </div>
              <span className="text-slate-400 font-bold">/</span>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={concentrationMl}
                  onChange={(e) => setConcentrationMl(e.target.value)}
                  placeholder="Ml"
                  className="w-full border rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none border-slate-200"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black">ML</span>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className={`mt-6 rounded-2xl p-5 flex items-center justify-between border-2 transition-all duration-500 ${
            valid ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-100 scale-105' : 'bg-slate-50 border-slate-100 text-slate-400'
          }`}>
             <div>
               <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${valid ? 'text-indigo-200' : 'text-slate-400'}`}>
                 Administrar por toma
               </p>
               <h2 className={`text-4xl font-black ${valid ? 'text-white' : 'text-slate-300'}`}>
                 {valid ? resultMl.toFixed(1) : '--'} <span className="text-xl font-medium opacity-70">ml</span>
               </h2>
               {valid && (
                 <p className="text-[10px] text-indigo-100 font-bold mt-2 uppercase tracking-wide">
                   = {resultMg.toFixed(1)} mg por toma
                 </p>
               )}
             </div>
             <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${
               valid ? 'bg-white/20 text-white rotate-12' : 'bg-slate-200 text-slate-400'
             }`}>
               <Syringe className="w-7 h-7" />
             </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-100">
           <button onClick={handleReset} className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest px-4 transition-colors">
             Limpiar
           </button>
           <button 
             onClick={onClose}
             className="bg-slate-800 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 active:scale-95"
           >
             Cerrar
           </button>
        </div>
      </div>
    </div>
  );
};

export default DosageCalculator;

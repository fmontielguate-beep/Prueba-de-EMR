import React from 'react';
import { Patient, MedicalHistory } from '../types';
import { Baby, AlertCircle, Users } from 'lucide-react';

interface Props {
  data: Patient;
  onChange: (data: Patient) => void;
}

const MedicalHistoryForm: React.FC<Props> = ({ data, onChange }) => {
  const handleHistoryChange = (section: keyof MedicalHistory, field: string, value: any) => {
    onChange({
      ...data,
      history: {
        ...data.history,
        [section]: {
          ...data.history[section],
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Perinatal */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Baby className="w-5 h-5 text-pink-500" />
          Antecedentes Perinatales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Edad Gestacional (semanas)</label>
            <input
              type="text"
              value={data.history.perinatal.gestationalAge}
              onChange={(e) => handleHistoryChange('perinatal', 'gestationalAge', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
              placeholder="Ej. 38 semanas"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Peso al Nacer</label>
            <input
              type="text"
              value={data.history.perinatal.birthWeight}
              onChange={(e) => handleHistoryChange('perinatal', 'birthWeight', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
              placeholder="Ej. 3.2 kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Tipo de Parto</label>
             <select
              value={data.history.perinatal.deliveryType}
              onChange={(e) => handleHistoryChange('perinatal', 'deliveryType', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
            >
              <option value="">Seleccionar...</option>
              <option value="Eutócico (Vaginal)">Eutócico (Vaginal)</option>
              <option value="Cesárea">Cesárea</option>
              <option value="Instrumentado">Instrumentado</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Complicaciones al Nacer</label>
            <input
              type="text"
              value={data.history.perinatal.birthComplications}
              onChange={(e) => handleHistoryChange('perinatal', 'birthComplications', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
              placeholder="Ej. Ictericia, dificultad respiratoria..."
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700">APGAR (1' / 5')</label>
            <input
              type="text"
              value={data.history.perinatal.apgar}
              onChange={(e) => handleHistoryChange('perinatal', 'apgar', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
              placeholder="Ej. 8 / 9"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pathological */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Antecedentes Patológicos
          </h3>
          <div className="space-y-3">
             <div>
              <label className="block text-sm font-medium text-slate-700">Alergias</label>
              <input
                type="text"
                value={data.history.pathological.allergies}
                onChange={(e) => handleHistoryChange('pathological', 'allergies', e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                placeholder="Alimentos, medicamentos..."
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">Hospitalizaciones / Cirugías</label>
              <textarea
                value={data.history.pathological.surgeries}
                onChange={(e) => handleHistoryChange('pathological', 'surgeries', e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white resize-none h-20"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">Medicamentos Actuales</label>
              <input
                type="text"
                value={data.history.pathological.medications}
                onChange={(e) => handleHistoryChange('pathological', 'medications', e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Family */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Antecedentes Familiares
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.history.family.diabetes}
                  onChange={(e) => handleHistoryChange('family', 'diabetes', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-slate-700 text-sm">Diabetes</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.history.family.hypertension}
                  onChange={(e) => handleHistoryChange('family', 'hypertension', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-slate-700 text-sm">Hipertensión</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.history.family.asthma}
                  onChange={(e) => handleHistoryChange('family', 'asthma', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-slate-700 text-sm">Asma / Rinitis</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Otros Relevantes</label>
              <textarea
                value={data.history.family.other}
                onChange={(e) => handleHistoryChange('family', 'other', e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white resize-none h-20"
                placeholder="Enfermedades hereditarias..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryForm;
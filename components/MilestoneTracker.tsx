import React from 'react';
import { MILESTONES } from '../constants';
import { Patient, MilestoneCategory } from '../types';
import { Baby, Check, AlertCircle, Brain, Smile, Activity, MessageCircle } from 'lucide-react';

interface Props {
  patient: Patient;
  onChange: (updatedPatient: Patient) => void;
}

const MilestoneTracker: React.FC<Props> = ({ patient, onChange }) => {
  const handleMilestoneChange = (milestoneId: string, field: 'status' | 'achievedAge', value: string) => {
    const currentData = patient.milestones[milestoneId] || { achievedAge: '', status: 'normal' };
    
    onChange({
      ...patient,
      milestones: {
        ...patient.milestones,
        [milestoneId]: {
          ...currentData,
          [field]: value
        }
      }
    });
  };

  const getCategoryIcon = (category: MilestoneCategory) => {
    switch (category) {
      case 'motor': return <Activity className="w-4 h-4 text-orange-500" />;
      case 'language': return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'social': return <Smile className="w-4 h-4 text-yellow-500" />;
      case 'cognitive': return <Brain className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryLabel = (category: MilestoneCategory) => {
    switch (category) {
      case 'motor': return 'Motor';
      case 'language': return 'Lenguaje';
      case 'social': return 'Social';
      case 'cognitive': return 'Cognitivo';
    }
  };

  const groupedMilestones = MILESTONES.reduce((acc, curr) => {
    if (!acc[curr.ageGroup]) acc[curr.ageGroup] = [];
    acc[curr.ageGroup].push(curr);
    return acc;
  }, {} as Record<string, typeof MILESTONES>);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Baby className="w-5 h-5 text-blue-600" />
          Hitos del Desarrollo
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Registre la edad de logro y marque si fue normal para la edad.
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedMilestones).map(([age, milestones]) => (
          <div key={age} className="border border-slate-100 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
               <h4 className="font-semibold text-slate-800">{age}</h4>
               <span className="text-xs text-slate-500">Edad Esperada</span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {milestones.map((m) => {
                const data = patient.milestones[m.id] || { achievedAge: '', status: 'normal' };
                
                return (
                  <div key={m.id} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Description & Category */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                             {getCategoryIcon(m.category)}
                             {getCategoryLabel(m.category)}
                           </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{m.description}</p>
                      </div>

                      {/* Inputs */}
                      <div className="flex items-center gap-3">
                         <div className="flex flex-col">
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Edad Logro</label>
                            <input 
                              type="text"
                              placeholder="Ej. 6 meses"
                              value={data.achievedAge}
                              onChange={(e) => handleMilestoneChange(m.id, 'achievedAge', e.target.value)}
                              className="text-xs border border-slate-300 rounded px-2 py-1.5 w-24 focus:border-blue-500 focus:outline-none"
                            />
                         </div>
                         
                         <div className="flex flex-col">
                           <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Estado</label>
                           <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                              <button
                                onClick={() => handleMilestoneChange(m.id, 'status', 'normal')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                                  data.status === 'normal' 
                                    ? 'bg-white text-green-700 shadow-sm border border-slate-200' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <Check className="w-3 h-3" /> Normal
                              </button>
                              <button
                                onClick={() => handleMilestoneChange(m.id, 'status', 'abnormal')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                                  data.status === 'abnormal'
                                    ? 'bg-white text-red-700 shadow-sm border border-slate-200'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <AlertCircle className="w-3 h-3" /> Anormal
                              </button>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTracker;
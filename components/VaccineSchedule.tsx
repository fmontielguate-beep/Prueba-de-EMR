import React, { useState } from 'react';
import { VACCINES_AAP } from '../constants';
import { Patient, OtherVaccine } from '../types';
import { Syringe, AlertTriangle, Plus, Trash2, CalendarCheck, ShieldCheck, CalendarClock, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface Props {
  patient: Patient;
  onChange: (updatedPatient: Patient) => void;
}

const VaccineSchedule: React.FC<Props> = ({ patient, onChange }) => {
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newVaccineDate, setNewVaccineDate] = useState('');
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  
  // State for the new Confirmation Modal
  const [showAutoFillModal, setShowAutoFillModal] = useState(false);
  const [pendingUpdateCount, setPendingUpdateCount] = useState(0);

  const handleDateChange = (vaccineId: string, date: string) => {
    onChange({
      ...patient,
      vaccines: {
        ...patient.vaccines,
        [vaccineId]: date
      }
    });
  };

  const handleAddOtherVaccine = () => {
    if (!newVaccineName || !newVaccineDate) return;
    const newVaccine: OtherVaccine = {
      id: crypto.randomUUID(),
      name: newVaccineName,
      date: newVaccineDate
    };
    onChange({
      ...patient,
      otherVaccines: [...(patient.otherVaccines || []), newVaccine]
    });
    setNewVaccineName('');
    setNewVaccineDate('');
  };

  const handleRemoveOtherVaccine = (id: string) => {
    onChange({
      ...patient,
      otherVaccines: (patient.otherVaccines || []).filter(v => v.id !== id)
    });
  };

  // 1. First, calculate what needs to be done and show modal
  const handleOpenAutoFillModal = () => {
    if (!patient.dob) {
      alert("⚠️ Falta Información:\n\nPor favor ingrese la Fecha de Nacimiento del paciente en la pestaña 'Datos' antes de utilizar esta función automática.");
      return;
    }

    // Calculate potential updates
    const [y, m, d] = patient.dob.split('-').map(Number);
    const dob = new Date(y, m - 1, d, 12, 0, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let count = 0;

    VACCINES_AAP.forEach(v => {
      const dueDate = new Date(dob);
      dueDate.setMonth(dueDate.getMonth() + v.offsetMonths);

      // Check if due date is today or in past AND not already filled
      if (dueDate <= today && !patient.vaccines[v.id]) {
        count++;
      }
    });

    if (count === 0) {
      alert("✅ El expediente ya está al día.\n\nNo se encontraron vacunas anteriores a la fecha actual que estén pendientes de registro.");
      return;
    }

    setPendingUpdateCount(count);
    setShowAutoFillModal(true);
  };

  // 2. Execute the action after confirmation
  const confirmAutoFill = () => {
    const [y, m, d] = patient.dob.split('-').map(Number);
    const dob = new Date(y, m - 1, d, 12, 0, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const newVaccines = { ...patient.vaccines };

    VACCINES_AAP.forEach(v => {
      const dueDate = new Date(dob);
      dueDate.setMonth(dueDate.getMonth() + v.offsetMonths);

      if (dueDate <= today && !newVaccines[v.id]) {
        // Format YYYY-MM-DD based on the DUE DATE (Ideal date), not today's date
        // This keeps the history accurate to the recommended schedule
        const year = dueDate.getFullYear();
        const month = String(dueDate.getMonth() + 1).padStart(2, '0');
        const day = String(dueDate.getDate()).padStart(2, '0');
        newVaccines[v.id] = `${year}-${month}-${day}`;
      }
    });

    onChange({ ...patient, vaccines: newVaccines });
    setShowAutoFillModal(false);
  };

  // Helper to calculate status for reminders
  const getVaccineStatus = (vaccine: typeof VACCINES_AAP[0]) => {
    if (patient.vaccines[vaccine.id]) return { status: 'administered', label: 'Administrada' };
    if (!patient.dob) return { status: 'unknown', label: 'Pendiente' };

    // Parse DOB ensuring local time
    const [y, m, d] = patient.dob.split('-').map(Number);
    const dob = new Date(y, m - 1, d, 12, 0, 0);
    const today = new Date();
    
    const dueDate = new Date(dob);
    dueDate.setMonth(dueDate.getMonth() + vaccine.offsetMonths);

    const currentMonth = today.getMonth(); // 0 = Jan, 9 = Oct

    // Lógica Específica para Influenza
    if (vaccine.name.toLowerCase().includes('influenza')) {
       // Si ya pasó la fecha por edad, pero NO estamos en temporada (Ene-Sept), marcamos como espera estacional
       if (dueDate < today && currentMonth < 9) {
          return { status: 'seasonal', label: 'Estacional (Oct-Nov)', dueDate };
       }
    }

    // Set comparison to ignore time portion
    const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueNoTime = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    if (dueNoTime < todayNoTime) return { status: 'overdue', label: 'Vencida', dueDate };
    
    const nextMonth = new Date(todayNoTime);
    nextMonth.setDate(nextMonth.getDate() + 30);
    
    if (dueNoTime <= nextMonth) return { status: 'upcoming', label: 'Próxima', dueDate };

    return { status: 'future', label: 'Futura', dueDate };
  };

  // Group vaccines by Series Name
  const vaccineGroups = VACCINES_AAP.reduce((groups, vaccine) => {
    const seriesName = vaccine.name.split(' (')[0];
    if (!groups[seriesName]) {
      groups[seriesName] = [];
    }
    groups[seriesName].push(vaccine);
    return groups;
  }, {} as Record<string, typeof VACCINES_AAP>);

  const allStatuses = VACCINES_AAP.map(v => ({ ...v, ...getVaccineStatus(v) }));
  const alerts = allStatuses.filter(v => v.status === 'overdue' || v.status === 'upcoming' || v.status === 'seasonal');
  const overdueCount = alerts.filter(a => a.status === 'overdue').length;

  // Función para obtener estilos de alerta según estado
  const getAlertStyle = (status: string) => {
    switch(status) {
      case 'overdue': return 'bg-white border-red-200 text-red-700';
      case 'upcoming': return 'bg-white border-yellow-200 text-yellow-700';
      case 'seasonal': return 'bg-white border-blue-200 text-blue-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getAlertIconColor = (status: string) => {
    switch(status) {
      case 'overdue': return 'bg-red-500';
      case 'upcoming': return 'bg-yellow-500';
      case 'seasonal': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Reminders Section */}
      {patient.dob && alerts.length > 0 && (
        <div className="bg-orange-50/90 backdrop-blur border border-orange-200 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
             <div className="flex-1">
                <h4 className="text-orange-800 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Estado de Vacunación
                </h4>
                {overdueCount > 0 && (
                  <p className="text-xs text-orange-700 mt-1">
                    Se detectaron <strong>{overdueCount}</strong> vacunas que debieron aplicarse anteriormente según la edad.
                  </p>
                )}
             </div>

             {/* Mark as Up To Date Button - Opens Modal */}
             <button
               onClick={handleOpenAutoFillModal}
               className="shrink-0 flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold shadow-md transition-all whitespace-nowrap"
               title="Marcar todas las vacunas anteriores como aplicadas"
             >
               <ShieldCheck className="w-4 h-4" />
               Vacunación al día
             </button>
          </div>
          
          {/* Smart Alert List */}
          {overdueCount > 5 && !showAllAlerts ? (
            <div className="bg-white/60 rounded-lg p-3 border border-orange-100 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="flex -space-x-2">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className="w-6 h-6 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-red-600">!</div>
                   ))}
                 </div>
                 <span className="text-sm text-slate-700 font-medium">
                   {overdueCount} vacunas pendientes de registro histórico.
                 </span>
               </div>
               <button 
                 onClick={() => setShowAllAlerts(true)}
                 className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
               >
                 Ver todas <ChevronDown className="w-3 h-3" />
               </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {alerts.map(vaccine => (
                  <div key={vaccine.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm shadow-sm transition-colors ${getAlertStyle(vaccine.status)}`}>
                    <span className={`w-2 h-2 rounded-full ${getAlertIconColor(vaccine.status)}`} />
                    <span className="font-semibold">{vaccine.name}</span>
                    <span className="text-slate-500 text-xs">
                      ({vaccine.status === 'seasonal' ? 'Temp. Oct-Nov' : vaccine.dueDate?.toLocaleDateString()})
                    </span>
                  </div>
                ))}
              </div>
              {overdueCount > 5 && (
                <div className="flex justify-center mt-2">
                  <button 
                    onClick={() => setShowAllAlerts(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <ChevronUp className="w-3 h-3" /> Colapsar lista
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Schedule Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-blue-50/80 border-b border-blue-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-blue-600" />
              Esquema de Vacunación
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Registro de dosis según esquema AAP (American Academy of Pediatrics).
            </p>
          </div>
          {!patient.dob && (
             <div className="bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg text-xs font-medium border border-yellow-200 flex items-center gap-2">
               <AlertTriangle className="w-3.5 h-3.5" />
               Ingrese F. Nacimiento para calcular fechas.
             </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-48 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Vacuna
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Registro de Dosis (Fecha de Aplicación)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {Object.entries(vaccineGroups).map(([seriesName, vaccines]) => (
                <tr key={seriesName} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Vaccine Name Column */}
                  <td className="py-4 px-6 font-semibold text-slate-700 text-sm align-middle sticky left-0 bg-white group-hover:bg-slate-50/80 transition-colors z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    {seriesName}
                  </td>
                  
                  {/* Doses Column - Horizontal Layout */}
                  <td className="py-3 px-6 align-middle">
                    <div className="flex items-start gap-3 overflow-x-auto py-2 px-1">
                      {vaccines.map((vaccine) => {
                        const appliedDate = patient.vaccines[vaccine.id] || '';
                        const { status } = getVaccineStatus(vaccine);
                        
                        return (
                          <div key={vaccine.id} className="flex flex-col gap-1.5 w-[140px] shrink-0 group/item">
                            <div className="flex justify-between items-baseline px-1">
                               <span className="text-xs font-bold text-slate-600">
                                 {vaccine.dose}ª Dosis
                               </span>
                               <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                 status === 'administered' ? 'bg-green-100 text-green-700' :
                                 status === 'overdue' ? 'bg-red-100 text-red-600' :
                                 status === 'seasonal' ? 'bg-blue-100 text-blue-600' :
                                 'bg-slate-100 text-slate-400'
                               }`}>
                                 {status === 'seasonal' ? 'Temp. Oct' : vaccine.recommendedAge}
                               </span>
                            </div>
                            
                            <div className="relative">
                              <input
                                type="date"
                                value={appliedDate}
                                onChange={(e) => handleDateChange(vaccine.id, e.target.value)}
                                className={`w-full text-xs border rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm ${
                                  appliedDate 
                                    ? 'border-green-300 bg-green-50 text-green-800 font-medium' 
                                    : status === 'overdue' 
                                      ? 'border-red-300 bg-red-50'
                                      : status === 'seasonal'
                                        ? 'border-blue-200 bg-blue-50/50'
                                        : 'border-slate-200 bg-white hover:border-blue-300'
                                }`}
                              />
                              {appliedDate && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none">
                                   <CalendarCheck className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {status === 'seasonal' && !appliedDate && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" title="Vacuna estacional">
                                   <CalendarClock className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Placeholder for Extra Dose */}
                      <div className="flex flex-col gap-1.5 w-[100px] shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                         <div className="flex justify-between items-baseline px-1">
                             <span className="text-xs font-medium text-slate-400">Extra</span>
                         </div>
                         <button className="w-full h-[34px] border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs">
                            <Plus className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Other Vaccines / Emerging */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-purple-50/80 border-b border-purple-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Syringe className="w-5 h-5 text-purple-600" />
            Otras Vacunas / Emergentes
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Espacio para registrar vacunas no incluidas en el esquema estándar (Fiebre amarilla, Rabia, Viajero, etc.)
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="flex-1 w-full">
               <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Nombre de la Vacuna</label>
               <input 
                  type="text" 
                  value={newVaccineName}
                  onChange={(e) => setNewVaccineName(e.target.value)}
                  placeholder="Ej. Fiebre Amarilla"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
               />
             </div>
             <div className="w-full md:w-48">
               <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Fecha Aplicación</label>
               <input 
                  type="date" 
                  value={newVaccineDate}
                  onChange={(e) => setNewVaccineDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
               />
             </div>
             <button 
                onClick={handleAddOtherVaccine}
                disabled={!newVaccineName || !newVaccineDate}
                className="w-full md:w-auto bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
             >
               <Plus className="w-4 h-4" /> Agregar Dosis
             </button>
          </div>

          {(patient.otherVaccines || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {patient.otherVaccines.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm group hover:border-purple-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                       <Syringe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{v.name}</p>
                      <p className="text-xs text-slate-500">{new Date(v.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveOtherVaccine(v.id)}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-6 text-slate-400 text-sm italic">
               No hay vacunas adicionales registradas.
             </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Auto Fill */}
      {showAutoFillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Confirmar Actualización</h3>
                  <p className="text-sm text-slate-500">Vacunación al día</p>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
                <p className="text-slate-700 text-sm mb-2">
                  Se ha detectado que el paciente tiene <strong>{pendingUpdateCount} vacunas</strong> que corresponden a su edad y no están registradas.
                </p>
                <p className="text-xs text-slate-500">
                  Al confirmar, estas dosis se marcarán automáticamente con su fecha ideal de aplicación según el esquema AAP.
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
              <button 
                onClick={() => setShowAutoFillModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmAutoFill}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Confirmar y Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VaccineSchedule;
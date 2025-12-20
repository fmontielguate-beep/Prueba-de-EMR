
import React, { useState, useEffect } from 'react';
import PatientForm from './components/PatientForm';
import MedicalHistoryForm from './components/MedicalHistory';
import VaccineSchedule from './components/VaccineSchedule';
import MilestoneTracker from './components/MilestoneTracker';
import WeedConsultation from './components/WeedConsultation';
import ConsultationHistory from './components/ConsultationHistory';
import PatientList from './components/PatientList';
import DosageCalculator from './components/DosageCalculator';
import PediatricChatbot from './components/PediatricChatbot';
import CalendarPopup from './components/CalendarPopup';
import GrowthHistory from './components/GrowthHistory';
import { Patient, SoapNote, Consultation, VitalSigns, LabResult } from './types';
import { Activity, ArrowLeft, History, X, FileText, Users, Baby, Stethoscope, Lock, ShieldAlert, KeyRound, FlaskConical, ShieldCheck, LogOut, ClipboardList, Sparkles, Unlock, TrendingUp, Trash2, Pill, HeartPulse, ShieldHalf } from 'lucide-react';

// Helpers
const calculateAge = (dobString: string): string => {
  if (!dobString) return 'Edad desconocida';
  const birthDate = new Date(dobString);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  
  return `${years} años y ${months} meses`;
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Icono Wind (para Asma)
const WindIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
);

// Initial state
const emptyPatient: Patient = {
  id: '',
  firstName: '',
  lastName: '',
  gender: 'male',
  dob: '',
  address: '',
  phone: '',
  email: '',
  nit: '',
  father: { name: '', age: '', profession: '' },
  mother: { name: '', age: '', profession: '' },
  history: {
    perinatal: { gestationalAge: '', birthWeight: '', deliveryType: '', birthComplications: '', apgar: '' },
    pathological: { allergies: '', hospitalizations: '', surgeries: '', medications: '' },
    family: { diabetes: false, hypertension: false, asthma: false, other: '' }
  },
  vaccines: {},
  otherVaccines: [],
  milestones: {},
};

function App() {
  const [accessStep, setAccessStep] = useState<'selection' | 'login' | 'app'>('selection');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [view, setView] = useState<'list' | 'detail'>('list');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGrowthHistory, setShowGrowthHistory] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activePatient, setActivePatient] = useState<Patient>(emptyPatient);

  // --- Handlers ---

  const handleSelectDemo = () => {
    setAccessStep('app');
  };

  const handleSelectFull = () => {
    setAccessStep('login');
    setAuthError(false);
    setPasswordInput('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Helena 2016') {
      setAccessStep('app');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setAccessStep('selection');
    setView('list');
    setActivePatient(emptyPatient);
    setPasswordInput('');
  };

  const handleNewPatient = () => {
    setActivePatient({ ...emptyPatient, id: generateId() });
    setCurrentStep(1);
    setView('detail');
    setShowHistoryPanel(false);
  };

  const handleSelectPatient = (id: string) => {
    const p = patients.find(pat => pat.id === id);
    if (p) {
      setActivePatient(p);
      setCurrentStep(3);
      setView('detail');
      setShowHistoryPanel(false);
    }
  };

  const handleDeletePatient = (id: string) => {
    if (!window.confirm("¿Está seguro de eliminar este paciente y todo su historial?")) return;
    setPatients(prev => prev.filter(p => p.id !== id));
    if (activePatient.id === id) {
      setActivePatient(emptyPatient);
      setView('list');
    }
  };

  const handleDeleteConsultation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("¿Desea eliminar este registro histórico?")) return;
    setConsultations(prev => prev.filter(c => c.id !== id));
  };

  const handlePatientChange = (updatedPatient: Patient) => {
    setActivePatient(updatedPatient);
    setPatients(prev => {
      const exists = prev.find(p => p.id === updatedPatient.id);
      if (exists) return prev.map(p => p.id === updatedPatient.id ? updatedPatient : p);
      return [...prev, updatedPatient];
    });
  };

  const handleSaveConsultation = (note: SoapNote, vitals: VitalSigns, labs: LabResult[], aiAnalysis?: string) => {
    const newConsultation: Consultation = {
      id: generateId(),
      patientId: activePatient.id,
      date: new Date().toISOString(),
      patientAge: calculateAge(activePatient.dob),
      soap: note,
      vitalSigns: vitals,
      labResults: labs,
      aiAnalysis: aiAnalysis
    };
    
    setConsultations(prev => [newConsultation, ...prev]);
    alert("Consulta guardada exitosamente.");
    setShowHistoryPanel(false);
  };

  const handleImportData = (importedPatients: Patient[], importedConsultations: Consultation[]) => {
    setPatients(importedPatients);
    setConsultations(importedConsultations);
    alert('Datos restaurados correctamente.');
  };

  const allPatientConsultations = consultations
    .filter(c => c.patientId === activePatient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-20 max-w-5xl mx-auto">
            <PatientForm data={activePatient} onChange={handlePatientChange} />
            <MedicalHistoryForm data={activePatient} onChange={handlePatientChange} />
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start animate-in fade-in slide-in-from-right-8 duration-500 pb-20 max-w-[95rem] mx-auto">
            <VaccineSchedule patient={activePatient} onChange={handlePatientChange} />
            <MilestoneTracker patient={activePatient} onChange={handlePatientChange} />
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 pb-20 max-w-[95rem] mx-auto relative">
            <div className="flex justify-end gap-3 mb-4">
               <button onClick={() => setShowGrowthHistory(true)} className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-100 transition-colors font-bold text-sm">
                 <TrendingUp className="w-4 h-4" /> Antropometría
               </button>
               <button onClick={() => setShowHistoryPanel(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium text-sm">
                 <History className="w-4 h-4" /> Detalle Histórico ({allPatientConsultations.length})
               </button>
            </div>
            <WeedConsultation patient={activePatient} onSave={handleSaveConsultation} />
            
            <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${showHistoryPanel ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              <div className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${showHistoryPanel ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowHistoryPanel(false)} />
              <div className={`absolute inset-y-0 right-0 max-w-full flex transition-transform duration-300 ease-in-out ${showHistoryPanel ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="w-screen sm:w-[500px] md:w-[600px] bg-white shadow-2xl flex flex-col h-full">
                   <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                     <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-blue-600" /> Historial Completo</h2>
                     <button onClick={() => setShowHistoryPanel(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                     <ConsultationHistory consultations={allPatientConsultations} patient={activePatient} onDelete={handleDeleteConsultation} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (accessStep === 'selection') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-purple-50 to-rose-100 p-4">
        <div className="max-w-4xl w-full">
           <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-4">PediaCare<span className="text-blue-600">EMR</span></h1>
            <p className="text-lg text-slate-600">Sistema Integral de Expediente Médico Pediátrico</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button onClick={handleSelectDemo} className="group bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl hover:shadow-2xl transition-all text-left">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6"><Unlock className="w-8 h-8" /></div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Versión Prueba</h2>
                <p className="text-slate-600 text-sm">Prueba las funciones del sistema sin contraseña.</p>
              </button>
              <button onClick={handleSelectFull} className="group bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl hover:shadow-2xl transition-all text-left">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6"><ShieldCheck className="w-8 h-8" /></div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Clínico</h2>
                <p className="text-slate-600 text-sm">Uso profesional del expediente médico.</p>
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (accessStep === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Seguridad Clínica</h1>
            <p className="text-slate-500 text-sm">Ingrese clave de autorización</p>
          </div>
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contraseña..." autoFocus />
            {authError && <p className="text-xs text-red-600 font-bold">Clave incorrecta.</p>}
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl">Entrar al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <>
        <div className="absolute top-4 right-4 z-40">
           <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-600 hover:text-red-600 border border-slate-200 shadow-sm transition-all"><LogOut className="w-4 h-4" /> Salir</button>
        </div>
        <PatientList patients={patients} consultations={consultations} onSelect={handleSelectPatient} onNew={handleNewPatient} onDelete={handleDeletePatient} onImportData={handleImportData} />
        <PediatricChatbot />
      </>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-20 bg-slate-50/30">
      <DosageCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <CalendarPopup isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
      <GrowthHistory isOpen={showGrowthHistory} onClose={() => setShowGrowthHistory(false)} patient={activePatient} consultations={allPatientConsultations} />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[95rem] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft className="w-5 h-5" /></button>
            <span className="text-xl font-bold text-slate-800">PediaCare<span className="text-blue-600">EMR</span></span>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <div className="text-slate-900 font-bold text-sm leading-tight">{activePatient.firstName} {activePatient.lastName}</div>
                <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{calculateAge(activePatient.dob)}</div>
             </div>
             <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">{activePatient.firstName[0]}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[95rem] mx-auto px-6 py-8">
        
        {/* RESUMEN DE ANTECEDENTES CRÍTICOS (NUEVO) */}
        {view === 'detail' && activePatient.id && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                 <ShieldAlert className="w-4 h-4" /> Alergias y Patológicos
               </h3>
               <div className="space-y-3">
                  <div className={`p-3 rounded-xl border ${activePatient.history.pathological.allergies ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                    <span className="text-[10px] font-black uppercase block opacity-70">Alergias</span>
                    <p className="text-sm font-bold">{activePatient.history.pathological.allergies || "Niega alergias."}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase block text-slate-400">Patológicos / Cirugías</span>
                      <p className="text-xs text-slate-700 font-medium line-clamp-1">{activePatient.history.pathological.surgeries || "Sin registros."}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase block text-slate-400">Medicación</span>
                      <p className="text-xs text-slate-700 font-medium line-clamp-1"><Pill className="w-3 h-3 inline mr-1 text-blue-500" /> {activePatient.history.pathological.medications || "Ninguna."}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                 <ShieldHalf className="w-4 h-4" /> Riesgos Familiares
               </h3>
               <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${activePatient.history.family.diabetes ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                    <Activity className="w-4 h-4 mb-1" />
                    <span className="text-[9px] font-black uppercase">Diabetes</span>
                  </div>
                  <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${activePatient.history.family.hypertension ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                    <HeartPulse className="w-4 h-4 mb-1" />
                    <span className="text-[9px] font-black uppercase">HTA</span>
                  </div>
                  <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${activePatient.history.family.asthma ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                    <WindIcon className="w-4 h-4 mb-1" />
                    <span className="text-[9px] font-black uppercase">Asma</span>
                  </div>
               </div>
               <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                 <span className="text-[9px] font-black uppercase block text-slate-400">Otros Familiares</span>
                 <p className="text-xs text-slate-600 italic line-clamp-1">{activePatient.history.family.other || "Sin otros registros."}</p>
               </div>
            </div>
          </div>
        )}

        {/* TABLA DE EVOLUCIÓN CLÍNICA */}
        {view === 'detail' && allPatientConsultations.length > 0 && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
             <div className="flex justify-between items-center mb-3">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><ClipboardList className="w-4 h-4 text-blue-600" /> Historial de Evolución Clínica</h3>
             </div>
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Edad</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Diagnóstico(s)</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Gestión</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allPatientConsultations.map((c) => (
                          <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                             <td className="px-4 py-3 align-top">
                                <div className="text-xs font-bold text-slate-800">{new Date(c.date).toLocaleDateString()}</div>
                                {c.aiAnalysis && <span className="text-[9px] text-indigo-600 font-bold flex items-center gap-1 mt-1"><Sparkles className="w-2.5 h-2.5" /> IA</span>}
                             </td>
                             <td className="px-4 py-3 align-top"><span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{c.patientAge}</span></td>
                             <td className="px-4 py-3 align-top">
                                <div className="flex flex-wrap gap-1.5">
                                  {c.soap.diagnoses.map(d => (
                                    <span key={d.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded border border-blue-100 uppercase tracking-tighter">
                                      {d.assessment || "Control"}
                                    </span>
                                  ))}
                                </div>
                             </td>
                             <td className="px-4 py-3 align-middle text-center">
                               <button onClick={(e) => handleDeleteConsultation(e, c.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        <div className="mt-4 min-h-[60vh]">{renderStep()}</div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-30 pb-safe h-16">
        <div className="max-w-[95rem] mx-auto px-6 h-full flex justify-around items-center">
           <button onClick={() => setView('list')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-all"><Users className="w-5 h-5" /><span className="text-[10px] font-bold">Inicio</span></button>
           <button onClick={() => setCurrentStep(1)} className={`flex flex-col items-center gap-1 transition-all ${currentStep === 1 ? 'text-blue-600' : 'text-slate-400'}`}><FileText className="w-5 h-5" /><span className="text-[10px] font-bold">Datos</span></button>
           <button onClick={() => setCurrentStep(2)} className={`flex flex-col items-center gap-1 transition-all ${currentStep === 2 ? 'text-blue-600' : 'text-slate-400'}`}><Baby className="w-5 h-5" /><span className="text-[10px] font-bold">Hitos</span></button>
           <button onClick={() => setCurrentStep(3)} className={`flex flex-col items-center gap-1 transition-all ${currentStep === 3 ? 'text-blue-600' : 'text-slate-400'}`}><Stethoscope className="w-5 h-5" /><span className="text-[10px] font-bold">Consulta</span></button>
        </div>
      </div>
      
      <PediatricChatbot />
    </div>
  );
}

export default App;

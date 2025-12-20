
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
import { Activity, ArrowLeft, Calculator, History, X, FileText, Users, Baby, Stethoscope, Undo2, Lock, ShieldAlert, KeyRound, FlaskConical, ShieldCheck, LogOut, ClipboardList, Sparkles, Calendar as CalendarIcon, Unlock, TrendingUp, Trash2, AlertCircle, Pill, HeartPulse } from 'lucide-react';

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
  // Navigation & Access State
  const [accessStep, setAccessStep] = useState<'selection' | 'login' | 'app'>('selection');
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Auth State
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // App State
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGrowthHistory, setShowGrowthHistory] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  
  // Database
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activePatient, setActivePatient] = useState<Patient>(emptyPatient);
  const [undoAlert, setUndoAlert] = useState<{ message: string; onUndo: () => void } | null>(null);

  useEffect(() => {
    if (undoAlert) {
      const timer = setTimeout(() => {
        setUndoAlert(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [undoAlert]);

  // --- Handlers ---

  const handleSelectDemo = () => {
    setAccessStep('app');
    setIsDemoMode(true);
  };

  const handleSelectFull = () => {
    setAccessStep('login');
    setIsDemoMode(false);
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
    setIsDemoMode(false);
    setView('list');
    setActivePatient(emptyPatient);
    setPasswordInput('');
    setAuthError(false);
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
    const previousPatients = [...patients];
    const patientToDelete = patients.find(p => p.id === id);
    const wasActive = activePatient.id === id;

    setPatients(prev => prev.filter(p => p.id !== id));
    
    if (wasActive) {
      setActivePatient(emptyPatient);
      setView('list');
    }

    setUndoAlert({
      message: `Paciente ${patientToDelete?.firstName} eliminado`,
      onUndo: () => {
        setPatients(previousPatients);
        if (wasActive && patientToDelete) {
            setActivePatient(patientToDelete);
            setView('detail'); 
        }
        setUndoAlert(null);
      }
    });
  };

  const handleDeleteConsultation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("¿Está seguro de eliminar esta consulta histórica? Esta acción no se puede deshacer.")) return;
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
    alert("Consulta guardada exitosamente en el expediente.");
  };

  const handleImportData = (importedPatients: Patient[], importedConsultations: Consultation[]) => {
    setPatients(importedPatients);
    setConsultations(importedConsultations);
    alert('Respaldo restaurado exitosamente.');
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
            <div className="w-full">
              <VaccineSchedule patient={activePatient} onChange={handlePatientChange} />
            </div>
            <div className="w-full">
              <MilestoneTracker patient={activePatient} onChange={handlePatientChange} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 pb-20 max-w-[95rem] mx-auto relative">
            <div className="flex justify-end gap-3 mb-4">
               <button onClick={() => setShowGrowthHistory(true)} className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-100 transition-colors font-bold text-sm">
                 <TrendingUp className="w-4 h-4" /> Historial de Crecimiento
               </button>
               <button onClick={() => setShowHistoryPanel(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium text-sm">
                 <History className="w-4 h-4" /> Ver Detalle Histórico ({allPatientConsultations.length})
               </button>
            </div>
            <div className="w-full">
               <WeedConsultation patient={activePatient} onSave={(note, vitals, labs) => handleSaveConsultation(note, vitals, labs)} />
            </div>
            <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${showHistoryPanel ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              <div className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${showHistoryPanel ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowHistoryPanel(false)} />
              <div className={`absolute inset-y-0 right-0 max-w-full flex transition-transform duration-300 ease-in-out ${showHistoryPanel ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="w-screen sm:w-[500px] md:w-[600px] bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
                   <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <div>
                       <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-blue-600" /> Historial Clínico</h2>
                       <p className="text-xs text-slate-500">{activePatient.firstName} {activePatient.lastName}</p>
                     </div>
                     <button onClick={() => setShowHistoryPanel(false)} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                     <ConsultationHistory consultations={allPatientConsultations} patient={activePatient} onDelete={handleDeleteConsultation} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Paso no encontrado</div>;
    }
  };

  const BottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-30 pb-safe">
      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around items-center h-16">
          <button onClick={() => setView('list')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors p-2"><Users className="w-5 h-5" /><span className="text-[10px] font-medium">Inicio</span></button>
          <div className="h-8 w-px bg-slate-200" />
          <button onClick={() => setCurrentStep(1)} className={`flex flex-col items-center gap-1 transition-colors p-2 ${view === 'detail' && currentStep === 1 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} disabled={view === 'list'}><FileText className="w-5 h-5" /><span className="text-[10px] font-medium">Datos</span></button>
          <button onClick={() => setCurrentStep(2)} className={`flex flex-col items-center gap-1 transition-colors p-2 ${view === 'detail' && currentStep === 2 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} disabled={view === 'list'}><Baby className="w-5 h-5" /><span className="text-[10px] font-medium">Seguimiento</span></button>
          <button onClick={() => setCurrentStep(3)} className={`flex flex-col items-center gap-1 transition-colors p-2 ${view === 'detail' && currentStep === 3 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} disabled={view === 'list'}><Stethoscope className="w-5 h-5" /><span className="text-[10px] font-medium">Consulta</span></button>
        </div>
      </div>
    </div>
  );

  if (accessStep === 'selection') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-purple-50 to-rose-100 p-4">
        <div className="max-w-4xl w-full">
           <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-4">PediaCare<span className="text-blue-600">EMR</span></h1>
            <p className="text-lg text-slate-600">Sistema Integral de Expediente Médico Pediátrico</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <button onClick={handleSelectDemo} className="group relative bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-full -mr-16 -mt-16 z-0 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Unlock className="w-8 h-8" /></div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Versión de Prueba</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">Entorno sandbox para demostración. Los datos son temporales.</p>
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-lg w-fit"><FlaskConical className="w-3 h-3" /> Acceso Abierto</div>
                </div>
              </button>
              <button onClick={handleSelectFull} className="group relative bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-1 overflow-hidden ring-1 ring-indigo-50 hover:ring-indigo-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-bl-full -mr-16 -mt-16 z-0 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors"><ShieldCheck className="w-8 h-8" /></div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Versión Completa</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">Gestión profesional de expedientes médicos. Requiere autenticación de seguridad clínica.</p>
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider bg-indigo-50 px-3 py-1.5 rounded-lg w-fit"><Lock className="w-3 h-3" /> Requiere Contraseña</div>
                </div>
              </button>
           </div>
           <p className="text-center text-slate-400 text-xs mt-12">v2.3.0 • Resumen de Antecedentes Críticos</p>
        </div>
      </div>
    );
  }

  if (accessStep === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 p-4">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/50 w-full max-w-md animate-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <button onClick={() => setAccessStep('selection')} className="absolute left-6 top-6 text-slate-400 hover:text-slate-600"><ArrowLeft className="w-6 h-6" /></button>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-inner"><Lock className="w-8 h-8" /></div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Acceso Profesional</h1>
            <p className="text-slate-500 text-sm mt-1 mb-2">Ingrese la clave de seguridad clínica</p>
          </div>
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 uppercase tracking-wide ml-1">Contraseña</label>
              <div className="relative group">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all shadow-sm ${authError ? 'border-red-300 focus:ring-2 focus:ring-red-200 bg-red-50/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white'}`} placeholder="Ingrese contraseña..." autoFocus />
              </div>
              {authError && <p className="text-xs text-red-600 font-bold ml-1 animate-in slide-in-from-left-2">Contraseña incorrecta.</p>}
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 transition-all">Acceder al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <>
        <div className="absolute top-4 right-4 z-40"><button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-full text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"><LogOut className="w-4 h-4" /><span className="hidden sm:inline">Salir</span></button></div>
        <PatientList patients={patients} consultations={consultations} onSelect={handleSelectPatient} onNew={handleNewPatient} onDelete={handleDeletePatient} onImportData={handleImportData} />
        <DosageCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
        <CalendarPopup isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
        <PediatricChatbot />
      </>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-20 relative bg-slate-50/50">
      <DosageCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} defaultWeight={activePatient.history.perinatal.birthWeight ? activePatient.history.perinatal.birthWeight.replace(/[^0-9.]/g, '') : ''} />
      <CalendarPopup isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
      <GrowthHistory isOpen={showGrowthHistory} onClose={() => setShowGrowthHistory(false)} patient={activePatient} consultations={allPatientConsultations} />

      <header className={`bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-20 shadow-sm`}>
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md hidden sm:block"><Activity className="w-5 h-5 text-white" /></div>
                <span className="text-xl font-bold text-slate-800 tracking-tight hidden sm:inline">PediaCare<span className="text-blue-600">EMR</span></span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500 font-medium border-l border-slate-200 pl-4 ml-2 flex items-center gap-4">
                 {activePatient.firstName ? (
                   <span className="flex items-center gap-2">
                     <div className="text-right mr-2">
                       <div className="text-slate-900 font-bold text-sm leading-tight">{activePatient.firstName} {activePatient.lastName}</div>
                       <div className="text-xs text-blue-600 font-bold">{calculateAge(activePatient.dob)}</div>
                     </div>
                     <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold border-2 border-white shadow-sm shrink-0">{activePatient.firstName[0]}</span>
                   </span>
                 ) : 'Nuevo Expediente'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* DETAIL VIEW: BACKGROUND SUMMARY (ANTECEDENTES) */}
        {view === 'detail' && activePatient.id && (
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
            {/* Alergias y Patológicos */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" /> Antecedentes Médicos Relevantes
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-xl border-2 transition-all ${activePatient.history.pathological.allergies ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${activePatient.history.pathological.allergies ? 'text-red-700' : 'text-green-700'}`}>
                    <AlertCircle className="w-3.5 h-3.5" /> Alergias
                  </h4>
                  <p className={`text-sm font-bold ${activePatient.history.pathological.allergies ? 'text-red-800' : 'text-green-800'}`}>
                    {activePatient.history.pathological.allergies || "Niega alergias."}
                  </p>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> Patológicos y Cirugías
                   </h4>
                   <div className="space-y-3">
                      <div>
                         <span className="text-[9px] font-bold text-slate-400 block uppercase">Hosp. / Cirugías</span>
                         <p className="text-xs text-slate-700 italic">{activePatient.history.pathological.surgeries || "Sin antecedentes."}</p>
                      </div>
                      <div>
                         <span className="text-[9px] font-bold text-slate-400 block uppercase">Medicación Actual</span>
                         <p className="text-xs text-slate-700 flex items-center gap-2">
                           <Pill className="w-3 h-3 text-emerald-500" /> {activePatient.history.pathological.medications || "Ninguna."}
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Familiares */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" /> Antecedentes Familiares
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                   <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${activePatient.history.family.diabetes ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                      <Activity className={`w-5 h-5 mb-1 ${activePatient.history.family.diabetes ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span className="text-[9px] font-black uppercase text-center">Diabetes</span>
                   </div>
                   <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${activePatient.history.family.hypertension ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                      <HeartPulse className={`w-5 h-5 mb-1 ${activePatient.history.family.hypertension ? 'text-red-600' : 'text-slate-400'}`} />
                      <span className="text-[9px] font-black uppercase text-center">HTA</span>
                   </div>
                   <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${activePatient.history.family.asthma ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                      <Wind className={`w-5 h-5 mb-1 ${activePatient.history.family.asthma ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="text-[9px] font-black uppercase text-center">Asma</span>
                   </div>
                </div>
                <div>
                   <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Otros Familiares</span>
                   <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">
                     {activePatient.history.family.other || "Sin registros adicionales."}
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLINICAL EVOLUTION SUMMARY TABLE */}
        {view === 'detail' && allPatientConsultations.length > 0 && (
          <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
             <div className="flex justify-between items-center mb-3">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><ClipboardList className="w-4 h-4 text-blue-600" /> Resumen de Evolución Clínica</h3>
               <button onClick={() => setShowGrowthHistory(true)} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1 transition-colors"><TrendingUp className="w-3 h-3" /> Ver Antropometría Completa</button>
             </div>
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-28">Fecha</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">Edad</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Diagnósticos Principales</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allPatientConsultations.slice(0, 5).map((c) => (
                          <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                             <td className="px-4 py-3 align-top">
                                <div className="flex flex-col">
                                   <span className="text-xs font-bold text-slate-800">{new Date(c.date).toLocaleDateString()}</span>
                                   {c.aiAnalysis && <span className="flex items-center gap-1 text-[9px] text-indigo-600 font-bold mt-1"><Sparkles className="w-2.5 h-2.5" /> IA</span>}
                                </div>
                             </td>
                             <td className="px-4 py-3 align-top"><span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{c.patientAge}</span></td>
                             <td className="px-4 py-3 align-top">
                                <div className="flex flex-wrap gap-2">
                                  {c.soap.diagnoses.map((d, i) => (
                                    <span key={d.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-100">
                                      {d.assessment || "Sin diag."}
                                    </span>
                                  ))}
                                </div>
                             </td>
                             <td className="px-4 py-3 align-middle text-center">
                               <button onClick={(e) => handleDeleteConsultation(e, c.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Eliminar registro duplicado">
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
      <BottomNavigation />
      <PediatricChatbot />
    </div>
  );
}

// Icono faltante Wind
const Wind = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
);

export default App;

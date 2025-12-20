
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
import { Patient, SoapNote, Consultation, VitalSigns, LabResult } from './types';
import { Activity, ArrowLeft, Calculator, History, X, FileText, Users, Baby, Stethoscope, Undo2, Lock, ShieldAlert, KeyRound, FlaskConical, Database, ShieldCheck, LogOut, ClipboardList, Sparkles } from 'lucide-react';

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
    setAccessStep('login');
    setIsDemoMode(true);
    setAuthError(false);
    setPasswordInput('');
  };

  const handleSelectFull = () => {
    setAccessStep('app');
    setIsDemoMode(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Helena16') {
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
    const msg = isDemoMode 
      ? "Consulta guardada exitosamente (Modo Prueba: Datos temporales)"
      : "Consulta guardada exitosamente en el expediente.";
    alert(msg);
  };

  const handleImportData = (importedPatients: Patient[], importedConsultations: Consultation[]) => {
    setPatients(importedPatients);
    setConsultations(importedConsultations);
    alert('Respaldo restaurado exitosamente. Se han cargado los expedientes y consultas.');
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
            <div className="flex justify-end mb-4">
               <button 
                 onClick={() => setShowHistoryPanel(true)}
                 className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium text-sm"
               >
                 <History className="w-4 h-4" />
                 Ver Detalle Histórico ({allPatientConsultations.length})
               </button>
            </div>
            <div className="w-full">
               <WeedConsultation patient={activePatient} onSave={(note, vitals, labs) => handleSaveConsultation(note, vitals, labs)} />
            </div>
            <div 
              className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
                showHistoryPanel ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
            >
              <div 
                className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${
                  showHistoryPanel ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={() => setShowHistoryPanel(false)}
              />
              <div 
                className={`absolute inset-y-0 right-0 max-w-full flex transition-transform duration-300 ease-in-out ${
                  showHistoryPanel ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                <div className="w-screen sm:w-[500px] md:w-[600px] bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
                   <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <div>
                       <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                         <History className="w-5 h-5 text-blue-600" />
                         Historial Clínico
                       </h2>
                       <p className="text-xs text-slate-500">{activePatient.firstName} {activePatient.lastName}</p>
                     </div>
                     <button 
                       onClick={() => setShowHistoryPanel(false)}
                       className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                     >
                       <X className="w-5 h-5" />
                     </button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                     <ConsultationHistory 
                        consultations={allPatientConsultations} 
                        patient={activePatient}
                     />
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
          <button 
            onClick={() => setView('list')}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors p-2"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Inicio</span>
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <button 
            onClick={() => setCurrentStep(1)}
            className={`flex flex-col items-center gap-1 transition-colors p-2 ${
               view === 'detail' && currentStep === 1 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
            disabled={view === 'list'}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium">Datos</span>
          </button>
          <button 
            onClick={() => setCurrentStep(2)}
            className={`flex flex-col items-center gap-1 transition-colors p-2 ${
               view === 'detail' && currentStep === 2 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
             disabled={view === 'list'}
          >
            <Baby className="w-5 h-5" />
            <span className="text-[10px] font-medium">Seguimiento</span>
          </button>
          <button 
            onClick={() => setCurrentStep(3)}
            className={`flex flex-col items-center gap-1 transition-colors p-2 ${
               view === 'detail' && currentStep === 3 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
             disabled={view === 'list'}
          >
            <Stethoscope className="w-5 h-5" />
            <span className="text-[10px] font-medium">Consulta</span>
          </button>
        </div>
      </div>
    </div>
  );

  // --- ENTRY: SELECTION SCREEN ---
  if (accessStep === 'selection') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-purple-50 to-rose-100 p-4">
        <div className="max-w-4xl w-full">
           <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-4">
              PediaCare<span className="text-blue-600">EMR</span>
            </h1>
            <p className="text-lg text-slate-600">Sistema Integral de Expediente Médico Pediátrico</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* TRIAL CARD */}
              <button 
                onClick={handleSelectDemo}
                className="group relative bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-bl-full -mr-16 -mt-16 z-0 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                     <FlaskConical className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Versión de Prueba</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Entorno sandbox para demostración y pruebas. Los datos son temporales y no se guardan permanentemente.
                  </p>
                  <div className="flex items-center gap-2 text-yellow-700 text-xs font-bold uppercase tracking-wider bg-yellow-50 px-3 py-1.5 rounded-lg w-fit">
                    <Lock className="w-3 h-3" /> Requiere Contraseña
                  </div>
                </div>
              </button>

              {/* FULL CARD */}
              <button 
                onClick={handleSelectFull}
                className="group relative bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-1 overflow-hidden ring-1 ring-blue-50 hover:ring-blue-200"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 z-0 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Versión Completa</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Acceso al sistema de producción. Gestión de expedientes persistentes y control total de funcionalidades.
                  </p>
                  <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                    <Database className="w-3 h-3" /> Acceso Directo
                  </div>
                </div>
              </button>
           </div>
           
           <p className="text-center text-slate-400 text-xs mt-12">v2.0.1 • Seleccione el entorno de trabajo</p>
        </div>
      </div>
    );
  }

  // --- ENTRY: LOGIN SCREEN (DEMO) ---
  if (accessStep === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-rose-50 p-4">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/50 w-full max-w-md animate-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <button 
              onClick={() => setAccessStep('selection')}
              className="absolute left-6 top-6 text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Acceso Prueba</h1>
            <p className="text-slate-500 text-sm mt-1 mb-2">Ingrese la clave de autorización</p>
            <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg border border-yellow-200 text-xs font-semibold">
               <ShieldAlert className="w-3 h-3" />
               Modo Sandbox (Sin persistencia)
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 uppercase tracking-wide ml-1">Contraseña</label>
              <div className="relative group">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-yellow-500 transition-colors" />
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all shadow-sm ${
                    authError 
                    ? 'border-red-300 focus:ring-2 focus:ring-red-200 bg-red-50/50' 
                    : 'border-slate-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white'
                  }`}
                  placeholder="Ingrese contraseña..."
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-xs text-red-600 font-bold ml-1 animate-in slide-in-from-left-2">
                  Contraseña incorrecta. Intente nuevamente.
                </p>
              )}
            </div>

            <button 
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-yellow-200 hover:shadow-yellow-300 transform hover:-translate-y-0.5 transition-all"
            >
              Iniciar Prueba
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN APP ---
  if (view === 'list') {
    return (
      <>
        {isDemoMode && (
          <div className="bg-yellow-100 text-yellow-800 text-xs font-bold text-center py-1.5 border-b border-yellow-200 sticky top-0 z-50 flex items-center justify-center gap-2">
            <FlaskConical className="w-3 h-3" /> MODO PRUEBA: Los cambios no se guardarán permanentemente.
          </div>
        )}

        <div className="absolute top-4 right-4 z-40">
           <button
             onClick={handleLogout}
             className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-full text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
           >
             <LogOut className="w-4 h-4" />
             <span className="hidden sm:inline">Salir</span>
           </button>
        </div>

        <PatientList 
          patients={patients} 
          consultations={consultations}
          onSelect={handleSelectPatient} 
          onNew={handleNewPatient}
          onDelete={handleDeletePatient}
          onImportData={handleImportData}
        />
        <DosageCalculator 
          isOpen={showCalculator} 
          onClose={() => setShowCalculator(false)} 
        />
        
        {undoAlert && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <span className="text-sm font-medium">{undoAlert.message}</span>
             <button 
               onClick={undoAlert.onUndo}
               className="text-yellow-400 font-bold text-sm hover:text-yellow-300 transition-colors flex items-center gap-1"
             >
               <Undo2 className="w-4 h-4" /> DESHACER
             </button>
             <button 
               onClick={() => setUndoAlert(null)}
               className="text-slate-400 hover:text-white"
             >
               <X className="w-4 h-4" />
             </button>
          </div>
        )}

        <button
          onClick={() => setShowCalculator(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-110 transition-transform"
        >
          <Calculator className="w-6 h-6" />
        </button>

        <PediatricChatbot />
      </>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-20 relative bg-slate-50/50">
      
      {isDemoMode && (
        <div className="bg-yellow-100 text-yellow-800 text-xs font-bold text-center py-1.5 border-b border-yellow-200 sticky top-0 z-50 flex items-center justify-center gap-2">
            <FlaskConical className="w-3 h-3" /> MODO PRUEBA: Los cambios no se guardarán permanentemente.
        </div>
      )}

      <DosageCalculator 
        isOpen={showCalculator} 
        onClose={() => setShowCalculator(false)} 
        defaultWeight={activePatient.history.perinatal.birthWeight ? activePatient.history.perinatal.birthWeight.replace(/[^0-9.]/g, '') : ''}
      />

      {/* Header */}
      <header className={`bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-8 z-20 shadow-sm transition-all ${isDemoMode ? 'top-[38px]' : 'top-0'}`}>
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('list')}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                title="Volver a lista"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md hidden sm:block">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800 tracking-tight hidden sm:inline">PediaCare<span className="text-blue-600">EMR</span></span>
                 <span className="text-lg font-bold text-slate-800 tracking-tight sm:hidden">PC<span className="text-blue-600">EMR</span></span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCalculator(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Calculator className="w-4 h-4" />
                Calculadora
              </button>

              <div className="text-sm text-slate-500 font-medium border-l border-slate-200 pl-2 sm:pl-4 ml-2 flex items-center gap-4">
                 {activePatient.firstName ? (
                   <span className="flex items-center gap-2">
                     <div className="text-right mr-2">
                       <div className="text-slate-900 font-bold text-sm leading-tight">
                         {activePatient.firstName} <span className="hidden sm:inline">{activePatient.lastName}</span>
                       </div>
                       <div className="text-xs text-blue-600 font-bold">
                         {calculateAge(activePatient.dob)}
                       </div>
                     </div>
                     <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold border-2 border-white shadow-sm shrink-0">
                        {activePatient.firstName[0]}
                     </span>
                   </span>
                 ) : 'Nuevo Expediente'}
                 
                 <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-colors"
                  title="Cerrar Sesión"
                 >
                   <LogOut className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* NEW CLINICAL SUMMARY TABLE */}
        {view === 'detail' && allPatientConsultations.length > 0 && (
          <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
               <ClipboardList className="w-4 h-4 text-blue-600" /> Resumen de Evolución Clínica
             </h3>
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-28">Fecha</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">Edad</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Diagnóstico (Análisis)</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tratamiento (Plan)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allPatientConsultations.slice(0, 5).map((c) => (
                          <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                             <td className="px-4 py-3 align-top">
                                <div className="flex flex-col">
                                   <span className="text-xs font-bold text-slate-800">
                                      {new Date(c.date).toLocaleDateString()}
                                   </span>
                                   {c.aiAnalysis && (
                                     <span className="flex items-center gap-1 text-[9px] text-indigo-600 font-bold mt-1">
                                       <Sparkles className="w-2.5 h-2.5" /> IA
                                     </span>
                                   )}
                                </div>
                             </td>
                             <td className="px-4 py-3 align-top">
                                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                   {c.patientAge || 'N/A'}
                                </span>
                             </td>
                             <td className="px-4 py-3 align-top">
                                <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed">
                                   {c.soap.assessment || "Sin diagnóstico"}
                                </p>
                             </td>
                             <td className="px-4 py-3 align-top">
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                                   {c.soap.plan || "Sin plan registrado"}
                                </p>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
                {allPatientConsultations.length > 5 && (
                  <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-center">
                     <button 
                       onClick={() => { setCurrentStep(3); setShowHistoryPanel(true); }}
                       className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 mx-auto"
                     >
                        VER HISTORIAL COMPLETO ({allPatientConsultations.length} visitas)
                     </button>
                  </div>
                )}
             </div>
          </div>
        )}

        <div className="mb-8 hidden md:block">
           <div className="flex items-center justify-center space-x-4">
              <h2 className="text-2xl font-bold text-slate-800">
                {currentStep === 1 && 'Datos Generales'}
                {currentStep === 2 && 'Seguimiento Pediátrico'}
                {currentStep === 3 && 'Consulta Médica'}
              </h2>
           </div>
        </div>

        <div className="mt-4 min-h-[60vh]">
           {renderStep()}
        </div>

      </main>
      
      <BottomNavigation />
      
      {undoAlert && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <span className="text-sm font-medium">{undoAlert.message}</span>
             <button 
               onClick={undoAlert.onUndo}
               className="text-yellow-400 font-bold text-sm hover:text-yellow-300 transition-colors flex items-center gap-1"
             >
               <Undo2 className="w-4 h-4" /> DESHACER
             </button>
             <button 
               onClick={() => setUndoAlert(null)}
               className="text-slate-400 hover:text-white"
             >
               <X className="w-4 h-4" />
             </button>
          </div>
      )}

      <button
        onClick={() => setShowCalculator(true)}
        className="md:hidden fixed bottom-24 right-6 h-12 w-12 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-110 transition-transform"
      >
        <Calculator className="w-5 h-5" />
      </button>

      <PediatricChatbot />
    </div>
  );
}

export default App;

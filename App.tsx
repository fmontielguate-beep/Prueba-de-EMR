
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
import GrowthHistory from './components/GrowthHistory';
import CalendarPopup from './components/CalendarPopup';
import ConsultationDetailModal from './components/ConsultationDetailModal';
import { Patient, SoapNote, Consultation, VitalSigns, LabResult } from './types';
import { ArrowLeft, History, X, FileText, Users, Baby, Stethoscope, ShieldAlert, Unlock, ShieldCheck, LogOut, Sparkles, TrendingUp, ShieldHalf, ChevronRight, Calculator, Calendar as CalendarIcon, Save, ChevronLeft, ClipboardList, Pill, Trash2, RefreshCw } from 'lucide-react';

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

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const emptyPatient: Patient = {
  id: '', firstName: '', lastName: '', gender: 'male', dob: '', address: '', phone: '', email: '', nit: '',
  father: { name: '', age: '', profession: '' },
  mother: { name: '', age: '', profession: '' },
  history: {
    perinatal: { gestationalAge: '', birthWeight: '', deliveryType: '', birthComplications: '', apgar: '' },
    pathological: { allergies: '', hospitalizations: '', surgeries: '', medications: '' },
    family: { diabetes: false, hypertension: false, asthma: false, other: '' }
  },
  vaccines: {}, otherVaccines: [], milestones: {},
};

// CONSTANTE DE VERSIÓN ACTUALIZADA
const VERSION = "v2.6.2-pro";

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
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  
  // Persistencia de datos
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('pediacare_patients');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    const saved = localStorage.getItem('pediacare_consultations');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePatient, setActivePatient] = useState<Patient>(emptyPatient);

  // Guardar en localStorage cada vez que cambien los datos globales
  useEffect(() => {
    localStorage.setItem('pediacare_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('pediacare_consultations', JSON.stringify(consultations));
  }, [consultations]);

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
  };

  const handleSelectPatient = (id: string) => {
    const p = patients.find(pat => pat.id === id);
    if (p) { 
      setActivePatient(p); 
      setCurrentStep(1); 
      setView('detail'); 
    }
  };

  const saveActivePatientToList = (showToast = true) => {
    if (!activePatient.firstName || !activePatient.lastName) {
      alert("Por favor ingrese al menos nombre y apellido para guardar.");
      return false;
    }

    setPatients(prev => {
      const exists = prev.find(p => p.id === activePatient.id);
      if (exists) {
        return prev.map(p => p.id === activePatient.id ? activePatient : p);
      }
      return [activePatient, ...prev];
    });

    if (showToast) {
       const toast = document.getElementById('save-toast');
       if (toast) {
         toast.classList.remove('hidden');
         setTimeout(() => toast.classList.add('hidden'), 2000);
       }
    }
    return true;
  };

  const handleDeleteConsultation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("¿Confirma que desea eliminar este registro de consulta? Esta acción no se puede deshacer y borrará permanentemente el diagnóstico y tratamiento seleccionado.")) {
      setConsultations(prev => prev.filter(c => c.id !== id));
      if (selectedConsultation?.id === id) setSelectedConsultation(null);
    }
  };

  const handleStartReconsultation = () => {
    const confirmSame = window.confirm("¿Los datos generales (Ficha) y el esquema de vacunas del paciente se mantienen sin cambios?\n\n- Pulse 'Aceptar' para ir directo a la nueva consulta (SOAP).\n- Pulse 'Cancelar' si necesita realizar cambios en la ficha o vacunas.");
    if (confirmSame) {
      // Salto directo a la consulta nueva (SOAP)
      setCurrentStep(3);
    } else {
      // Se queda en Ficha para permitir edición
      setCurrentStep(1);
    }
    window.scrollTo(0,0);
  };

  const handleNextStep = () => {
    if (saveActivePatientToList(false)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
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
      aiAnalysis
    };
    setConsultations(prev => [newConsultation, ...prev]);
    saveActivePatientToList(false);
    alert("Consulta registrada exitosamente en v2.6.2. Los datos anteriores se conservan en el historial.");
    setView('list');
  };

  const allPatientConsultations = consultations
    .filter(c => c.patientId === activePatient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderStep = () => {
    switch (currentStep) {
      case 1: return (
        <div className="flex flex-col lg:flex-row gap-8 pb-32 max-w-[95rem] mx-auto animate-in fade-in duration-500">
          {/* Panel Lateral: Historial Rápido para Diagnósticos anteriores con POPUP clicable */}
          <div className="w-full lg:w-96 shrink-0 space-y-6">
            <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-24">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <History className="w-4 h-4 text-blue-500" /> Historial de Evolución
                 </h3>
                 <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase">{allPatientConsultations.length} Visitas</span>
              </div>

              {allPatientConsultations.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar">
                  {allPatientConsultations.slice(0, 10).map((c, i) => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedConsultation(c)}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative hover:border-blue-200 transition-all hover:shadow-md hover:bg-white cursor-pointer active:scale-95"
                    >
                      <button 
                        onClick={(e) => handleDeleteConsultation(e, c.id)}
                        className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-100 rounded-lg shadow-sm z-10"
                        title="Borrar consulta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Visita {allPatientConsultations.length - i}</span>
                        <span className="text-[9px] font-bold text-slate-400 mr-8">{new Date(c.date).toLocaleDateString()}</span>
                      </div>
                      <div className="space-y-3">
                        {c.soap.diagnoses.map(d => (
                          <div key={d.id} className="text-[11px] leading-snug pl-3 border-l-2 border-blue-100">
                            <p className="font-black text-slate-800 uppercase flex items-center gap-1.5"><ClipboardList className="w-3 h-3 text-blue-400" /> {d.assessment || 'Control de Niño Sano'}</p>
                            <p className="text-slate-500 mt-1 italic line-clamp-2"><Pill className="inline w-3 h-3 text-slate-300" /> {d.treatment || 'Sin tto. farmacológico'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {allPatientConsultations.length > 10 && (
                    <button onClick={() => setShowHistoryPanel(true)} className="w-full py-3 text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest text-center bg-slate-50 rounded-xl border border-dashed border-blue-200">Ver todo el historial completo</button>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center opacity-40">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="text-slate-400 w-8 h-8" />
                  </div>
                  <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Sin antecedentes</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-8">
            {/* Banner de Reconsulta Prominente mejorado para v2.6.2 */}
            {allPatientConsultations.length > 0 && (
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 rounded-[3rem] shadow-2xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-6 text-white animate-in zoom-in-95 border-4 border-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-20 -mr-10 -mt-10 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="bg-white/10 p-5 rounded-[2.5rem] backdrop-blur-xl border border-white/20 shadow-inner">
                       <RefreshCw className="w-10 h-10 animate-spin-slow" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight leading-none mb-2">Reconsulta Médica</h2>
                      <p className="text-blue-100 text-sm font-medium opacity-90 italic">Paciente recurrente. ¿Desea agilizar la atención?</p>
                    </div>
                 </div>
                 <button 
                    onClick={handleStartReconsultation}
                    className="bg-white text-blue-700 hover:bg-blue-50 px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.1em] shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center gap-4 group relative z-10"
                 >
                    Nueva Visita Hoy <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            )}

            <PatientForm data={activePatient} onChange={setActivePatient} />
            <MedicalHistoryForm data={activePatient} onChange={setActivePatient} />
            
            <div className="flex justify-center pt-8">
              <button onClick={handleNextStep} className="group bg-blue-600 hover:bg-blue-700 text-white px-14 py-6 rounded-[2.5rem] font-black shadow-2xl shadow-blue-100 flex items-center gap-4 transition-all active:scale-95 text-sm uppercase tracking-widest">
                Guardar Ficha e ir a Vacunas <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6 pb-32 max-w-[95rem] mx-auto animate-in fade-in duration-500">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <VaccineSchedule patient={activePatient} onChange={setActivePatient} />
            <MilestoneTracker patient={activePatient} onChange={setActivePatient} />
          </div>
          <div className="flex justify-center gap-4 pt-10">
            <button onClick={handlePrevStep} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 transition-all active:scale-95 uppercase text-xs tracking-widest shadow-sm">
              <ChevronLeft /> Regresar a Ficha
            </button>
            <button onClick={handleNextStep} className="group bg-blue-600 hover:bg-blue-700 text-white px-14 py-5 rounded-[2rem] font-black shadow-2xl shadow-blue-100 flex items-center gap-4 transition-all active:scale-95 text-sm uppercase tracking-widest">
              Guardar e ir a SOAP <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      );
      case 3: return (
        <div className="pb-32 max-w-[95rem] mx-auto relative animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-8 bg-white/50 p-4 rounded-3xl backdrop-blur-sm border border-white">
             <button onClick={handlePrevStep} className="flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-600 transition-all group">
               <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform border rounded-full" /> Regresar a Vacunas
             </button>
             <div className="flex gap-4">
               <button onClick={() => setShowGrowthHistory(true)} className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-100 transition-all">
                 <TrendingUp className="w-4 h-4" /> Antropometría Histórica
               </button>
               <button onClick={() => setShowHistoryPanel(true)} className="flex items-center gap-3 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                 <History className="w-4 h-4" /> Evolución Full ({allPatientConsultations.length})
               </button>
             </div>
          </div>
          <WeedConsultation patient={activePatient} onSave={handleSaveConsultation} />
        </div>
      );
      default: return null;
    }
  };

  if (accessStep === 'selection') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#f8fafc] via-[#e0f2fe] to-[#fef2f2] p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-200/20 blur-[120px] rounded-full" />
      <div className="max-w-4xl w-full z-10 flex flex-col items-center">
         <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" /> EMR Inteligente de Próxima Generación
            </div>
            <h1 className="text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
              PediaCare<span className="text-blue-600">EMR</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Gestión clínica avanzada, IA aplicada y estándares internacionales en una plataforma diseñada para el pediatra moderno.
            </p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <button onClick={() => setAccessStep('app')} className="group relative bg-white/70 backdrop-blur-2xl p-10 rounded-[3rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:shadow-emerald-200/50 transition-all hover:scale-[1.03] text-left active:scale-[0.98]">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Unlock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Versión Prueba</h2>
              <div className="inline-flex items-center gap-2 mb-6"><span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">ACCESO LIBRE</span></div>
              <p className="text-slate-500 text-base leading-relaxed mb-10 font-medium">Acceda instantáneamente para explorar todas las herramientas de consulta y calculadoras sin restricciones.</p>
              <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-widest">Comenzar ahora <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></div>
            </button>
            <button onClick={() => { setAccessStep('login'); setAuthError(false); setPasswordInput(''); }} className="group relative bg-slate-900 p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] hover:shadow-indigo-900/40 transition-all hover:scale-[1.03] text-left overflow-hidden active:scale-[0.98]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full -mr-20 -mt-20" />
              <div className="w-16 h-16 bg-indigo-500 text-white rounded-3xl flex items-center justify-center mb-10 group-hover:bg-white group-hover:text-indigo-600 transition-all duration-300">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Modo Clínico</h2>
              <div className="inline-flex items-center gap-2 mb-6"><span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">CONTRASEÑA REQUERIDA</span></div>
              <p className="text-slate-400 text-base leading-relaxed mb-10 font-medium">Entrada segura para uso profesional. Proteja la integridad y privacidad de la información clínica.</p>
              <div className="flex items-center gap-2 text-indigo-400 font-black text-sm uppercase tracking-widest">Ingreso Seguro <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></div>
            </button>
         </div>
         <div className="mt-10 flex items-center gap-3 px-6 py-2.5 bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Build</span>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700">{VERSION}</span>
         </div>
      </div>
    </div>
  );

  if (accessStep === 'login') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 via-white to-blue-50 opacity-60" />
      <div className="w-full max-w-md z-10">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-200 animate-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Seguridad Clínica</h1>
            <p className="text-slate-500 text-sm font-medium mt-2">Ingrese sus credenciales de acceso profesional</p>
          </div>
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Clave de Autorización</label>
              <input type="password" value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setAuthError(false); }} className={`w-full px-6 py-5 rounded-2xl border-2 transition-all outline-none text-center font-black text-2xl tracking-[0.5em] placeholder:tracking-normal ${authError ? 'border-red-200 bg-red-50 text-red-600 animate-shake' : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`} placeholder="••••" autoFocus />
              {authError && <div className="flex items-center justify-center gap-1.5 text-red-600 mt-2"><span className="text-[10px] font-black uppercase tracking-widest">Contraseña Incorrecta</span></div>}
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 text-sm uppercase tracking-widest">Validar Acceso</button>
            <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
              <button type="button" onClick={() => setAccessStep('selection')} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-red-500 transition-all group"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Salir / Regresar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (view === 'list') return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-40 flex items-center gap-3">
        <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Build {VERSION}</div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-600 hover:text-red-600 border border-slate-200 shadow-sm transition-all active:scale-95">
          <LogOut className="w-4 h-4" /> Salir de Sesión
        </button>
      </div>
      <PatientList patients={patients} consultations={consultations} onSelect={handleSelectPatient} onNew={handleNewPatient} onDelete={(id) => { if(window.confirm("¿Confirma que desea eliminar este expediente definitivamente?")) setPatients(p => p.filter(x => x.id !== id)) }} onImportData={(p, c) => { setPatients(p); setConsultations(c); }} />
      <PediatricChatbot />
    </div>
  );

  return (
    <div className="min-h-screen font-sans pb-20 bg-slate-50/30">
      <div id="save-toast" className="fixed top-20 right-6 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 animate-in slide-in-from-right-4 duration-300 hidden">
        <ShieldCheck className="w-4 h-4" /> Registro Actualizado ({VERSION})
      </div>

      <DosageCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <CalendarPopup isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
      <GrowthHistory isOpen={showGrowthHistory} onClose={() => setShowGrowthHistory(false)} patient={activePatient} consultations={allPatientConsultations} />
      
      {selectedConsultation && (
        <ConsultationDetailModal 
          isOpen={!!selectedConsultation} 
          onClose={() => setSelectedConsultation(null)} 
          consultation={selectedConsultation} 
          patient={activePatient} 
        />
      )}

      <header className="bg-white/80 backdrop-blur-md border-b h-16 flex items-center px-6 sticky top-0 z-40 shadow-sm">
        <button onClick={() => setView('list')} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-blue-600"><ArrowLeft /></button>
        <span className="font-black text-xl tracking-tight hidden sm:inline">PediaCare<span className="text-blue-600">EMR</span></span>
        <div className="ml-3 hidden md:block">
           <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">{VERSION}</span>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
           <button onClick={() => saveActivePatientToList()} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
             <Save className="w-4 h-4" /> Guardar Ahora
           </button>
           <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
           <button onClick={() => setShowCalculator(true)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm" title="Calculadora de Dosis">
             <Calculator className="w-5 h-5"/>
           </button>
           <button onClick={() => setShowCalendar(true)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm" title="Calendario">
             <CalendarIcon className="w-5 h-5"/>
           </button>
           <div className="h-8 w-[1px] bg-slate-200 mx-1" />
           <div className="text-right hidden sm:block">
             <p className="text-sm font-black text-slate-800 leading-tight">{activePatient.firstName} {activePatient.lastName}</p>
             <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{calculateAge(activePatient.dob)}</p>
           </div>
           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100 ring-2 ring-white">
             {activePatient.firstName ? activePatient.firstName[0] : 'P'}
           </div>
        </div>
      </header>

      <main className="max-w-[95rem] mx-auto px-6 py-10">
        {activePatient.id && (
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 -mr-16 -mt-16 bg-red-50 rounded-full opacity-20 group-hover:scale-110 transition-transform" />
              <h3 className="text-[11px] font-black text-red-600 flex items-center gap-2 mb-4 uppercase tracking-[0.2em] relative z-10">
                <ShieldAlert className="w-4 h-4" /> Riesgos y Alergias
              </h3>
              <p className={`p-6 rounded-[2rem] font-black text-sm relative z-10 ${activePatient.history.pathological.allergies ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                {activePatient.history.pathological.allergies || "Paciente sin alergias conocidas."}
              </p>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 -mr-16 -mt-16 bg-purple-50 rounded-full opacity-20 group-hover:scale-110 transition-transform" />
              <h3 className="text-[11px] font-black text-purple-600 flex items-center gap-2 mb-4 uppercase tracking-[0.2em] relative z-10">
                <ShieldHalf className="w-4 h-4" /> Antecedentes de Riesgo Familiar
              </h3>
              <div className="flex flex-wrap gap-2 relative z-10">
                {activePatient.history.family.diabetes && <span className="bg-purple-100 text-purple-700 px-5 py-2.5 rounded-2xl text-[10px] font-black border border-purple-200 shadow-sm">DIABETES</span>}
                {activePatient.history.family.hypertension && <span className="bg-rose-100 text-rose-700 px-5 py-2.5 rounded-2xl text-[10px] font-black border border-rose-200 shadow-sm">HIPERTENSIÓN</span>}
                {activePatient.history.family.asthma && <span className="bg-sky-100 text-sky-700 px-5 py-2.5 rounded-2xl text-[10px] font-black border border-sky-200 shadow-sm">ASMA / RINITIS</span>}
                {!activePatient.history.family.diabetes && !activePatient.history.family.hypertension && !activePatient.history.family.asthma && <span className="text-slate-400 font-bold text-sm italic py-2">No se han marcado riesgos familiares.</span>}
              </div>
            </div>
          </div>
        )}
        <div className="min-h-[65vh]">{renderStep()}</div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t h-16 flex justify-around items-center z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.05)]">
         <button onClick={() => { saveActivePatientToList(false); setView('list'); }} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 transition-all"><Users className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-widest">Pacientes</span></button>
         <button onClick={() => { saveActivePatientToList(false); setCurrentStep(1); }} className={`flex flex-col items-center gap-0.5 transition-all ${currentStep === 1 ? 'text-blue-600 scale-110' : 'text-slate-400'}`}><FileText className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-tighter">Ficha</span></button>
         <button onClick={() => { saveActivePatientToList(false); setCurrentStep(2); }} className={`flex flex-col items-center gap-0.5 transition-all ${currentStep === 2 ? 'text-blue-600 scale-110' : 'text-slate-400'}`}><Baby className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-tighter">Vacunas</span></button>
         <button onClick={() => { saveActivePatientToList(false); setCurrentStep(3); }} className={`flex flex-col items-center gap-0.5 transition-all ${currentStep === 3 ? 'text-blue-600 scale-110' : 'text-slate-400'}`}><Stethoscope className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-tighter">SOAP</span></button>
      </div>

      {showHistoryPanel && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowHistoryPanel(false)} />
          <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
             <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                   <div className="bg-blue-600 p-2.5 rounded-2xl text-white"><History className="w-6 h-6" /></div>
                   <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Evolución Clínica Completa</h2>
                </div>
                <button onClick={() => setShowHistoryPanel(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X className="w-7 h-7" /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                <ConsultationHistory consultations={allPatientConsultations} patient={activePatient} onDelete={handleDeleteConsultation} onSelect={(c) => setSelectedConsultation(c)} />
             </div>
          </div>
        </div>
      )}
      <PediatricChatbot />
    </div>
  );
}

export default App;

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
import { ArrowLeft, History, X, FileText, Users, Baby, Stethoscope, ShieldAlert, Unlock, ShieldCheck, LogOut, ChevronRight, Calculator, Save, ChevronLeft, RefreshCw } from 'lucide-react';

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

const VERSION = "v2.6.5-pro";

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
  
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('pediacare_patients');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    const saved = localStorage.getItem('pediacare_consultations');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePatient, setActivePatient] = useState<Patient>(emptyPatient);

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
    if (window.confirm("¿Confirma que desea eliminar este registro?")) {
      setConsultations(prev => prev.filter(c => c.id !== id));
      if (selectedConsultation?.id === id) setSelectedConsultation(null);
    }
  };

  const handleStartReconsultation = () => {
    const confirmSame = window.confirm("¿Inicia nueva consulta hoy manteniendo los datos de la ficha?");
    if (confirmSame) {
      setCurrentStep(3);
    } else {
      setCurrentStep(1);
    }
    window.scrollTo(0,0);
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
    alert(`Consulta registrada exitosamente en ${VERSION}.`);
    setView('list');
  };

  const allPatientConsultations = consultations
    .filter(c => c.patientId === activePatient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastConsultation = allPatientConsultations[0] || null;

  if (accessStep === 'selection') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#f8fafc] via-[#e0f2fe] to-[#fef2f2] p-6 relative overflow-hidden">
      <div className="max-w-4xl w-full z-10 flex flex-col items-center">
         <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
              PediaCare<span className="text-blue-600">EMR</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">Versión Profesional {VERSION}</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <button onClick={() => setAccessStep('app')} className="bg-white/70 backdrop-blur-2xl p-10 rounded-[3rem] border border-white shadow-xl hover:scale-[1.03] transition-all text-left">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-10"><Unlock className="w-8 h-8" /></div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Prueba</h2>
              <p className="text-slate-500 mb-10">Acceso libre sin contraseña para exploración rápida.</p>
              <div className="text-emerald-600 font-black text-sm uppercase">Entrar <ChevronRight className="inline" /></div>
            </button>
            <button onClick={() => setAccessStep('login')} className="bg-slate-900 p-10 rounded-[3rem] shadow-xl hover:scale-[1.03] transition-all text-left">
              <div className="w-16 h-16 bg-indigo-500 text-white rounded-3xl flex items-center justify-center mb-10"><ShieldCheck className="w-8 h-8" /></div>
              <h2 className="text-3xl font-black text-white mb-2">Clínico</h2>
              <p className="text-slate-400 mb-10">Acceso protegido por contraseña para pediatras.</p>
              <div className="text-indigo-400 font-black text-sm uppercase">Seguro <ChevronRight className="inline" /></div>
            </button>
         </div>
      </div>
    </div>
  );

  if (accessStep === 'login') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200">
        <h1 className="text-3xl font-black text-slate-800 text-center mb-10">Seguridad Clínica</h1>
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <input type="password" value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setAuthError(false); }} className={`w-full px-6 py-5 rounded-2xl border-2 text-center font-black text-2xl ${authError ? 'border-red-500 bg-red-50' : ''}`} placeholder="••••" autoFocus />
          <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl text-sm uppercase tracking-widest">Validar</button>
          <button type="button" onClick={() => setAccessStep('selection')} className="w-full text-slate-400 font-black text-xs uppercase">Regresar</button>
        </form>
      </div>
    </div>
  );

  if (view === 'list') return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-40 flex items-center gap-3 no-print">
        <span className="px-3 py-1 bg-white border border-blue-200 rounded-full text-[9px] font-black text-blue-500 uppercase tracking-widest shadow-sm">Version {VERSION}</span>
        <button onClick={handleLogout} className="px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-600 border shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"><LogOut className="w-4 h-4 inline mr-1" /> Salir</button>
      </div>
      <PatientList patients={patients} consultations={consultations} onSelect={handleSelectPatient} onNew={handleNewPatient} onDelete={(id) => setPatients(p => p.filter(x => x.id !== id))} onImportData={(p, c) => { setPatients(p); setConsultations(c); }} />
      <PediatricChatbot />
    </div>
  );

  return (
    <div className="min-h-screen font-sans pb-20 bg-slate-50/30">
      <div id="save-toast" className="fixed top-20 right-6 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-2xl hidden flex items-center gap-2 animate-in slide-in-from-right duration-300">
        <ShieldCheck className="w-4 h-4" /> Guardado {VERSION}
      </div>
      
      <DosageCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <CalendarPopup isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
      <GrowthHistory isOpen={showGrowthHistory} onClose={() => setShowGrowthHistory(false)} patient={activePatient} consultations={allPatientConsultations} />
      
      {selectedConsultation && (
        <ConsultationDetailModal isOpen={!!selectedConsultation} onClose={() => setSelectedConsultation(null)} consultation={selectedConsultation} patient={activePatient} />
      )}

      <header className="bg-white/80 backdrop-blur-md border-b h-16 flex items-center px-6 sticky top-0 z-40 shadow-sm no-print">
        <button onClick={() => setView('list')} className="mr-4 p-2 text-slate-400 hover:text-blue-600"><ArrowLeft /></button>
        <span className="font-black text-xl tracking-tight">PediaCare<span className="text-blue-600">EMR</span></span>
        <div className="ml-4 hidden sm:block">
           <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-[9px] font-black uppercase">{VERSION}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
           <button onClick={() => saveActivePatientToList()} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"><Save className="w-3 h-3 inline mr-1"/> Guardar</button>
           <button onClick={() => setShowCalculator(true)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Calculator className="w-5 h-5"/></button>
           <div className="text-right hidden sm:block">
             <p className="text-sm font-black text-slate-800 leading-tight">{activePatient.firstName} {activePatient.lastName}</p>
             <p className="text-[10px] text-blue-600 font-black uppercase">{calculateAge(activePatient.dob)}</p>
           </div>
           <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100">
             {activePatient.firstName ? activePatient.firstName[0] : 'P'}
           </div>
        </div>
      </header>

      <main className="max-w-[95rem] mx-auto px-6 py-10">
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Alergias</h3>
            <p className={`p-6 rounded-[2rem] font-black text-sm ${activePatient.history.pathological.allergies ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
              {activePatient.history.pathological.allergies || "Sin alergias conocidas."}
            </p>
          </div>
          {lastConsultation && (
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 rounded-[3rem] shadow-xl text-white flex items-center justify-between border-4 border-white">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1 flex items-center gap-2"><RefreshCw className="w-6 h-6 animate-spin-slow" /> Reconsulta</h2>
                <p className="text-blue-100 text-xs italic">Última visita: {new Date(lastConsultation.date).toLocaleDateString()}</p>
              </div>
              <button onClick={handleStartReconsultation} className="bg-white text-blue-700 px-8 py-4 rounded-[2rem] font-black text-xs uppercase shadow-lg hover:bg-blue-50 transition-all active:scale-95">Nueva Visita Hoy <ChevronRight className="inline ml-1" /></button>
            </div>
          )}
        </div>

        <div className="min-h-[65vh]">
          {currentStep === 1 && (
            <div className="flex flex-col lg:flex-row gap-8 pb-32 animate-in fade-in duration-500 no-print">
              <div className="w-full lg:w-96 shrink-0">
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-24">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6"><History className="w-4 h-4 text-blue-500" /> Historial de Evolución</h3>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar">
                    {allPatientConsultations.map((c, i) => (
                      <div key={c.id} onClick={() => setSelectedConsultation(c)} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer hover:bg-white active:scale-95">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Visita {allPatientConsultations.length - i}</span>
                          <span className="text-[9px] font-bold text-slate-400">{new Date(c.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] font-black text-slate-800 uppercase line-clamp-1">{c.soap.diagnoses[0]?.assessment || 'Control de Niño Sano'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-8">
                <PatientForm data={activePatient} onChange={setActivePatient} />
                <MedicalHistoryForm data={activePatient} onChange={setActivePatient} />
                <div className="flex justify-center pt-8"><button onClick={() => { if(saveActivePatientToList(false)) setCurrentStep(2) }} className="bg-blue-600 text-white px-14 py-6 rounded-[2.5rem] font-black shadow-xl text-sm uppercase tracking-widest active:scale-95 transition-all">Siguiente: Vacunas <ChevronRight className="inline ml-2"/></button></div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-6 pb-32 animate-in fade-in duration-500 no-print">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <VaccineSchedule patient={activePatient} onChange={setActivePatient} />
                <MilestoneTracker patient={activePatient} onChange={setActivePatient} />
              </div>
              <div className="flex justify-center gap-4 pt-10">
                <button onClick={() => setCurrentStep(1)} className="bg-white border border-slate-200 px-10 py-5 rounded-[2rem] font-black text-xs uppercase shadow-sm">Atrás</button>
                <button onClick={() => { if(saveActivePatientToList(false)) setCurrentStep(3) }} className="bg-blue-600 text-white px-14 py-5 rounded-[2rem] font-black shadow-xl text-sm uppercase tracking-widest active:scale-95 transition-all">Ir a SOAP <ChevronRight className="inline ml-2"/></button>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="pb-32 animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-8 no-print bg-white/50 p-4 rounded-3xl backdrop-blur-sm border">
                 <button onClick={() => setCurrentStep(2)} className="text-slate-400 font-black text-[10px] uppercase hover:text-blue-600 transition-all flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Regresar a Vacunas</button>
                 <div className="flex gap-2">
                   <button onClick={() => setShowGrowthHistory(true)} className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-sm hover:bg-blue-100">Gráficas</button>
                   <button onClick={() => setShowHistoryPanel(true)} className="bg-white border text-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-sm hover:bg-slate-50">Historial Full ({allPatientConsultations.length})</button>
                 </div>
               </div>
               <WeedConsultation patient={activePatient} onSave={handleSaveConsultation} lastVitals={lastConsultation?.vitalSigns} />
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t h-16 flex justify-around items-center z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] no-print">
         <button onClick={() => { saveActivePatientToList(false); setView('list'); }} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 transition-all"><Users className="w-5 h-5" /><span className="text-[9px] font-black uppercase">Pacientes</span></button>
         <button onClick={() => { saveActivePatientToList(false); setCurrentStep(1); }} className={`flex flex-col items-center gap-0.5 transition-all ${currentStep === 1 ? 'text-blue-600 scale-110' : 'text-slate-400'}`}><FileText className="w-5 h-5" /><span className="text-[9px] font-black uppercase">Ficha</span></button>
         <button onClick={() => { saveActivePatientToList(false); setCurrentStep(2); }} className={`flex flex-col items-center gap-0.5 transition-all ${currentStep === 2 ? 'text-blue-600 scale-110' : 'text-slate-400'}`}><Baby className="w-5 h-5" /><span className="text-[9px] font-black uppercase">Vacunas</span></button>
         <button onClick={() => { saveActivePatientToList(false); setCurrentStep(3); }} className={`flex flex-col items-center gap-0.5 transition-all ${currentStep === 3 ? 'text-blue-600 scale-110' : 'text-slate-400'}`}><Stethoscope className="w-5 h-5" /><span className="text-[9px] font-black uppercase">SOAP</span></button>
      </div>

      {showHistoryPanel && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowHistoryPanel(false)} />
          <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
             <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                   <div className="bg-blue-600 p-2 rounded-xl text-white"><History className="w-5 h-5" /></div>
                   <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Evolución Clínica Completa</h2>
                </div>
                <button onClick={() => setShowHistoryPanel(false)} className="p-2.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X className="w-7 h-7" /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-8">
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
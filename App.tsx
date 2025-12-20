
import React, { useState } from 'react';
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
import { Patient, SoapNote, Consultation, VitalSigns, LabResult } from './types';
import { Activity, ArrowLeft, History, X, FileText, Users, Baby, Stethoscope, ShieldAlert, Unlock, ShieldCheck, LogOut, ClipboardList, Sparkles, TrendingUp, Trash2, Pill, HeartPulse, ShieldHalf } from 'lucide-react';

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

const WindIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
);

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

function App() {
  const [accessStep, setAccessStep] = useState<'selection' | 'login' | 'app'>('selection');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showGrowthHistory, setShowGrowthHistory] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activePatient, setActivePatient] = useState<Patient>(emptyPatient);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Helena 2016') { setAccessStep('app'); setAuthError(false); } 
    else { setAuthError(true); }
  };

  const handleLogout = () => { setAccessStep('selection'); setView('list'); setActivePatient(emptyPatient); setPasswordInput(''); };

  const handleNewPatient = () => {
    setActivePatient({ ...emptyPatient, id: generateId() });
    setCurrentStep(1);
    setView('detail');
  };

  const handleSelectPatient = (id: string) => {
    const p = patients.find(pat => pat.id === id);
    if (p) { setActivePatient(p); setCurrentStep(3); setView('detail'); }
  };

  const handleDeleteConsultation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("¿Eliminar registro?")) setConsultations(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveConsultation = (note: SoapNote, vitals: VitalSigns, labs: LabResult[], aiAnalysis?: string) => {
    const newConsultation: Consultation = {
      id: generateId(), patientId: activePatient.id, date: new Date().toISOString(),
      patientAge: calculateAge(activePatient.dob), soap: note, vitalSigns: vitals, labResults: labs, aiAnalysis
    };
    setConsultations(prev => [newConsultation, ...prev]);
    alert("Guardado.");
    setShowHistoryPanel(false);
  };

  const allPatientConsultations = consultations
    .filter(c => c.patientId === activePatient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <div className="space-y-8 pb-20 max-w-5xl mx-auto"><PatientForm data={activePatient} onChange={setActivePatient} /><MedicalHistoryForm data={activePatient} onChange={setActivePatient} /></div>;
      case 2: return <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20 max-w-[95rem] mx-auto"><VaccineSchedule patient={activePatient} onChange={setActivePatient} /><MilestoneTracker patient={activePatient} onChange={setActivePatient} /></div>;
      case 3: return (
        <div className="pb-20 max-w-[95rem] mx-auto relative">
          <div className="flex justify-end gap-3 mb-4">
             <button onClick={() => setShowGrowthHistory(true)} className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold"><TrendingUp className="w-4 h-4" /> Antropometría</button>
             <button onClick={() => setShowHistoryPanel(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium"><History className="w-4 h-4" /> Historial ({allPatientConsultations.length})</button>
          </div>
          <WeedConsultation patient={activePatient} onSave={handleSaveConsultation} />
          {showHistoryPanel && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHistoryPanel(false)} />
              <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col">
                 <div className="p-4 border-b flex justify-between items-center bg-slate-50"><h2 className="font-bold flex items-center gap-2"><History className="text-blue-600" /> Historial Clínico</h2><button onClick={() => setShowHistoryPanel(false)}><X /></button></div>
                 <div className="flex-1 overflow-y-auto p-4"><ConsultationHistory consultations={allPatientConsultations} patient={activePatient} onDelete={handleDeleteConsultation} /></div>
              </div>
            </div>
          )}
        </div>
      );
      default: return null;
    }
  };

  if (accessStep === 'selection') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-rose-100 p-4">
      <div className="max-w-4xl w-full text-center">
         <h1 className="text-5xl font-bold text-slate-800 mb-8">PediaCare<span className="text-blue-600">EMR</span></h1>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => setAccessStep('app')} className="bg-white/70 p-8 rounded-3xl border border-white shadow-xl text-left hover:scale-105 transition-all"><Unlock className="text-emerald-600 mb-4" /> <h2 className="text-2xl font-bold">Modo Demo</h2><p className="text-sm text-slate-600">Acceso libre para pruebas.</p></button>
            <button onClick={() => setAccessStep('login')} className="bg-white/90 p-8 rounded-3xl border border-white shadow-xl text-left hover:scale-105 transition-all"><ShieldCheck className="text-indigo-600 mb-4" /> <h2 className="text-2xl font-bold">Modo Clínico</h2><p className="text-sm text-slate-600">Acceso restringido con clave.</p></button>
         </div>
      </div>
    </div>
  );

  if (accessStep === 'login') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleLoginSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Acceso Autorizado</h2>
        <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-3 border rounded-xl mb-4" placeholder="Contraseña..." autoFocus />
        {authError && <p className="text-red-500 text-xs mb-4">Clave incorrecta.</p>}
        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">Entrar</button>
      </form>
    </div>
  );

  if (view === 'list') return <><div className="p-4 flex justify-end"><button onClick={handleLogout} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border text-xs font-bold"><LogOut className="w-4 h-4" /> Salir</button></div><PatientList patients={patients} consultations={consultations} onSelect={handleSelectPatient} onNew={handleNewPatient} onDelete={(id) => setPatients(p => p.filter(x => x.id !== id))} onImportData={(p, c) => { setPatients(p); setConsultations(c); }} /><PediatricChatbot /></>;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <DosageCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <GrowthHistory isOpen={showGrowthHistory} onClose={() => setShowGrowthHistory(false)} patient={activePatient} consultations={allPatientConsultations} />
      <header className="bg-white border-b h-16 flex items-center px-6 sticky top-0 z-40">
        <button onClick={() => setView('list')} className="mr-4"><ArrowLeft /></button>
        <span className="font-bold text-lg">PediaCare<span className="text-blue-600">EMR</span></span>
        <div className="ml-auto text-right flex items-center gap-3">
          <div><p className="text-sm font-bold">{activePatient.firstName} {activePatient.lastName}</p><p className="text-[10px] text-blue-600 font-black">{calculateAge(activePatient.dob)}</p></div>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{activePatient.firstName[0]}</div>
        </div>
      </header>
      <main className="max-w-[95rem] mx-auto px-6 py-8">
        {activePatient.id && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-sm"><h3 className="text-xs font-black text-red-600 flex items-center gap-2 mb-3"><ShieldAlert className="w-4 h-4" /> ALERGIAS</h3><p className={`p-3 rounded-xl font-bold ${activePatient.history.pathological.allergies ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700'}`}>{activePatient.history.pathological.allergies || "Ninguna registrada."}</p></div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm"><h3 className="text-xs font-black text-purple-600 flex items-center gap-2 mb-3"><ShieldHalf className="w-4 h-4" /> RIESGOS FAMILIARES</h3><div className="flex gap-2">{activePatient.history.family.diabetes && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-[10px] font-bold">DIABETES</span>}{activePatient.history.family.hypertension && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-[10px] font-bold">HTA</span>}{activePatient.history.family.asthma && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-[10px] font-bold">ASMA</span>}<WindIcon className="w-4 h-4 text-slate-300" /></div></div>
          </div>
        )}
        <div className="min-h-[60vh]">{renderStep()}</div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex justify-around items-center z-50 shadow-2xl">
         <button onClick={() => setView('list')} className="flex flex-col items-center text-slate-400 hover:text-blue-600"><Users className="w-5 h-5" /><span className="text-[10px] font-bold">Inicio</span></button>
         <button onClick={() => setCurrentStep(1)} className={`flex flex-col items-center ${currentStep === 1 ? 'text-blue-600' : 'text-slate-400'}`}><FileText className="w-5 h-5" /><span className="text-[10px] font-bold">Datos</span></button>
         <button onClick={() => setCurrentStep(2)} className={`flex flex-col items-center ${currentStep === 2 ? 'text-blue-600' : 'text-slate-400'}`}><Baby className="w-5 h-5" /><span className="text-[10px] font-bold">Hitos</span></button>
         <button onClick={() => setCurrentStep(3)} className={`flex flex-col items-center ${currentStep === 3 ? 'text-blue-600' : 'text-slate-400'}`}><Stethoscope className="w-5 h-5" /><span className="text-[10px] font-bold">Consulta</span></button>
      </div>
      <PediatricChatbot />
    </div>
  );
}

export default App;

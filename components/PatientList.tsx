import React, { useState, useRef } from 'react';
import { Patient, Consultation } from '../types';
import { Search, UserPlus, Users, ChevronRight, User, Trash2, AlertTriangle, Download, Upload } from 'lucide-react';

interface Props {
  patients: Patient[];
  consultations?: Consultation[]; // Optional to support backwards compatibility if needed, but required for backup
  onSelect: (patientId: string) => void;
  onNew: () => void;
  onDelete: (patientId: string) => void;
  onImportData?: (patients: Patient[], consultations: Consultation[]) => void;
}

const PatientList: React.FC<Props> = ({ patients, consultations = [], onSelect, onNew, onDelete, onImportData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.includes(searchTerm)
  );

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault(); 
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      onDelete(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const calculateListAge = (dobString: string) => {
    if (!dobString) return '';
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

  const getDisplayName = (p: Patient) => {
    const firstSurname = p.lastName.split(' ')[0];
    return `${p.firstName} ${firstSurname}`;
  };

  // --- Backup Functions ---

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      patients: patients,
      consultations: consultations,
      version: "2.0"
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `PediaCare_Respaldo_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const parsedData = JSON.parse(jsonContent);

        // Basic validation
        if (parsedData.patients && Array.isArray(parsedData.patients)) {
          const importedPatients = parsedData.patients;
          const importedConsultations = Array.isArray(parsedData.consultations) ? parsedData.consultations : [];
          
          if (onImportData) {
            onImportData(importedPatients, importedConsultations);
          }
        } else {
          alert("El archivo seleccionado no tiene el formato de respaldo correcto.");
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Error al leer el archivo. Asegúrese de que sea un JSON válido.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="text-center py-10 relative">
          <h1 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">
            PediaCare<span className="text-blue-600">EMR</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sistema de gestión clínica pediátrica inteligente. Busque un paciente o inicie un nuevo expediente.
          </p>

          {/* Backup Actions */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
             <button
               onClick={handleExportBackup}
               className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm"
               title="Descargar copia de seguridad al disco duro"
             >
               <Download className="w-4 h-4" />
               Exportar Respaldo
             </button>
             <button
               onClick={handleImportClick}
               className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:text-green-600 hover:border-green-400 hover:bg-green-50 transition-all shadow-sm"
               title="Cargar copia de seguridad desde el disco duro"
             >
               <Upload className="w-4 h-4" />
               Restaurar Copia
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               accept=".json" 
               className="hidden" 
             />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full md:max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm"
              />
            </div>
            <button
              onClick={onNew}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-5 h-5" />
              Nuevo Paciente
            </button>
          </div>

          <div className="space-y-3">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {filtered.map(patient => (
                  <div
                    key={patient.id}
                    onClick={() => onSelect(patient.id)}
                    className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-300 hover:shadow-md cursor-pointer transition-all relative"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                          {getDisplayName(patient)}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <User className="w-3 h-3" />
                          {patient.dob ? calculateListAge(patient.dob) : 'Sin fecha nac.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, patient.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors relative z-20"
                        title="Eliminar paciente"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No se encontraron pacientes.</p>
                {searchTerm && <p className="text-sm text-slate-400 mt-1">Intente con otro nombre.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">¿Eliminar paciente?</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Esta acción eliminará permanentemente el expediente y todo su historial médico.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button
                  onClick={() => setDeleteConfirmationId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-200"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientList;
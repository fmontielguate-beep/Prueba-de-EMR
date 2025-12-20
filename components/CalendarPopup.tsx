
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_COLORS = [
  'bg-sky-500',      // Enero
  'bg-rose-400',     // Febrero
  'bg-emerald-500',  // Marzo
  'bg-amber-400',    // Abril
  'bg-pink-500',     // Mayo
  'bg-cyan-500',     // Junio
  'bg-red-500',      // Julio
  'bg-orange-500',   // Agosto
  'bg-teal-500',     // Septiembre
  'bg-purple-500',   // Octubre
  'bg-amber-700',    // Noviembre
  'bg-indigo-600',   // Diciembre
];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const CalendarPopup: React.FC<Props> = ({ isOpen, onClose }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  if (!isOpen) return null;

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderMonth = (monthIdx: number) => {
    const daysInMonth = getDaysInMonth(monthIdx, currentYear);
    const firstDay = getFirstDayOfMonth(monthIdx, currentYear);
    const days = [];

    // Celdas vacías antes del primer día
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6"></div>);
    }

    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = 
        new Date().getDate() === d && 
        new Date().getMonth() === monthIdx && 
        new Date().getFullYear() === currentYear;

      days.push(
        <div 
          key={d} 
          className={`h-6 w-6 flex items-center justify-center text-[10px] rounded-full transition-colors ${
            isToday ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {d}
        </div>
      );
    }

    return (
      <div key={monthIdx} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
        <div className={`${MONTH_COLORS[monthIdx]} text-white text-center py-1.5 text-xs font-bold uppercase tracking-wider`}>
          {MONTH_NAMES[monthIdx]}
        </div>
        <div className="p-2 flex-1">
          <div className="grid grid-cols-7 mb-1">
            {DAYS_SHORT.map((day, idx) => (
              <div key={idx} className="text-[8px] font-black text-slate-400 text-center uppercase">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5 justify-items-center">
            {days}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
        
        {/* Header con Navegación de Año */}
        <div className="bg-white px-8 py-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2.5 rounded-2xl text-indigo-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Calendario Clínico</h2>
              <p className="text-sm text-slate-500 font-medium">Consulta de fechas y planificación</p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setCurrentYear(prev => prev - 1)}
              className="p-2 hover:bg-white rounded-xl text-slate-600 transition-all hover:shadow-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-2xl font-black text-indigo-600 min-w-[80px] text-center">
              {currentYear}
            </span>
            <button 
              onClick={() => setCurrentYear(prev => prev + 1)}
              className="p-2 hover:bg-white rounded-xl text-slate-600 transition-all hover:shadow-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Grid de Meses */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MONTH_NAMES.map((_, idx) => renderMonth(idx))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-4 border-t border-slate-200 flex justify-between items-center">
          <p className="text-xs text-slate-400 font-medium italic">
            * Calendario de referencia para programación de citas y refuerzos de vacunas.
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPopup;

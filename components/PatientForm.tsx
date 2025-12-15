import React from 'react';
import { Patient, ParentInfo } from '../types';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Users } from 'lucide-react';

interface Props {
  data: Patient;
  onChange: (data: Patient) => void;
}

const PatientForm: React.FC<Props> = ({ data, onChange }) => {
  const handleChange = (field: keyof Patient, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleParentChange = (parent: 'father' | 'mother', field: keyof ParentInfo, value: string | number) => {
    onChange({
      ...data,
      [parent]: { ...data[parent], [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Datos del Paciente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nombres</label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
              placeholder="Ej. Juan Andrés"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Apellidos</label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
              placeholder="Ej. Pérez López"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
              <Users className="w-3 h-3" /> Género
            </label>
            <select
              value={data.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
            >
               <option value="male">Masculino</option>
               <option value="female">Femenino</option>
               <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={data.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> NIT (Facturación)
            </label>
            <input
              type="text"
              value={data.nit}
              onChange={(e) => handleChange('nit', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
              placeholder="Número de identificación tributaria"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Dirección</label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
              placeholder="Dirección completa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Teléfono
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Correo Electrónico
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Padre */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-md font-medium text-slate-800 mb-3 border-b pb-2">Datos del Padre</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase">Nombre</label>
              <input
                type="text"
                value={data.father.name}
                onChange={(e) => handleParentChange('father', 'name', e.target.value)}
                className="w-full border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase">Edad</label>
                <input
                  type="number"
                  value={data.father.age}
                  onChange={(e) => handleParentChange('father', 'age', parseInt(e.target.value) || '')}
                  className="w-full border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase">Profesión</label>
                <input
                  type="text"
                  value={data.father.profession}
                  onChange={(e) => handleParentChange('father', 'profession', e.target.value)}
                  className="w-full border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Madre */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-md font-medium text-slate-800 mb-3 border-b pb-2">Datos de la Madre</h4>
          <div className="space-y-3">
             <div>
              <label className="block text-xs font-medium text-slate-500 uppercase">Nombre</label>
              <input
                type="text"
                value={data.mother.name}
                onChange={(e) => handleParentChange('mother', 'name', e.target.value)}
                className="w-full border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase">Edad</label>
                <input
                  type="number"
                  value={data.mother.age}
                  onChange={(e) => handleParentChange('mother', 'age', parseInt(e.target.value) || '')}
                  className="w-full border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase">Profesión</label>
                <input
                  type="text"
                  value={data.mother.profession}
                  onChange={(e) => handleParentChange('mother', 'profession', e.target.value)}
                  className="w-full border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
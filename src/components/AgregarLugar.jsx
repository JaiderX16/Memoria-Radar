import React from 'react';
import { Target, X, MapPin } from 'lucide-react';

const AgregarLugar = ({ onToggleAddMode, isAddingMode }) => {
  return (
    <button
      onClick={onToggleAddMode}
      className={`${
        isAddingMode 
          ? 'bg-red-600 hover:bg-red-700' 
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white p-2 rounded-lg transition-colors shadow-lg hover:shadow-xl`}
      title={isAddingMode ? "Cancelar selección" : "Agregar nuevo lugar"}
    >
      {isAddingMode ? <X className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
    </button>
  );
};

export default AgregarLugar;
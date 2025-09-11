import React, { useState } from 'react';
import { X, MapPin, Save } from 'lucide-react';
import { categorias, colores } from '../data/categorias';

const FormularioLugar = ({ isOpen, onClose, onSubmit, initialCoords }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    latitud: initialCoords?.lat || '',
    longitud: initialCoords?.lng || '',
    descripcion: '',
    imagen: '',
    categoria: 'monumentos',
    color: 'blue'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre || !formData.descripcion) {
      alert('Por favor, completa el nombre y la descripción');
      return;
    }

    // Validar coordenadas
    const lat = initialCoords?.lat || parseFloat(formData.latitud);
    const lng = initialCoords?.lng || parseFloat(formData.longitud);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Por favor, ingresa coordenadas válidas');
      return;
    }

    const nuevoLugar = {
      id: Date.now(), // ID simple basado en timestamp
      nombre: formData.nombre,
      latitud: lat,
      longitud: lng,
      descripcion: formData.descripcion,
      imagen: formData.imagen || 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoria: formData.categoria,
      color: formData.color
    };

    onSubmit(nuevoLugar);
    
    // Limpiar formulario
    setFormData({
      nombre: '',
      latitud: '',
      longitud: '',
      descripcion: '',
      imagen: '',
      categoria: 'monumentos',
      color: 'blue'
    });
    
    onClose();
  };

  // Update form when initialCoords change
  React.useEffect(() => {
    if (initialCoords) {
      setFormData(prev => ({
        ...prev,
        latitud: initialCoords.lat,
        longitud: initialCoords.lng
      }));
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10001] p-4">
        <div className="bg-white border border-black rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black">
          <div className="flex items-center space-x-3">
            <div className="bg-black p-2">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-black">
              Agregar Nuevo Lugar
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Nombre del lugar
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-black focus:outline-none focus:border-black rounded-lg"
              placeholder="Ej: Sagrada Familia"
              required
            />
          </div>

          {!initialCoords && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Latitud
                </label>
                <input
                  type="number"
                  name="latitud"
                  value={formData.latitud}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-3 py-2 border border-black focus:outline-none focus:border-black rounded-lg"
                  placeholder="41.4036"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Longitud
                </label>
                <input
                  type="number"
                  name="longitud"
                  value={formData.longitud}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-3 py-2 border border-black focus:outline-none focus:border-black rounded-lg"
                  placeholder="2.1744"
                  required
                />
              </div>
            </div>
          )}

          {initialCoords && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Ubicación seleccionada
              </label>
              <div className="bg-white border border-black p-3 rounded-lg">
                <p className="text-sm text-black">
                  <span className="font-medium">Latitud:</span> {initialCoords.lat.toFixed(6)}
                </p>
                <p className="text-sm text-black">
                  <span className="font-medium">Longitud:</span> {initialCoords.lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-black focus:outline-none focus:border-black rounded-lg"
              placeholder="Describe el lugar de interés..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Categoría
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black focus:outline-none focus:border-black rounded-lg"
              >
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.icon} {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Color del marcador
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black focus:outline-none focus:border-black rounded-lg"
              >
                {colores.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              URL de imagen (opcional)
            </label>
            <input
              type="url"
              name="imagen"
              value={formData.imagen}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-black focus:outline-none focus:border-black rounded-lg"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="text-xs text-black mt-1">
              Si no se proporciona, se usará una imagen por defecto
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-black text-black hover:bg-gray-100 transition-colors rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 rounded-lg"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Lugar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioLugar;
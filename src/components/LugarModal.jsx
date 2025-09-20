import React, { useEffect } from 'react';
import Panorama360 from './Panorama360';

const LugarModal = ({ lugar, isOpen, onClose }) => {
  if (!isOpen || !lugar) return null;

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const viewerOptions = {
    navbar: false,
    mousemove: true,
    touchmoveTwoFingers: false,
    canvasBackground: '#000000',
    autorotateSpeed: '1rpm'
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">{lugar.nombre}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Panorama 360 */}
          <div className="w-full h-64 sm:h-80 md:h-96 bg-black">
            <Panorama360 
              panoramaUrl={lugar.imagen} 
              className="w-full h-full" 
              viewerOptions={viewerOptions}
              onReady={() => console.log('Panorama modal listo')}
              onError={(error) => console.error('Panorama error:', error)}
            />
          </div>

          {/* Place Information */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">{lugar.descripcion}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Coordenadas</h4>
                <p className="text-sm text-gray-600">
                  Lat: {lugar.latitud.toFixed(6)}, Lng: {lugar.longitud.toFixed(6)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Ubicación</h4>
                <p className="text-sm text-gray-600">Huancayo, Perú</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LugarModal;
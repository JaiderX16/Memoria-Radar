import React from 'react';
import { Search, MapPin, Menu, X, Plus, Trash2 } from 'lucide-react';

const Sidebar = ({ 
  lugares, 
  filteredLugares, 
  searchTerm, 
  setSearchTerm, 
  onLugarClick, 
  isOpen, 
  setIsOpen,
  onAddLugar,
  onDeleteLugar
}) => {
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[9999] bg-white rounded-md shadow-md p-3 hover:shadow-lg transition-all duration-200 border border-gray-200"
      >
        {isOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-70 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full w-80 bg-white shadow-md z-[9999]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r border-gray-200
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-black">
                Lugares de Interés
              </h1>
              <button
                onClick={onAddLugar}
                className="p-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                title="Agregar nuevo lugar"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Descubre los mejores sitios de Huancayo
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar lugares..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-gray-50"
            />
          </div>

          {/* Places list */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {filteredLugares.map((lugar) => (
                <div
                  key={lugar.id}
                  onClick={() => {
                    // Solo seleccionamos el lugar pero no abrimos el modal detallado
                    onLugarClick(lugar);
                    setIsOpen(false);
                    
                    // Centramos el mapa en el lugar seleccionado
                  }}
                  className="p-4 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200 border border-gray-100 hover:border-gray-300 group relative"
                >
                  <div className="flex items-center space-x-3 pr-8">
                    <div className="flex-shrink-0">
                      <MapPin className="w-5 h-5 text-black group-hover:text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black truncate group-hover:text-gray-800">
                        {lugar.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {lugar.descripcion}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Abrimos el modal detallado
                          window.openModalDetalle(lugar);
                        }}
                        className="mt-2 bg-black text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800 transition-colors"
                      >
                        Ver más
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`¿Estás seguro de que quieres eliminar "${lugar.nombre}"?`)) {
                        onDeleteLugar(lugar.id);
                      }
                    }}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar lugar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {filteredLugares.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No se encontraron lugares que coincidan con "{searchTerm}"
                </p>
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center font-medium">
              {filteredLugares.length} de {lugares.length} lugares
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
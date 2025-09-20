import React, { useState } from 'react';
import { Search, MapPin, Menu, X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { categorias } from '../data/categorias';

const Sidebar = ({ 
  lugares, 
  filteredLugares, 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory,
  onLugarClick, 
  isOpen, 
  setIsOpen,
  onAddLugar,
  onDeleteLugar
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const selectedCategoryData = categorias.find(cat => cat.id === selectedCategory);
  const displayText = selectedCategoryData ? selectedCategoryData.nombre : 'Todas las categorías';
  return (
    <>
      {/* Mobile menu button - Minimalista */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-[9999] bg-white p-2.5 rounded-lg shadow-sm border border-gray-200 transition-colors"
      >
        {isOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
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
          {/* Header - Minimalista */}
          <div className="py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Lugares de Interés</h1>
              <button
                onClick={onAddLugar}
                className="p-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                title="Agregar nuevo lugar"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search - Minimalista */}
          <div className="py-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar lugares..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              />
            </div>
          </div>

          {/* Filter Section - Dropdown Minimalista */}
          <div className="py-4 border-b border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Categoría</h3>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  {selectedCategoryData && <span>{selectedCategoryData.icon}</span>}
                  <span>{displayText}</span>
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        selectedCategory === '' 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>Todas las categorías</span>
                      </span>
                    </button>
                    {categorias.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center space-x-2 ${
                          selectedCategory === cat.id 
                            ? 'bg-gray-900 text-white' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results - Minimalista */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-4">
              <p className="text-xs text-gray-500 mb-4 tracking-wide">
                {filteredLugares.length} resultado{filteredLugares.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {filteredLugares.map((lugar) => (
                  <div
                    key={lugar.id}
                    onClick={() => onLugarClick(lugar)}
                    className="px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{lugar.nombre}</h4>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{lugar.descripcion}</p>
                        <div className="mt-2">
                          <span className="text-xs text-gray-400 capitalize">
                            {lugar.categoria}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLugar(lugar.id);
                        }}
                        className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
          </div>

          {/* Footer - Minimalista */}
          <div className="py-4 border-t border-gray-100">
            <button
              onClick={onAddLugar}
              className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <Plus size={16} />
              <span>Nuevo lugar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
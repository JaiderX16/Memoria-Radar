import React, { useState, useEffect } from 'react';
import { Search, MapPin, Menu, X, Plus, Trash2, ChevronDown, Building, Utensils, Camera, TreePine, Landmark } from 'lucide-react';
import { categorias } from '../data/categorias';
import FiltrosAvanzados from './FiltrosAvanzados';
import { globalFilterState, setMentionedPlacesFilter, clearMentionedPlacesFilter } from '../utils/globalState';

const Sidebar = ({ 
  lugares, 
  filteredLugares, 
  searchTerm, 
  setSearchTerm, 
  selectedCategories,
  setSelectedCategories,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  filterStats,
  onLugarClick, 
  isOpen, 
  setIsOpen,
  onAddLugar,
  onDeleteLugar,
  onClearFilters,
  onToggleCategory
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeManualFilter, setActiveManualFilter] = useState(() => globalFilterState.getState().currentFilter);
  const [isManualFilterActive, setIsManualFilterActive] = useState(() => globalFilterState.getState().isActive);
  const [dynamicTitle, setDynamicTitle] = useState(() => globalFilterState.getDynamicTitle());
  const [mentionedPlaces, setMentionedPlaces] = useState(() => globalFilterState.getState().mentionedPlaces);
  const [filterByMentionedPlaces, setFilterByMentionedPlaces] = useState(() => globalFilterState.getState().filterByMentionedPlaces);
  const dropdownRef = React.useRef(null);
  
  // Configuración de filtros manuales con iconos
  const manualFilters = [
    { id: 'todos', label: 'Todos', icon: MapPin, color: 'bg-gray-500' },
    { id: 'parques', label: 'Parques', icon: TreePine, color: 'bg-green-500' },
    { id: 'monumentos', label: 'Patrimonio', icon: Landmark, color: 'bg-amber-500' },
    { id: 'restaurantes', label: 'Restaurantes', icon: Utensils, color: 'bg-red-500' },
    { id: 'museos', label: 'Museos', icon: Camera, color: 'bg-purple-500' },
    { id: 'hoteles', label: 'Hoteles', icon: Building, color: 'bg-blue-500' }
  ];
  
  // Función de filtrado manual usando el estado global
  const filterManual = (category) => {
    const currentState = globalFilterState.getState();
    const newFilter = category === currentState.currentFilter ? 'todos' : category;
    
    // Actualizar el estado global
    globalFilterState.setManualFilter(newFilter);
    
    if (newFilter === 'todos') {
      // Mostrar todos los lugares
      onClearFilters();
    } else {
      // Aplicar filtro de categoría específica
      if (setSelectedCategories) {
        setSelectedCategories([newFilter]);
      }
    }
  };
  
  // Suscribirse a cambios en el estado global del filtro
  useEffect(() => {
    const unsubscribe = globalFilterState.subscribe((newState) => {
      console.log('📋 [SIDEBAR] Cambio en estado global detectado:', newState);
      setActiveManualFilter(newState.currentFilter);
      setIsManualFilterActive(newState.isActive);
      setDynamicTitle(globalFilterState.getDynamicTitle());
      setMentionedPlaces(newState.mentionedPlaces);
      setFilterByMentionedPlaces(newState.filterByMentionedPlaces);
      console.log('📋 [SIDEBAR] Estado local actualizado:', {
        activeManualFilter: newState.currentFilter,
        mentionedPlaces: newState.mentionedPlaces,
        filterByMentionedPlaces: newState.filterByMentionedPlaces
      });
    });
    
    return unsubscribe;
  }, []);

  // DEBUG: Log de lugares filtrados recibidos como prop
  useEffect(() => {
    console.log('📋 [SIDEBAR] ===== LUGARES FILTRADOS RECIBIDOS =====');
    console.log('📋 [SIDEBAR] Total lugares:', filteredLugares?.length || 0);
    console.log('📋 [SIDEBAR] Nombres lugares:', filteredLugares?.map(l => l.nombre) || []);
    console.log('📋 [SIDEBAR] filterByMentionedPlaces:', filterByMentionedPlaces);
    console.log('📋 [SIDEBAR] mentionedPlaces:', mentionedPlaces);
    console.log('📋 [SIDEBAR] ===== FIN LUGARES FILTRADOS =====');
  }, [filteredLugares, filterByMentionedPlaces, mentionedPlaces]);
  
  // Función para obtener el título dinámico MEJORADO
  const getDynamicTitle = () => {
    if (filterByMentionedPlaces && mentionedPlaces && mentionedPlaces.length > 0) {
      return `🤖 Filtrado por MIA (${mentionedPlaces.length})`;
    }
    if (isManualFilterActive && activeManualFilter !== 'todos') {
      const filter = manualFilters.find(f => f.id === activeManualFilter);
      return `🎯 ${filter?.label || 'Filtrado'} en Huancayo`;
    }
    return '🗺️ Explorar Huancayo';
  };
  
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const selectedCategoryData = selectedCategories.length === 1 
    ? categorias.find(cat => cat.id === selectedCategories[0])
    : null;
  const displayText = selectedCategoryData 
    ? selectedCategoryData.nombre 
    : selectedCategories.length > 1 
      ? `${selectedCategories.length} categorías`
      : 'Todas las categorías';
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
          {/* Header con título dinámico */}
          <div className="border-b border-gray-200 bg-white">
            {/* Banner PROMINENTE para filtrado por MIA */}
            {filterByMentionedPlaces && mentionedPlaces.length > 0 && (
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-4 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <MapPin className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-base mb-1">
                        🤖 MIA está filtrando lugares
                      </div>
                      <div className="text-sm opacity-95 mb-2">
                        Mostrando {mentionedPlaces.length} lugar{mentionedPlaces.length > 1 ? 'es' : ''} mencionado{mentionedPlaces.length > 1 ? 's' : ''} en la conversación
                      </div>
                      {/* Lista PROMINENTE de lugares mencionados */}
                      <div className="flex flex-wrap gap-2">
                        {mentionedPlaces.map((place, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 bg-white bg-opacity-25 backdrop-blur-sm rounded-full text-sm font-semibold border border-white border-opacity-30"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            {place}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => clearMentionedPlacesFilter()}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="Limpiar filtro de MIA"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight transition-all duration-300">{getDynamicTitle()}</h1>
                <button
                  onClick={onAddLugar}
                  className="p-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  title="Agregar nuevo lugar"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Indicadores MEJORADOS de filtros manuales */}
              {!filterByMentionedPlaces && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {isManualFilterActive && (
                    <div className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                      <MapPin className="w-4 h-4 mr-2 animate-bounce" />
                      Filtro manual activo
                      <div className="ml-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Filtros manuales */}
          <div className="py-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              Filtros Rápidos
              {(isManualFilterActive || filterByMentionedPlaces) && (
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                  filterByMentionedPlaces 
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {filterByMentionedPlaces ? 'Lugares mencionados' : '1 activo'}
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {manualFilters.map((filter) => {
                const IconComponent = filter.icon;
                const isActive = activeManualFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => filterManual(filter.id)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium relative overflow-hidden
                      transition-all duration-300 transform hover:scale-105
                      ${
                        isActive
                          ? `${filter.color} text-white shadow-lg border-2 border-opacity-50`
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
                    )}
                    <IconComponent className={`w-4 h-4 ${isActive ? 'animate-bounce' : ''}`} />
                    <span className="truncate">{filter.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-ping"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search and Filters - solo mostrar si no hay filtro manual activo ni lugares mencionados */}
          {!isManualFilterActive && !filterByMentionedPlaces && (
            <div className="py-4 border-b border-gray-100">
              <FiltrosAvanzados
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                filteredLugares={filteredLugares}
                onClearFilters={onClearFilters}
                isCompact={true}
              />
            </div>
          )}

          {/* Results - Minimalista */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredLugares?.length || 0} lugares encontrados
                </p>
                {/* Botón para limpiar filtro manual o lugares mencionados */}
                {(isManualFilterActive || filterByMentionedPlaces) && (
                  <button
                    onClick={() => filterByMentionedPlaces ? clearMentionedPlacesFilter() : filterManual('todos')}
                    className={`text-xs underline ${
                      filterByMentionedPlaces 
                        ? 'text-green-600 hover:text-green-800'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Limpiar filtro
                  </button>
                )}
              </div>
              
              {/* Información PROMINENTE cuando MIA está filtrando */}
              {filterByMentionedPlaces && mentionedPlaces.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4 mb-4 shadow-sm">
                  <div className="flex items-center space-x-3 text-green-800 mb-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <span className="text-base font-bold">
                        🤖 Resultados filtrados por MIA
                      </span>
                      <p className="text-sm text-green-700 mt-1">
                        {filteredLugares.length > 0 
                          ? `Encontrados ${filteredLugares.length} de ${mentionedPlaces.length} lugares mencionados`
                          : `Los ${mentionedPlaces.length} lugares mencionados no están en la base de datos`
                        }
                      </p>
                    </div>
                  </div>
                  {filteredLugares.length > 0 && (
                    <div className="bg-white bg-opacity-60 rounded-lg p-2">
                      <p className="text-xs text-green-600 font-medium">
                        💡 Estos son los lugares que MIA mencionó y que están registrados en Huancayo
                      </p>
                    </div>
                  )}
                </div>
              )}
              
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

              {filteredLugares.length === 0 && (
                <div className="text-center py-8">
                  {filterByMentionedPlaces ? (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                      <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-orange-900 mb-3">
                        🤖 MIA mencionó lugares no registrados
                      </h3>
                      <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4">
                        <p className="text-orange-800 font-medium mb-2">
                          Lugares mencionados por MIA:
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {mentionedPlaces.map((place, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-semibold"
                            >
                              <MapPin className="w-3 h-3 mr-1" />
                              {place}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-orange-700 mb-4">
                        Estos lugares no están registrados en nuestra base de datos de Huancayo.
                      </p>
                      <button
                        onClick={() => clearMentionedPlacesFilter()}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Limpiar filtro de MIA
                      </button>
                    </div>
                  ) : (
                    <div>
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay lugares que mostrar
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {((searchTerm || selectedCategories.length > 0 || isManualFilterActive)
                          ? 'No se encontraron lugares con los filtros aplicados.'
                          : 'Aún no hay lugares registrados en esta zona.')}
                      </p>
                      {(isManualFilterActive || searchTerm || selectedCategories.length > 0) && (
                        <button
                          onClick={() => isManualFilterActive ? filterManual('todos') : onClearFilters()}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  )}
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
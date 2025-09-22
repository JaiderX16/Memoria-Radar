import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown, MapPin, SlidersHorizontal } from 'lucide-react';
import { categorias } from '../data/categorias';

const FiltrosAvanzados = ({
  searchTerm,
  setSearchTerm,
  selectedCategories,
  setSelectedCategories,
  filteredLugares,
  onClearFilters,
  isCompact = false
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const categoryDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar selección múltiple de categorías
  const toggleCategory = (categoryId) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newSelected);
  };

  // Limpiar todos los filtros
  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSortBy('nombre');
    setSortOrder('asc');
    onClearFilters();
  };

  // Obtener texto de categorías seleccionadas
  const getSelectedCategoriesText = () => {
    if (selectedCategories.length === 0) return 'Todas las categorías';
    if (selectedCategories.length === 1) {
      const cat = categorias.find(c => c.id === selectedCategories[0]);
      return cat ? cat.nombre : 'Categoría';
    }
    return `${selectedCategories.length} categorías`;
  };

  // Contar filtros activos
  const activeFiltersCount = (searchTerm ? 1 : 0) + (selectedCategories.length > 0 ? 1 : 0);

  return (
    <div className={`space-y-4 ${isCompact ? 'space-y-3' : ''}`}>
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <div className={`relative transition-all duration-200 ${searchFocus ? 'transform scale-[1.02]' : ''}`}>
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
            searchFocus ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar lugares por nombre, descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            aria-label="Buscar lugares"
            aria-describedby="search-help"
            className={`w-full pl-10 pr-12 py-3 text-sm bg-white border rounded-xl transition-all duration-200 ${
              searchFocus 
                ? 'border-blue-500 ring-2 ring-blue-100 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            } focus:outline-none`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div id="search-help" className="sr-only">
          Escribe para buscar lugares por nombre o descripción
        </div>
      </div>

      {/* Filtros rápidos y botón de filtros avanzados */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center min-w-0 flex-1">
          {/* Selector de categorías múltiples */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              aria-expanded={isCategoryDropdownOpen}
              aria-haspopup="true"
              aria-label={`Filtrar por categorías. ${getSelectedCategoriesText()}`}
              className={`flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg transition-all duration-200 min-w-0 ${
                selectedCategories.length > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Filter className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{getSelectedCategoriesText()}</span>
              <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                isCategoryDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {isCategoryDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-72 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                role="dialog"
                aria-label="Seleccionar categorías"
              >
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Filtrar por categorías</h3>
                    {selectedCategories.length > 0 && (
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="text-xs text-blue-600 hover:text-blue-700"
                        aria-label="Limpiar todas las categorías seleccionadas"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-2" role="group" aria-label="Lista de categorías">
                    {categorias.map(categoria => (
                      <label
                        key={categoria.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(categoria.id)}
                          onChange={() => toggleCategory(categoria.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          aria-describedby={`categoria-${categoria.id}-desc`}
                        />
                        <span className="text-lg" aria-hidden="true">{categoria.icon}</span>
                        <span className="text-sm text-gray-700 flex-1">{categoria.nombre}</span>
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: categoria.color }}
                          aria-hidden="true"
                        />
                        <span id={`categoria-${categoria.id}-desc`} className="sr-only">
                          Categoría {categoria.nombre}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón de filtros avanzados */}
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            aria-expanded={isAdvancedOpen}
            aria-label="Mostrar filtros avanzados"
            className={`flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg transition-all duration-200 ${
              isAdvancedOpen
                ? 'bg-gray-100 border-gray-300 text-gray-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Avanzado</span>
          </button>
        </div>

        {/* Contador de resultados y limpiar filtros */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
            {filteredLugares.length} resultado{filteredLugares.length !== 1 ? 's' : ''}
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearAll}
              aria-label={`Limpiar ${activeFiltersCount} filtros activos`}
              className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1 whitespace-nowrap"
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">Limpiar ({activeFiltersCount})</span>
              <span className="sm:hidden">({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {isAdvancedOpen && (
        <div 
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
          role="region"
          aria-label="Filtros avanzados"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Filtros avanzados</h3>
            <button
              onClick={() => setIsAdvancedOpen(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Cerrar filtros avanzados"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ordenar por */}
            <div>
              <label htmlFor="sort-by-select" className="block text-xs font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                aria-describedby="sort-by-help"
              >
                <option value="nombre">Nombre</option>
                <option value="categoria">Categoría</option>
                <option value="reciente">Más reciente</option>
              </select>
              <div id="sort-by-help" className="sr-only">
                Selecciona el criterio para ordenar los lugares
              </div>
            </div>

            {/* Orden */}
            <div>
              <label htmlFor="sort-order-select" className="block text-xs font-medium text-gray-700 mb-2">
                Orden
              </label>
              <select
                id="sort-order-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                aria-describedby="sort-order-help"
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
              <div id="sort-order-help" className="sr-only">
                Selecciona si ordenar de forma ascendente o descendente
              </div>
            </div>
          </div>

          {/* Categorías seleccionadas como chips */}
          {selectedCategories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Categorías seleccionadas ({selectedCategories.length})
              </label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Categorías seleccionadas">
                {selectedCategories.map(categoryId => {
                  const categoria = categorias.find(c => c.id === categoryId);
                  return categoria ? (
                    <span
                      key={categoryId}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      <span aria-hidden="true">{categoria.icon}</span>
                      <span>{categoria.nombre}</span>
                      <button
                        onClick={() => toggleCategory(categoryId)}
                        className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                        aria-label={`Quitar filtro de categoría ${categoria.nombre}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado vacío mejorado */}
      {filteredLugares.length === 0 && (searchTerm || selectedCategories.length > 0) && (
        <div 
          className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
          role="status"
          aria-live="polite"
        >
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron lugares</h3>
          <p className="text-xs text-gray-500 mb-4">
            Intenta ajustar tus filtros o términos de búsqueda
          </p>
          <button
            onClick={handleClearAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            aria-label="Limpiar todos los filtros aplicados"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltrosAvanzados;
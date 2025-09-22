import React, { useState, useMemo, useEffect } from 'react';
import Mapa from './components/Mapa';
import Sidebar from './components/Sidebar';
import FormularioLugar from './components/FormularioLugar';
import Mia from './components/Mia';
import { useFiltrosAvanzados } from './hooks/useFiltrosAvanzados';
import { lugares as lugaresLocales } from './data/lugares';
import { globalFilterState } from './utils/globalState';

function App() {
  const [lugares, setLugares] = useState([]);
  const [selectedLugar, setSelectedLugar] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newLugarCoords, setNewLugarCoords] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mentionedPlaces, setMentionedPlaces] = useState([]);
  const [filterByMentionedPlaces, setFilterByMentionedPlaces] = useState(false);




  const {
    filteredLugares,
    filterStats,
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    clearAllFilters,
    clearSearch,
    clearCategories,
    toggleCategory,
    addCategory,
    removeCategory,
    searchSuggestions,
    quickFilters
  } = useFiltrosAvanzados(lugares, mentionedPlaces, filterByMentionedPlaces);

  useEffect(() => {
    const unsubscribe = globalFilterState.subscribe((state) => {
      setMentionedPlaces(state.mentionedPlaces || []);
      setFilterByMentionedPlaces(state.filterByMentionedPlaces || false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const mapFrontendToBackendCategory = (categories) => {
      if (!categories?.length) return [];
      const categoryMap = {
        'parques': 'parques',
        'monumentos': 'patrimonio',
        'tiendas': 'centros-comerciales',
        'museos': 'museos',
        'mercados': 'mercados',
        'hoteles': 'hoteles',
        'playas': 'playas',
        'bares': 'bares',
        'discotecas': 'discotecas',
        'restaurantes': 'restaurantes'
      };
      return categories.map(id => categoryMap[(id || '').toLowerCase()] || id.toLowerCase());
    };

    const normalizeText = (str) => 
      (str || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const mapBackendToFrontendCategory = (categoria) => {
      const c = normalizeText(categoria);
      const categoryMappings = {
        'parques': ['parques','parque','naturaleza'],
        'museos': ['museos','museo'],
        'mercados': ['mercados','mercado'],
        'restaurantes': ['restaurantes','restaurante','comida','gastronomia'],
        'bares': ['bares','bar','vida nocturna','nocturno'],
        'tiendas': ['tiendas','compras','centro comercial','centros comerciales','centros-comerciales','centro-comercial'],
        'hoteles': ['hoteles','hotel','hostal','alojamiento'],
        'monumentos': ['patrimonio','monumentos','monumento','historia'],
        'playas': ['playas','playa'],
        'discotecas': ['discotecas','discoteca','club']
      };
      
      for (const [category, keywords] of Object.entries(categoryMappings)) {
        if (keywords.includes(c)) return category;
      }
      return 'otros';
    };

    const params = new URLSearchParams();
    const backendCategories = mapFrontendToBackendCategory(selectedCategories);
    if (backendCategories.length > 0) {
      backendCategories.forEach(cat => params.append('category', cat));
    }
    if (searchTerm) params.append('search', searchTerm);

    const url = `/api/places${params.toString() ? `?${params.toString()}` : ''}`;

    const fetchPlaces = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        const places = Array.isArray(data?.places) ? data.places : [];
        const mapped = places.map((p, idx) => {
          // Parsear ubicación "lat, lng" cuando esté disponible
          let lat = null, lng = null;
          if (typeof p.ubicacion === 'string' && p.ubicacion.includes(',')) {
            const [latStr, lngStr] = p.ubicacion.split(',');
            lat = parseFloat(latStr);
            lng = parseFloat(lngStr);
            if (Number.isNaN(lat)) lat = null;
            if (Number.isNaN(lng)) lng = null;
          }
          return {
            id: `${p.nombre || 'lugar'}-${idx}`,
            nombre: p.nombre || '',
            descripcion: p.descripcion || '',
            categoria: mapBackendToFrontendCategory(p.categoria || 'otros'),
            latitud: lat,
            longitud: lng,
            imagen: p.imagen_url || '',
            // color opcional; el componente usa azul por defecto si es undefined
            color: undefined
          };
        });
        console.log('📍 [APP] DEBUG - Lugares cargados desde backend:', {
          total: mapped.length,
          nombres: mapped.map(l => l.nombre),
          categorias: mapped.map(l => l.categoria),
          detalles: mapped.map(l => ({
            nombre: l.nombre,
            categoria: l.categoria,
            normalizado: l.nombre?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '')
          }))
        });
        setLugares(mapped);
        // Exponer lugares en el objeto global para pruebas
        window.lugares = mapped;
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Error cargando lugares:', e);
          // Fallback local para permitir probar el filtrado sin backend
          const mappedLocal = (lugaresLocales || []).map((p, idx) => ({
            id: `${p.nombre || 'lugar'}-local-${idx}`,
            nombre: p.nombre || '',
            descripcion: p.descripcion || '',
            categoria: mapBackendToFrontendCategory(p.categoria || 'otros'),
            latitud: p.latitud ?? null,
            longitud: p.longitud ?? null,
            imagen: p.imagen || '',
            color: p.color
          }));
          console.log('📍 [APP] DEBUG - Lugares cargados desde fallback local:', {
            total: mappedLocal.length,
            nombres: mappedLocal.map(l => l.nombre),
            categorias: mappedLocal.map(l => l.categoria),
            detalles: mappedLocal.map(l => ({
              nombre: l.nombre,
              categoria: l.categoria,
              normalizado: l.nombre?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '')
            }))
          });
          setLugares(mappedLocal);
          // Exponer lugares en el objeto global para pruebas
          window.lugares = mappedLocal;
        }
      }
    };

    fetchPlaces();

    return () => controller.abort();
  }, [selectedCategories, searchTerm]);

  // El filtrado ahora se maneja completamente en el hook useFiltrosAvanzados
  // Mantenemos esta lógica como respaldo para compatibilidad con el backend

  const handleLugarClick = (lugar) => {
    setSelectedLugar(lugar);
    // No abrimos el modal aquí, solo seleccionamos el lugar
  };

  const handleAddLugar = () => {
    setIsAddingMode(true);
  };

  const handleMapClick = (latlng) => {
    setNewLugarCoords({ lat: latlng.lat, lng: latlng.lng });
    setIsAddingMode(false);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setNewLugarCoords(null);
    setIsAddingMode(false);
  };

  const handleSubmitLugar = (nuevoLugar) => {
    setLugares(prev => [...prev, nuevoLugar]);
  };

  const handleDeleteLugar = (lugarId) => {
    setLugares(prev => prev.filter(lugar => lugar.id !== lugarId));
    // Si el lugar eliminado estaba seleccionado, limpiar la selección
    if (selectedLugar && selectedLugar.id === lugarId) {
      setSelectedLugar(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg z-10 flex-shrink-0">
          <Sidebar
            lugares={lugares}
            filteredLugares={filteredLugares}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            filterStats={filterStats}
            onLugarClick={handleLugarClick}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            onAddLugar={handleAddLugar}
            onDeleteLugar={handleDeleteLugar}
            onClearFilters={clearAllFilters}
            onToggleCategory={toggleCategory}
          />
        </div>

        {/* Mapa */}
        <div className="flex-1 relative">
          <Mapa
            lugares={filteredLugares}
            onLugarClick={handleLugarClick}
            selectedLugar={selectedLugar}
            onMapClick={handleMapClick}
            isAddingMode={isAddingMode}
          />
        </div>
      </div>

      {/* Form Modal */}
      <FormularioLugar
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmitLugar}
        initialCoords={newLugarCoords}
      />

      {/* Mia Chat Widget */}
      <Mia 
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        onSetCategory={(categoryId) => setSelectedCategories([categoryId])} 
        onSetSearch={setSearchTerm}
        currentFilters={{
          searchTerm,
          selectedCategories,
          sortBy,
          sortOrder
        }}
        onClearFilters={clearAllFilters}
        onToggleCategory={toggleCategory}
      />
    </div>
  );
}

export default App; //poruqe no
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


  // DEBUG: Logs inmediatos al cargar
  useEffect(() => {
    console.log('🚀 [APP] ===== APP CARGADA =====');
    console.log('🚀 [APP] Total lugares disponibles:', lugares.length);
    console.log('🚀 [APP] Lugares disponibles:', lugares.map(l => `${l.id}: ${l.nombre} (${l.categoria})`));
    
    // Buscar los lugares específicos que MIA menciona
    const parqueConstitucion = lugares.find(l => l.nombre === "Parque Constitución");
    const plazaHuamanmarca = lugares.find(l => l.nombre === "Plaza Huamanmarca");
    
    console.log('🚀 [APP] Parque Constitución encontrado:', parqueConstitucion ? `${parqueConstitucion.nombre} (${parqueConstitucion.categoria})` : 'NO ENCONTRADO');
    console.log('🚀 [APP] Plaza Huamanmarca encontrada:', plazaHuamanmarca ? `${plazaHuamanmarca.nombre} (${plazaHuamanmarca.categoria})` : 'NO ENCONTRADO');
    
    // Función de prueba
    window.testMiaFilteringSpecific = () => {
      console.log('🧪 [TEST] ===== SIMULANDO FILTRADO DE MIA =====');
      const lugaresExtraidos = ["Parque Constitución", "Plaza Huamanmarca"];
      setMentionedPlacesFilter(lugaresExtraidos);
      console.log('🧪 [TEST] Filtro aplicado con:', lugaresExtraidos);
    };
    
    console.log('🚀 [APP] ===== FIN CARGA APP =====');
  }, []);

  // Hook de filtros avanzados
  console.log('🔥 [APP] Llamando hook con:', { 
    lugaresCount: lugares.length, 
    mentionedPlaces, 
    filterByMentionedPlaces 
  });
  
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
  
  console.log('🔥 [APP] Hook retornó:', { 
    filteredLugaresCount: filteredLugares.length,
    filterStats 
  });

  // Suscribirse al estado global para lugares mencionados
  useEffect(() => {
    const unsubscribe = globalFilterState.subscribe((state) => {
      console.log('🔄 [APP] Estado global actualizado:', state);
      console.log('🔄 [APP] Lugares mencionados:', state.mentionedPlaces);
      console.log('🔄 [APP] Filtro activo:', state.filterByMentionedPlaces);
      setMentionedPlaces(state.mentionedPlaces || []);
      setFilterByMentionedPlaces(state.filterByMentionedPlaces || false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    // Mapear categorías del frontend a las esperadas por el backend
    const mapFrontendToBackendCategory = (categories) => {
      if (!categories || categories.length === 0) return [];
      return categories.map(id => {
        const c = (id || '').toLowerCase();
        switch (c) {
          case 'parques':
            return 'parques';
          case 'monumentos':
            return 'patrimonio';
          case 'tiendas':
            return 'centros-comerciales';
          case 'museos':
            return 'museos';
          case 'mercados':
            return 'mercados';
          case 'hoteles':
            return 'hoteles';
          case 'playas':
            return 'playas';
          case 'bares':
            return 'bares';
          case 'discotecas':
            return 'discotecas';
          case 'restaurantes':
            return 'restaurantes';
          default:
            return c; // fallback
        }
      });
    };

    // Normalizador de texto (minúsculas y sin acentos)
    const normalizeText = (str) => {
      return (str || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    // Mapear categorías que vienen del backend/BD al esquema del frontend (ids)
    const mapBackendToFrontendCategory = (categoria) => {
      const c = normalizeText(categoria);
      // Si ya coincide con alguna id conocida, devolverla
      const ids = ['monumentos','parques','restaurantes','hoteles','discotecas','playas','mercados','museos','bares','tiendas','otros'];
      if (ids.includes(c)) return c;

      // Mapeos y sinónimos comunes
      if (['parques','parque','naturaleza'].includes(c)) return 'parques';
      if (['museos','museo'].includes(c)) return 'museos';
      if (['mercados','mercado'].includes(c)) return 'mercados';
      if (['restaurantes','restaurante','comida','gastronomia'].includes(c)) return 'restaurantes';
      if (['bares','bar','vida nocturna','nocturno'].includes(c)) return 'bares';
      if (['tiendas','compras','centro comercial','centros comerciales','centros-comerciales','centro-comercial'].includes(c)) return 'tiendas';
      if (['hoteles','hotel','hostal','alojamiento'].includes(c)) return 'hoteles';
      if (['patrimonio','monumentos','monumento','historia'].includes(c)) return 'monumentos';
      if (['playas','playa'].includes(c)) return 'playas';
      if (['discotecas','discoteca','club'].includes(c)) return 'discotecas';
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
    <div className="h-screen flex bg-gray-100 overflow-hidden relative">
      {/* DEBUG INFO */}
      <div className="bg-yellow-100 p-2 text-xs absolute top-0 left-0 z-50 w-full">
        <strong>DEBUG:</strong> 
        Lugares totales: {lugares.length} | 
        Filtrados: {filteredLugares.length} | 
        MentionedPlaces: {JSON.stringify(mentionedPlaces)} | 
        FilterByMentioned: {filterByMentionedPlaces.toString()}
        <br />
        <strong>Lugares filtrados:</strong> {filteredLugares.map(l => l.nombre).join(', ')}
      </div>
      
      {/* Sidebar */}
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

      {/* Main content - Map */}
      <div className={`flex-1 relative transition-all duration-300 ${isChatOpen ? 'lg:mr-80' : ''}`}>
        <Mapa
          lugares={filteredLugares}
          onLugarClick={handleLugarClick}
          selectedLugar={selectedLugar}
          onMapClick={handleMapClick}
          isAddingMode={isAddingMode}
        />
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
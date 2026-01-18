import React, { useState, useMemo, useEffect } from 'react';
import Mapa from './components/Mapa';
import Sidebar from './components/Sidebar';
import FormularioLugar from './components/FormularioLugar';
import Mia from './components/Mia';
import { useFiltrosAvanzados } from './hooks/useFiltrosAvanzados';
// import { lugares as lugaresLocales } from './data/lugares';
import { globalFilterState } from './utils/globalState';

function App() {
    const [lugares, setLugares] = useState([]);
    const [selectedLugar, setSelectedLugar] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newLugarCoords, setNewLugarCoords] = useState(null);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Estado del chat: 'closed', 'half', 'full'
    const [chatState, setChatState] = useState('closed');
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
                'parques': ['parques', 'parque', 'naturaleza'],
                'museos': ['museos', 'museo'],
                'mercados': ['mercados', 'mercado'],
                'restaurantes': ['restaurantes', 'restaurante', 'comida', 'gastronomia'],
                'bares': ['bares', 'bar', 'vida nocturna', 'nocturno'],
                'tiendas': ['tiendas', 'compras', 'centro comercial', 'centros comerciales', 'centros-comerciales', 'centro-comercial'],
                'hoteles': ['hoteles', 'hotel', 'hostal', 'alojamiento'],
                'monumentos': ['patrimonio', 'monumentos', 'monumento', 'historia'],
                'playas': ['playas', 'playa'],
                'discotecas': ['discotecas', 'discoteca', 'club']
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
                        descripcion: p.descripcion_corta || p.descripcion_completa || p.descripcion || '',
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
                }
            }
        };

        fetchPlaces();

        return () => controller.abort();
    }, [selectedCategories, searchTerm]);

    const handleLugarClick = (lugar) => {
        setSelectedLugar(lugar);
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
        if (selectedLugar && selectedLugar.id === lugarId) {
            setSelectedLugar(null);
        }
    };

    // --- LÓGICA SMART TOGGLE (MUTUAL EXCLUSIVITY) ---
    // 1. Si se abre el Sidebar, minimizamos el Chat
    useEffect(() => {
        if (isSidebarOpen && chatState !== 'closed') {
            setChatState('closed');
        }
    }, [isSidebarOpen]);

    // 2. Si el Chat se expande (full), cerramos el Sidebar
    useEffect(() => {
        if (chatState === 'full' && isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    }, [chatState]);

    const handleToggleChat = () => {
        if (chatState === 'closed') setChatState('half');
        else if (chatState === 'half') setChatState('full');
        else setChatState('closed');
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gray-100 dark:bg-zinc-900">
            <Mapa
                lugares={filteredLugares}
                onLugarClick={handleLugarClick}
                isAddingMode={isAddingMode}
                onMapClick={handleMapClick}
                selectedLugar={selectedLugar}
                onToggleChat={handleToggleChat}
                chatState={chatState}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onSearch={setSearchTerm}
                onCategorySelect={toggleCategory}
                selectedCategories={selectedCategories}
                lugares={filteredLugares}
                onLugarClick={handleLugarClick}
                stats={filterStats}
                currentFilters={{
                    search: searchTerm,
                    categories: selectedCategories,
                    sortBy,
                    sortOrder
                }}
                onClearFilters={clearAllFilters}
                onSortChange={setSortBy}
                onOrderChange={setSortOrder}
            />

            <Mia
                isOpen={chatState !== 'closed'}
                setIsOpen={(open) => setChatState(open ? 'half' : 'closed')}
                chatState={chatState}
                setChatState={setChatState}
                onSetCategory={addCategory}
                onSetSearch={setSearchTerm}
                currentFilters={{
                    search: searchTerm,
                    categories: selectedCategories
                }}
                onClearFilters={clearAllFilters}
                onToggleCategory={toggleCategory}
            />

            {/* Formulario Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <FormularioLugar
                            coords={newLugarCoords}
                            onClose={handleFormClose}
                            onSubmit={handleSubmitLugar}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
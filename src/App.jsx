import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Mapa from '@/components/features/map/Mapa';
import Sidebar from '@/components/layout/Sidebar/UserSidebar';
import SidebarBusiness from '@/components/layout/Sidebar/BusinessSidebar';
import SidebarAdmin from '@/components/layout/Sidebar/AdminSidebar';
import Profile from '@/components/features/profile/Profile';
import FormularioLugar from '@/components/features/places/FormularioLugar';
import ChatBot from '@/components/features/chat/ChatBot';
import { useFiltrosAvanzados } from '@/hooks/useFiltrosAvanzados';

function App() {
    const [lugares, setLugares] = useState([]);
    const [selectedLugar, setSelectedLugar] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newLugarCoords, setNewLugarCoords] = useState(null);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chatState, setChatState] = useState('closed'); // 'closed' | 'half' | 'full'
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [userRole, setUserRole] = useState('user'); // 'user' | 'business' | 'admin'
    const [user, setUser] = useState(null); // { name, email, avatar, role }
    const [showTools, setShowTools] = useState(true); // Controla la visibilidad del selector de roles
    const [mapTheme, setMapTheme] = useState('standard'); // 'standard' | 'satellite' | 'hybrid'
    const [starrySky, setStarrySky] = useState(false); // Toggle para cielo estrellado
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const {
        filteredLugares,
        filterStats,
        searchTerm,
        setSearchTerm,
        selectedCategories,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        clearAllFilters,
        toggleCategory,
        addCategory,
    } = useFiltrosAvanzados(lugares);

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
                        color: undefined
                    };
                });
                setLugares(mapped);
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

    // Smart toggle: cerrar sidebar cuando se abre chat en modo full
    useEffect(() => {
        if (chatState === 'full' && isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    }, [chatState, isSidebarOpen]);

    // Smart toggle: cerrar chat cuando se abre el sidebar
    useEffect(() => {
        if (isSidebarOpen && chatState !== 'closed') {
            setChatState('closed');
            setIsChatOpen(false);
        }
    }, [isSidebarOpen]);

    const handleLugarClick = (lugar) => setSelectedLugar(lugar);
    const handleAddLugar = () => setIsFormOpen(true);
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
    const handleSubmitLugar = (nuevoLugar) => setLugares(prev => [...prev, nuevoLugar]);
    const handleDeleteLugar = (lugarId) => {
        setLugares(prev => prev.filter(lugar => lugar.id !== lugarId));
        if (selectedLugar && selectedLugar.id === lugarId) setSelectedLugar(null);
    };

    // Handler para abrir/cerrar el chatbot
    const handleToggleChat = () => {
        if (chatState === 'closed') {
            setIsChatOpen(true);
            setChatState('half');
        } else {
            setChatState('closed');
            setIsChatOpen(false);
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gray-100 dark:bg-black">
            <Mapa
                lugares={filteredLugares}
                onLugarClick={handleLugarClick}
                isAddingMode={isAddingMode}
                onMapClick={handleMapClick}
                selectedLugar={selectedLugar}
                onToggleChat={handleToggleChat}
                chatState={chatState}
                mapTheme={mapTheme}
                starrySky={starrySky}
            />

            {/* Top Bar Container */}
            <div className="fixed top-6 left-0 right-0 px-6 z-[10000] flex justify-between items-center pointer-events-none">
                {/* Left: Menu Button Container */}
                <div className="w-[52px] pointer-events-auto">
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-3 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 text-gray-700 dark:text-white hover:scale-105 transition-all flex items-center justify-center w-[52px] h-[52px]"
                        >
                            <Menu size={24} />
                        </button>
                    )}
                </div>

                {/* Center: Role Selector Container */}
                <div className="pointer-events-auto">
                    {showTools && (
                        <div className="flex items-center gap-1 bg-white/90 dark:bg-black/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-white/20 h-[52px]">
                            <button
                                onClick={() => setUserRole('user')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${userRole === 'user' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                USER
                            </button>
                            <button
                                onClick={() => setUserRole('business')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${userRole === 'business' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                BUSINESS
                            </button>
                            <button
                                onClick={() => setUserRole('admin')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${userRole === 'admin' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                ADMIN
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Profile Container */}
                <div className="w-[52px] flex justify-end pointer-events-auto">
                    <Profile
                        user={user}
                        setUser={setUser}
                        showTools={showTools}
                        setShowTools={setShowTools}
                        mapTheme={mapTheme}
                        setMapTheme={setMapTheme}
                        starrySky={starrySky}
                        setStarrySky={setStarrySky}
                        darkMode={darkMode}
                        toggleDarkMode={toggleDarkMode}
                    />
                </div>
            </div>

            <Sidebar
                isOpen={isSidebarOpen && userRole === 'user'}
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

            <SidebarBusiness
                isOpen={isSidebarOpen && userRole === 'business'}
                setIsOpen={setIsSidebarOpen}
                lugares={filteredLugares}
                onAddLugar={handleAddLugar}
            />

            <SidebarAdmin
                isOpen={isSidebarOpen && userRole === 'admin'}
                setIsOpen={setIsSidebarOpen}
                lugares={filteredLugares}
                onAddLugar={handleAddLugar}
                onDeleteLugar={handleDeleteLugar}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
            />

            {/* MIA ChatBot Component */}
            <ChatBot
                isOpen={isChatOpen}
                setIsOpen={setIsChatOpen}
                chatState={chatState}
                setChatState={setChatState}
                onSetCategory={addCategory}
                onSetSearch={setSearchTerm}
                currentFilters={{
                    search: searchTerm,
                    categories: selectedCategories,
                    sortBy,
                    sortOrder
                }}
                onClearFilters={clearAllFilters}
                onToggleCategory={toggleCategory}
            />

            <FormularioLugar
                isOpen={isFormOpen}
                initialCoords={newLugarCoords}
                onClose={handleFormClose}
                onSubmit={handleSubmitLugar}
            />
        </div>
    );
}

export default App;
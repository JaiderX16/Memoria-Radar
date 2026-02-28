import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Menu } from 'lucide-react';
import Mapa from '@/components/features/map/Mapa';
import Sidebar from '@/components/features/sidebar/user/UserSidebar';
import SidebarBusiness from '@/components/layout/Sidebar/business/BusinessSidebar';
import SidebarAdmin from '@/components/layout/Sidebar/admin/AdminSidebar';
import Profile from '@/components/features/profile/Profile';
import FormularioLugar from '@/components/features/formulario/FormularioLugar';
import ChatBot from '@/components/features/chat/ChatBot';
import { useFiltrosAvanzados } from '@/hooks/useFiltrosAvanzados';
import { getPlaces, getEvents, createPlace, createEvent } from '@/services/api';


function App() {
    const pageRef = useRef(null);
    const [domCanvas, setDomCanvas] = useState(null);
    const [lugares, setLugares] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [selectedLugar, setSelectedLugar] = useState(null);
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newLugarCoords, setNewLugarCoords] = useState(null);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chatState, setChatState] = useState('closed'); // 'closed' | 'half' | 'full'
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [userRole, setUserRole] = useState('user'); // 'user' | 'business' | 'admin'
    const [user, setUser] = useState(null); // { name, email, avatar, role }
    const [showTools, setShowTools] = useState(false); // Controla la visibilidad del selector de roles
    const [mapTheme, setMapTheme] = useState('standard'); // 'standard' | 'satellite' | 'hybrid'
    const [starrySky, setStarrySky] = useState(true); // Toggle para cielo estrellado
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

        const fetchData = async () => {
            try {
                const [placesData, eventsData] = await Promise.all([
                    getPlaces(Object.fromEntries(params), { signal: controller.signal }),
                    getEvents(Object.fromEntries(params), { signal: controller.signal })
                ]);

                // Ajustar respuesta según estructura del backend si es necesario
                console.log('DEBUG: placesData received:', placesData);
                console.log('DEBUG: eventsData received:', eventsData);

                // Helper to extract array from various possible API response structures
                const extractArray = (data, key) => {
                    if (!data) return [];
                    if (Array.isArray(data)) return data;
                    if (data.data && Array.isArray(data.data)) return data.data;
                    if (data.data && data.data[key] && Array.isArray(data.data[key])) return data.data[key];
                    if (data[key] && Array.isArray(data[key])) return data[key];
                    return [];
                };

                const rawPlaces = extractArray(placesData, 'lugares');
                const rawEvents = extractArray(eventsData, 'eventos');

                // Sanitize and filter places
                const places = rawPlaces.map(p => ({
                    ...p,
                    latitud: parseFloat(p.latitud),
                    longitud: parseFloat(p.longitud)
                })).filter(p => !isNaN(p.latitud) && !isNaN(p.longitud));

                // Sanitize and filter events
                const events = rawEvents.map(e => ({
                    ...e,
                    lat: parseFloat(e.lat || e.latitud), // Handle both naming conventions
                    lng: parseFloat(e.lng || e.longitud)
                })).filter(e => !isNaN(e.lat) && !isNaN(e.lng));

                console.log('DEBUG: Sanitized places:', places);
                console.log('DEBUG: Sanitized events:', events);

                setLugares(places);
                setEventos(events);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLugares([]);
                setEventos([]);
            }
        };

        fetchData();

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

    const handleLugarClick = (lugar) => {
        setSelectedLugar(lugar);
        setSelectedEvento(null); // Limpiar selección de evento
    };

    const handleEventClick = (evento) => {
        setSelectedEvento(evento);
        setSelectedLugar(null); // Limpiar selección de lugar
    };
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
    const handleSubmitLugar = async (nuevoPunto) => {
        try {
            if (nuevoPunto.type === 'evento') {
                const response = await createEvent(nuevoPunto);
                setEventos(prev => [...prev, response.data || response]);
            } else {
                const response = await createPlace(nuevoPunto);
                setLugares(prev => [...prev, response.data || response.data?.lugar || response]);
            }
            setIsFormOpen(false);
            setNewLugarCoords(null);
            setIsAddingMode(false);
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error al guardar. Inténtalo de nuevo.');
        }
    };
    const handleDeleteLugar = (lugarId) => {
        setLugares(prev => prev.filter(lugar => lugar.id !== lugarId));
        if (selectedLugar && selectedLugar.id === lugarId) setSelectedLugar(null);
    };

    // Handler para abrir/cerrar el chatbot
    const handleToggleChat = () => {
        console.log('DEBUG [App]: handleToggleChat - current state:', { chatState, isChatOpen });
        if (chatState === 'closed') {
            setIsChatOpen(true);
            setChatState('half');
        } else {
            setChatState('closed');
            setIsChatOpen(false);
        }
    };

    // Captura el fondo para el efecto Liquid Glass
    useEffect(() => {
        const captureBackground = async () => {
            if (!pageRef.current) return;

            // Esperar a que los elementos (especialmente el mapa) se rendericen
            // MapLibre con preserveDrawingBuffer: true permitirá la captura
            setTimeout(async () => {
                try {
                    console.log("Capturing background for liquid effect...");

                    // Aseguramos el color de fondo basado en el tema
                    const bgColor = darkMode ? '#000000' : '#f3f4f6';

                    const canvas = await html2canvas(pageRef.current, {
                        scale: 1, // Calidad original
                        useCORS: true,
                        backgroundColor: bgColor,
                        scrollY: -window.scrollY,
                        ignoreElements: (element) => {
                            return element.classList.contains('ignore-capture') ||
                                element.hasAttribute('data-html2canvas-ignore');
                        }
                    });
                    setDomCanvas(canvas);
                    console.log("Background captured successfully.");
                } catch (error) {
                    console.error('Error capturing background:', error);
                }
            }, 1500); // 1.5s delay
        };

        captureBackground();

        // Opcional: Recapturar si el tema cambia o tras un tiempo largo
        // window.addEventListener('recapture-liquid', captureBackground);
        // return () => window.removeEventListener('recapture-liquid', captureBackground);
    }, [mapTheme, darkMode]); // Re-captura si el tema cambia

    return (
        <div vaul-drawer-wrapper="" ref={pageRef} className="relative w-full h-[100dvh] overflow-hidden bg-gray-100 dark:bg-black">
            <Mapa
                lugares={filteredLugares}
                eventos={eventos}
                onLugarClick={handleLugarClick}
                onEventClick={handleEventClick}
                isAddingMode={isAddingMode}
                onMapClick={handleMapClick}
                selectedLugar={selectedLugar}
                selectedEvento={selectedEvento}
                onToggleChat={handleToggleChat}
                chatState={chatState}
                mapTheme={mapTheme}
                starrySky={starrySky}
                user={user}
                setUser={setUser}
                showTools={showTools}
                setShowTools={setShowTools}
                setMapTheme={setMapTheme}
                setStarrySky={setStarrySky}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                domCanvas={domCanvas}
                pageRef={pageRef}
            />

            {/* Top Bar Container */}
            <div className="fixed top-6 left-0 right-0 px-6 z-[10] flex justify-between items-center pointer-events-none">
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

                {/* Right: Spacer for symmetry */}
                <div className="w-[52px] pointer-events-none" />
            </div>

            <Sidebar
                isOpen={isSidebarOpen && userRole === 'user'}
                setIsOpen={setIsSidebarOpen}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onCategorySelect={toggleCategory}
                selectedCategories={selectedCategories}
                lugares={filteredLugares}
                eventos={eventos}
                onLugarClick={handleLugarClick}
                onEventClick={handleEventClick}
                selectedLugar={selectedLugar}
                selectedEvento={selectedEvento}
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
import React, { useState } from 'react';
import {
    Map as MapIcon,
    Search,
    Plus,
    Bell,
    Sun,
    Moon,
    X,
    Menu,
    BarChart2,
    Users,
    Briefcase,
    Settings
} from 'lucide-react';
import FormularioLugar from '@/components/features/formulario/FormularioLugar';
import DashboardView from '@/components/dashboards/DashboardView';
import MapView from '@/components/dashboards/MapView';
import UsersView from '@/components/dashboards/UsersView';
import BusinessesView from '@/components/dashboards/BusinessesView';
import SettingsView from '@/components/dashboards/SettingsView';
import BusinessModal from '@/components/dashboards/BusinessModal';

const SidebarAdmin = ({ lugares, onAddLugar, onDeleteLugar, setIsOpen, isOpen, darkMode, toggleDarkMode }) => {
    // --- Estados de UI ---
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [modalType, setModalType] = useState(null); // 'add_place', 'edit_place', 'add_business', 'edit_business'
    const [formData, setFormData] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(null); // ID del usuario con menú abierto

    // --- Datos Simulados ---
    const [places, setPlaces] = useState([
        {
            id: 1,
            name: 'Café La Paz',
            description: 'Un refugio tranquilo en medio de la ciudad.',
            address: 'Av. La Paz 123, Miraflores',
            type: 'Cafetería',
            status: 'verified',
            lat: 30,
            lng: 20,
            rating: 4.8,
            ai_score: 98,
            tags: ['wifi', 'silencioso'],
            visits: 1200,
            image: null,
            website: 'www.cafelapaz.pe',
            hours: '08:00 - 22:00'
        },
        {
            id: 2,
            name: 'Parque Kennedy',
            description: 'El corazón de Miraflores.',
            address: 'Diagonal, Miraflores',
            type: 'Parque',
            status: 'verified',
            lat: 50,
            lng: 60,
            rating: 4.5,
            ai_score: 92,
            tags: ['aire libre', 'gatos'],
            visits: 5400,
            image: null,
            website: '',
            hours: '24h'
        },
        { id: 3, name: 'Co-Work Miraflores', description: 'Espacio de trabajo.', address: 'Calle Alcanfores 450', type: 'Trabajo', status: 'pending', lat: 35, lng: 25, rating: 0, ai_score: 45, tags: ['oficina'], visits: 0, hours: '09:00 - 18:00' },
    ]);

    const [users, setUsers] = useState([
        { id: 101, name: 'Carlos Gomez', email: 'carlos@mail.com', role: 'Explorer', status: 'active', joined: '2023-10-12' },
        { id: 102, name: 'Ana Ruiz', email: 'ana@design.com', role: 'Creator', status: 'active', joined: '2023-11-05' },
        { id: 103, name: 'Bot Account', email: 'bot@spam.com', role: 'User', status: 'banned', joined: '2024-01-20' },
    ]);

    const [businesses, setBusinesses] = useState([
        { id: 201, name: 'Grupo Gastronómico', plan: 'Premium', verified: true, locations: 5, owner: 'Juan Perez', nextBilling: '12 Oct 2024' },
        { id: 202, name: 'StartUp Coffee', plan: 'Free', verified: false, locations: 1, owner: 'Maria Lima', nextBilling: 'N/A' },
    ]);

    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Nuevo lugar pendiente de revisión: "Plaza Central"', time: 'Hace 5 min', unread: true },
        { id: 2, text: 'Reporte de usuario #103 completado', time: 'Hace 1 hora', unread: false },
        { id: 3, text: 'Pago recibido: Grupo Gastronómico', time: 'Hace 3 horas', unread: false },
    ]);

    // --- Helpers de Filtrado ---
    const getFilteredPlaces = () => {
        let result = filterCategory === 'all' ? places : places.filter(p => p.status === filterCategory);
        if (searchQuery) {
            result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return result;
    };

    const getFilteredUsers = () => {
        if (!searchQuery) return users;
        return users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    const getFilteredBusinesses = () => {
        if (!searchQuery) return businesses;
        return businesses.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.owner.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    // --- Handlers de Acciones ---

    const handlePlaceSubmit = (nuevoLugar) => {
        // Mapear de vuelta al formato de Admin si es necesario
        const mappedLugar = {
            ...nuevoLugar,
            name: nuevoLugar.nombre,
            description: nuevoLugar.descripcion,
            type: nuevoLugar.categoria,
            lat: nuevoLugar.latitud,
            lng: nuevoLugar.longitud,
            image: nuevoLugar.imagen
        };

        if (modalType === 'add_place') {
            setPlaces([...places, { ...mappedLugar, status: 'pending', ai_score: 50, visits: 0 }]);
        } else {
            setPlaces(places.map(p => p.id === mappedLugar.id ? { ...p, ...mappedLugar } : p));
            if (selectedPlace?.id === mappedLugar.id) setSelectedPlace({ ...selectedPlace, ...mappedLugar });
        }
        setModalType(null);
        setFormData({});
    };

    const handleSave = (e, submittedData) => {
        // Lógica para Negocios
        if (modalType.includes('business')) {
            const processedBiz = {
                ...submittedData,
                locations: parseInt(submittedData.locations) || 0,
                verified: submittedData.verified === 'true' || submittedData.verified === true
            };

            if (modalType === 'add_business') {
                setBusinesses([...businesses, { id: Date.now(), ...processedBiz, nextBilling: 'N/A' }]);
            } else {
                setBusinesses(businesses.map(b => b.id === submittedData.id ? { ...b, ...processedBiz } : b));
            }
        }

        setModalType(null);
        setFormData({});
    };

    const deleteItem = (type, id) => {
        if (confirm('¿Estás seguro de eliminar este elemento?')) {
            if (type === 'place') {
                setPlaces(places.filter(p => p.id !== id));
                if (selectedPlace?.id === id) setSelectedPlace(null);
            } else if (type === 'business') {
                setBusinesses(businesses.filter(b => b.id !== id));
            } else if (type === 'user') {
                setUsers(users.filter(u => u.id !== id));
            }
        }
    };

    const handleExportCSV = () => {
        alert("Generando archivo users_export_2024.csv...\nLa descarga comenzará en breve.");
    };

    const toggleUserStatus = (userId) => {
        setUsers(users.map(u => {
            if (u.id === userId) {
                return { ...u, status: u.status === 'active' ? 'banned' : 'active' };
            }
            return u;
        }));
        setUserMenuOpen(null);
    };

    // --- Vistas ---
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView
                    users={users}
                    places={places}
                    businesses={businesses}
                    notifications={notifications}
                    darkMode={darkMode}
                />;
            case 'users':
                return <UsersView
                    filteredUsers={getFilteredUsers()}
                    handleExportCSV={handleExportCSV}
                    searchQuery={searchQuery}
                    userMenuOpen={userMenuOpen}
                    setUserMenuOpen={setUserMenuOpen}
                    toggleUserStatus={toggleUserStatus}
                    deleteItem={deleteItem}
                />;
            case 'businesses':
                return <BusinessesView
                    filteredBusinesses={getFilteredBusinesses()}
                    setActiveView={setActiveView}
                    setModalType={setModalType}
                    setFormData={setFormData}
                    deleteItem={deleteItem}
                />;
            case 'map_overview':
                return <MapView
                    filteredPlaces={getFilteredPlaces()}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    selectedPlace={selectedPlace}
                    setSelectedPlace={setSelectedPlace}
                    setModalType={setModalType}
                    setFormData={setFormData}
                    deleteItem={deleteItem}
                    darkMode={darkMode}
                />;
            case 'settings':
                return <SettingsView />;
            default: return <div className="p-8 text-center text-slate-500">Vista no encontrada</div>;
        }
    };

    // Clases para sidebar de ADMIN (pantalla completa, estilo SidebarBusiness)
    const adminSidebarClasses = `
    absolute z-[20000] overflow-hidden will-change-transform
    transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]
    top-4 left-4 bottom-4 right-4
    flex flex-col rounded-3xl border
    bg-white dark:bg-zinc-950 backdrop-blur-xl border-slate-200 dark:border-zinc-800
    shadow-[0_8px_32px_rgba(0,0,0,0.2)]
    ${!isOpen ? '-translate-x-[105%] opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
  `;

    return (
        <div className={adminSidebarClasses}>
            <div className={`flex h-full font-sans overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`} onClick={() => { setShowNotifications(false); }}>

                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
                )}

                <aside className={`fixed inset-y-0 left-0 z-50 w-24 lg:w-72 flex flex-col transition-transform duration-500 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-100'} border-r`}>
                    <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8">
                        <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-black text-xl shrink-0 shadow-lg shadow-slate-900/20 dark:shadow-white/20">S</div>
                        <span className="ml-4 font-bold text-xl tracking-tight hidden lg:block">SPOT<span className="text-slate-400 dark:text-zinc-600">.io</span></span>
                    </div>

                    <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto scrollbar-hide">
                        <NavItem icon={BarChart2} label="Dashboard" active={activeView === 'dashboard'} onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} darkMode={darkMode} />
                        <NavItem icon={MapIcon} label="Mapa Maestro" active={activeView === 'map_overview'} onClick={() => { setActiveView('map_overview'); setIsSidebarOpen(false); }} darkMode={darkMode} />
                        <NavItem icon={Users} label="Usuarios" active={activeView === 'users'} onClick={() => { setActiveView('users'); setIsSidebarOpen(false); }} darkMode={darkMode} />
                        <NavItem icon={Briefcase} label="Negocios" active={activeView === 'businesses'} onClick={() => { setActiveView('businesses'); setIsSidebarOpen(false); }} darkMode={darkMode} />
                    </nav>

                    <div className="p-4 flex flex-col gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className={`w-full p-4 rounded-2xl flex items-center justify-center lg:justify-start gap-3 transition-colors ${darkMode ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >
                            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
                            <span className="hidden lg:block text-sm font-bold text-slate-700 dark:text-slate-300">
                                {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                            </span>
                        </button>

                        <div className="hidden lg:flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">JD</div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold truncate">Jorge Dev</p>
                                <p className="text-xs text-slate-400 truncate">Admin</p>
                            </div>
                            <button onClick={() => setActiveView('settings')} className="ml-auto text-slate-400 hover:text-slate-900 dark:hover:text-white"><Settings size={18} /></button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0 h-full relative">
                    <header className="h-24 flex items-center justify-between px-6 lg:px-10 shrink-0 z-20 transition-colors duration-500">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-2xl transition-colors">
                                <Menu size={24} />
                            </button>
                            <h1 className="text-2xl font-bold hidden md:block capitalize tracking-tight">{activeView.replace('_', ' ')}</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`hidden md:flex items-center gap-3 px-5 py-3 rounded-full transition-all w-80 ${darkMode ? 'bg-zinc-900 focus-within:bg-zinc-800' : 'bg-white shadow-sm border border-slate-100 focus-within:shadow-md'}`}>
                                <Search size={20} className="text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-slate-400 dark:text-white"
                                />
                                {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} className="text-slate-400" /></button>}
                            </div>

                            {/* Global Actions Contextual */}
                            {activeView === 'map_overview' && (
                                <button
                                    onClick={() => { setModalType('add_place'); setFormData({}); }}
                                    className="flex items-center justify-center w-12 h-12 md:w-auto md:px-6 md:py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full md:rounded-2xl font-bold shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform"
                                >
                                    <Plus size={20} />
                                    <span className="hidden md:inline md:ml-2">Nuevo</span>
                                </button>
                            )}

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }}
                                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors relative"
                                >
                                    <Bell size={20} className="text-slate-600 dark:text-slate-300" />
                                    {notifications.some(n => n.unread) && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-black rounded-full"></span>}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 top-16 w-80 bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-slate-100 dark:border-zinc-800 z-50 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                                        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                                            <h4 className="font-bold text-slate-900 dark:text-white">Notificaciones</h4>
                                            <button className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">Marcar leídas</button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto scrollbar-hide">
                                            {notifications.map(n => (
                                                <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors ${n.unread ? 'bg-slate-50/50 dark:bg-zinc-800/20' : ''}`}>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.text}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Close Button for the Main Sidebar Panel */}
                            <button
                                onClick={() => setIsOpen && setIsOpen(false)}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <X size={20} className="text-slate-600 dark:text-slate-300" />
                            </button>

                        </div>
                    </header>

                    <div className={`flex-1 overflow-hidden relative rounded-tl-[2.5rem] shadow-inner transition-colors duration-500 ${darkMode ? 'bg-black shadow-zinc-900/50' : 'bg-slate-100 shadow-slate-200/50'}`}>
                        <div className="absolute inset-0 overflow-hidden">
                            {renderContent()}
                        </div>
                    </div>
                </main>

                {/* FormularioLugar para ADMIN */}
                <FormularioLugar
                    isOpen={modalType === 'add_place' || modalType === 'edit_place'}
                    onClose={() => setModalType(null)}
                    onSubmit={handlePlaceSubmit}
                    initialData={modalType === 'edit_place' ? {
                        ...formData,
                        nombre: formData.name,
                        descripcion: formData.description,
                        categoria: formData.type,
                        latitud: formData.lat,
                        longitud: formData.lng,
                        imagen: formData.image
                    } : null}
                />

                {/* --- MODAL UNIVERSAL INTELIGENTE (Solo para Negocios ahora) --- */}
                {modalType && modalType.includes('business') && (
                    <BusinessModal
                        isOpen={true}
                        onClose={() => setModalType(null)}
                        onSubmit={handleSave}
                        initialData={formData}
                        modalType={modalType}
                    />
                )}
            </div>
        </div>
    );
};

// Componentes Auxiliares (Sin cambios mayores, solo props pasadas)
const NavItem = ({ icon: Icon, label, active, onClick, darkMode }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-4 rounded-[1.2rem] transition-all duration-300 group ${active
            ? darkMode ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
            : darkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
    >
        <Icon size={22} className={active ? '' : 'group-hover:scale-110 transition-transform'} />
        <span className="text-sm font-bold hidden lg:block">{label}</span>
    </button>
);

export default SidebarAdmin;

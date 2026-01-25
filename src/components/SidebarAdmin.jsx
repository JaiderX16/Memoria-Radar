import React, { useState, useEffect } from 'react';
import {
    Map as MapIcon,
    Navigation,
    MapPin,
    Search,
    Plus,
    Filter,
    CheckCircle,
    AlertTriangle,
    BrainCircuit,
    Database,
    Layers,
    Settings,
    X,
    Edit3,
    Menu,
    BarChart2,
    Users,
    Briefcase,
    Trash2,
    Save,
    MoreHorizontal,
    TrendingUp,
    Activity,
    Shield,
    Bell,
    Sun,
    Moon,
    Smartphone,
    UploadCloud,
    Clock,
    Globe,
    AlignLeft,
    ImageIcon,
    CreditCard,
    LayoutGrid,
    Download,
    LogOut,
    UserCheck,
    Ban
} from 'lucide-react';
import FormularioLugar from './FormularioLugar';

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

    const handleSave = (e) => {
        e.preventDefault();

        // Lógica para Negocios
        if (modalType.includes('business')) {
            const processedBiz = {
                ...formData,
                locations: parseInt(formData.locations) || 0,
                verified: formData.verified === 'true' || formData.verified === true
            };

            if (modalType === 'add_business') {
                setBusinesses([...businesses, { id: Date.now(), ...processedBiz, nextBilling: 'N/A' }]);
            } else {
                setBusinesses(businesses.map(b => b.id === formData.id ? { ...b, ...processedBiz } : b));
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

    const DashboardView = () => (
        <div className="p-4 md:p-8 space-y-8 overflow-y-auto h-full animate-in fade-in duration-700 scrollbar-hide">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analíticas</h2>
                <p className="text-slate-500 dark:text-slate-400">Resumen de actividad en tiempo real</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Usuarios Activos" value={users.length * 154} icon={Users} trend="+12%" darkMode={darkMode} />
                <StatCard label="Lugares Verificados" value={places.filter(p => p.status === 'verified').length} icon={MapPin} trend="+5%" darkMode={darkMode} />
                <StatCard label="Consultas IA" value="45.2k" icon={BrainCircuit} trend="+24%" darkMode={darkMode} />
                <StatCard label="Negocios" value={businesses.length} icon={Briefcase} trend="+2" darkMode={darkMode} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-sm hover:shadow-lg transition-shadow duration-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <TrendingUp size={120} className="text-black dark:text-white" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6">Tráfico de Visitas</h3>
                        <div className="flex items-end justify-between h-64 gap-3 pt-4">
                            {[45, 67, 32, 80, 50, 90, 75].map((h, i) => (
                                <div key={i} className="w-full flex flex-col justify-end group/bar cursor-pointer">
                                    <div
                                        className="bg-slate-200 dark:bg-zinc-800 rounded-full relative overflow-hidden transition-all duration-500 group-hover/bar:bg-black dark:group-hover/bar:bg-white"
                                        style={{ height: `${h}%` }}
                                    >
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-sm hover:shadow-lg transition-shadow duration-500">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6">Actividad Reciente</h3>
                    <div className="space-y-6">
                        {notifications.map((notif, i) => (
                            <div key={i} className="flex gap-4 items-center group cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 p-2 rounded-xl transition-colors">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                                    <Activity size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{notif.text}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{notif.time}</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-3 mt-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Ver todo el historial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const MapView = () => (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden animate-in fade-in duration-500">
            <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 z-20 flex justify-center md:justify-end pointer-events-none">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-1.5 rounded-full shadow-lg border border-white/20 flex gap-1 pointer-events-auto">
                    {['all', 'verified', 'pending'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${filterCategory === cat
                                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md transform scale-105'
                                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800'
                                }`}
                        >
                            {cat === 'all' ? 'Todos' : cat === 'verified' ? 'Verificados' : 'Pendientes'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 relative flex overflow-hidden">
                <div className="flex-1 bg-slate-200 dark:bg-zinc-800 relative overflow-hidden group transition-colors duration-500">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(${darkMode ? '#fff' : '#000'} 1px, transparent 1px)`, backgroundSize: '24px 24px' }}></div>

                    {getFilteredPlaces().map((place) => (
                        <div
                            key={place.id}
                            onClick={() => setSelectedPlace(place)}
                            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-300 z-10 hover:z-30 group/marker"
                            style={{ top: `${place.lat}%`, left: `${place.lng}%` }}
                        >
                            {place.status !== 'verified' && (
                                <div className="absolute inset-0 rounded-full bg-slate-900/30 dark:bg-white/30 animate-ping"></div>
                            )}
                            <div className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-xl transition-all duration-300 backdrop-blur-sm border-4 ${darkMode ? 'border-zinc-800' : 'border-white'
                                } ${place.status === 'verified' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' :
                                    'bg-slate-200 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'
                                }`}>
                                <MapPin size={20} className="fill-current" />
                            </div>
                        </div>
                    ))}

                    <div className="absolute bottom-8 left-8 z-10 flex flex-col gap-3">
                        <button className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center text-slate-700 dark:text-slate-200"><Layers size={20} /></button>
                        <button className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center text-slate-700 dark:text-slate-200"><Navigation size={20} /></button>
                    </div>
                </div>

                {selectedPlace && (
                    <div className="absolute top-4 right-4 bottom-4 w-full md:w-96 bg-white/80 dark:bg-black/80 backdrop-blur-2xl shadow-2xl z-40 rounded-[2.5rem] p-6 flex flex-col animate-in slide-in-from-right duration-500 border border-white/20">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden relative">
                                <MapIcon size={28} className="text-slate-900 dark:text-white" />
                            </div>
                            <button onClick={() => setSelectedPlace(null)} className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"><X size={18} className="text-slate-600 dark:text-slate-300" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar scrollbar-hide">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 leading-tight">{selectedPlace.name}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">{selectedPlace.type}</p>

                            <div className="space-y-6">
                                {/* ... (Detalles del lugar existentes) ... */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => { setModalType('edit_place'); setFormData(selectedPlace); }}
                                        className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => deleteItem('place', selectedPlace.id)}
                                        className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-2xl hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const UsersTableView = () => (
        <div className="p-4 md:p-8 overflow-y-auto h-full animate-in fade-in duration-500 scrollbar-hide" onClick={() => setUserMenuOpen(null)}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Usuarios</h2>
                    {searchQuery && <p className="text-sm text-slate-500">Resultados para "{searchQuery}"</p>}
                </div>
                <button onClick={handleExportCSV} className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                    <Download size={18} /> Exportar CSV
                </button>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="p-6 font-bold">Usuario</th>
                                <th className="p-6 font-bold">Rol</th>
                                <th className="p-6 font-bold">Estado</th>
                                <th className="p-6 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {getFilteredUsers().length > 0 ? getFilteredUsers().map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-6">
                                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                                        <div className="text-slate-400 text-xs">{user.email}</div>
                                    </td>
                                    <td className="p-6 text-slate-600 dark:text-slate-300">{user.role}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {user.status === 'active' ? 'Activo' : 'Suspendido'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setUserMenuOpen(userMenuOpen === user.id ? null : user.id); }}
                                            className="text-slate-300 hover:text-slate-900 dark:text-zinc-600 dark:hover:text-white transition-colors"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>
                                        {/* User Context Menu */}
                                        {userMenuOpen === user.id && (
                                            <div className="absolute right-8 top-12 w-40 bg-white dark:bg-zinc-800 shadow-xl rounded-xl border border-slate-100 dark:border-zinc-700 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                                                <button onClick={() => toggleUserStatus(user.id)} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                                                    {user.status === 'active' ? <Ban size={14} /> : <UserCheck size={14} />}
                                                    {user.status === 'active' ? 'Suspender' : 'Activar'}
                                                </button>
                                                <button onClick={() => deleteItem('user', user.id)} className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No se encontraron usuarios.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const BusinessesView = () => (
        <div className="p-4 md:p-8 overflow-y-auto h-full animate-in fade-in duration-500 scrollbar-hide">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Negocios</h2>
                    <p className="text-slate-500 dark:text-slate-400">Gestión de partners y planes corporativos</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setActiveView('settings')}
                        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 flex-1 md:flex-none justify-center"
                    >
                        <Settings size={18} /> Configuración
                    </button>
                    <button
                        onClick={() => { setModalType('add_business'); setFormData({}); }}
                        className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 flex-1 md:flex-none justify-center"
                    >
                        <Plus size={18} /> Nuevo Partner
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredBusinesses().map(biz => (
                    <div key={biz.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-zinc-800 hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-50 dark:bg-zinc-800 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl font-black text-slate-900 dark:text-white shadow-inner">
                                    {biz.name.charAt(0)}
                                </div>
                                <button
                                    onClick={() => { setModalType('edit_business'); setFormData(biz); }}
                                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    <Settings size={20} />
                                </button>
                            </div>

                            <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1 truncate">{biz.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-1">
                                <MapPin size={12} /> {biz.locations} ubicaciones activas
                            </p>

                            <div className="space-y-4 bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/50">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Plan</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${biz.plan === 'Premium' || biz.plan === 'Enterprise' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-slate-300'
                                        }`}>{biz.plan}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Dueño</span>
                                    <span className="text-slate-900 dark:text-white font-bold text-xs">{biz.owner}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => { setModalType('edit_business'); setFormData(biz); }}
                                    className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform shadow-md"
                                >
                                    Gestionar
                                </button>
                                <button
                                    onClick={() => deleteItem('business', biz.id)}
                                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => { setModalType('add_business'); setFormData({}); }}
                    className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:border-slate-400 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all group min-h-[300px]"
                >
                    <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={32} className="text-slate-400 dark:text-zinc-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Registrar Nuevo Negocio</h3>
                </button>
            </div>
        </div>
    );

    const SettingsView = () => (
        <div className="p-8 h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <div className="bg-slate-100 dark:bg-zinc-900 p-8 rounded-3xl mb-6 shadow-inner">
                <Settings size={64} className="text-slate-300 dark:text-zinc-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configuración</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-8">
                Personaliza tu experiencia en SPOT Manager.
            </p>
            <div className="flex gap-4">
                <button onClick={() => alert("Abriendo documentación externa...")} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-105 transition-transform">
                    Documentación
                </button>
                <button onClick={() => alert("Contactando soporte...")} className="px-6 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                    Soporte
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'users': return <UsersTableView />;
            case 'businesses': return <BusinessesView />;
            case 'map_overview': return <MapView />;
            case 'settings': return <SettingsView />;
            default: return <div className="p-8 text-center text-slate-500">Vista no encontrada</div>;
        }
    };

    // Clases para sidebar de ADMIN (pantalla completa, estilo SidebarBusiness)
    const adminSidebarClasses = `
    absolute z-[1200] overflow-hidden will-change-transform
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
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">

                            {/* Header Modal */}
                            <div className="relative px-8 py-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 bg-gradient-to-b from-slate-50 dark:from-white/5 to-transparent sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-900 dark:bg-white/10 p-2.5 rounded-xl">
                                        <Briefcase size={20} className="text-white dark:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                                            Gestión de Negocios
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {modalType.includes('add') ? 'Creando nuevo registro' : 'Editando registro existente'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setModalType(null)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors border border-slate-200 dark:border-white/5">
                                    <X size={18} className="text-slate-500 dark:text-slate-300" />
                                </button>
                            </div>

                            {/* Form Body */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar scrollbar-hide">
                                <form id="genericForm" onSubmit={handleSave} className="space-y-8">
                                    {/* CAMPOS PARA NEGOCIOS */}
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Datos de la Empresa</h4>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Nombre Comercial</label>
                                                <input required type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 focus:bg-white dark:focus:bg-transparent focus:ring-4 focus:ring-slate-900/10 dark:focus:ring-white/5 transition-all outline-none font-medium dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
                                                    placeholder="Ej: Mi Empresa S.A."
                                                    value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Dueño / Contacto</label>
                                                <input required type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 focus:bg-white dark:focus:bg-transparent focus:ring-4 focus:ring-slate-900/10 dark:focus:ring-white/5 transition-all outline-none font-medium dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
                                                    placeholder="Nombre del responsable"
                                                    value={formData.owner || ''} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Plan & Facturación</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Plan Contratado</label>
                                                    <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-slate-900/10 dark:focus:ring-white/5 outline-none font-medium appearance-none dark:text-white cursor-pointer"
                                                        value={formData.plan || 'Free'} onChange={(e) => setFormData({ ...formData, plan: e.target.value })}>
                                                        <option value="Free" className="dark:bg-zinc-900">Free</option>
                                                        <option value="Premium" className="dark:bg-zinc-900">Premium</option>
                                                        <option value="Enterprise" className="dark:bg-zinc-900">Enterprise</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Sedes Activas</label>
                                                    <input type="number" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-slate-900/10 dark:focus:ring-white/5 outline-none font-medium dark:text-white"
                                                        value={formData.locations || 0} onChange={(e) => setFormData({ ...formData, locations: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                                                <input type="checkbox" checked={formData.verified || false} onChange={(e) => setFormData({ ...formData, verified: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Cuenta Verificada</span>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer Modal */}
                            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky bottom-0 z-10">
                                <button onClick={() => document.getElementById('genericForm').requestSubmit()} className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold hover:scale-[1.01] transition-transform flex justify-center items-center gap-2 shadow-xl shadow-slate-900/20 dark:shadow-white/10">
                                    <Save size={20} /> Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
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

const StatCard = ({ label, value, icon: Icon, trend, darkMode }) => (
    <div className={`relative p-6 rounded-[2rem] transition-all duration-500 group overflow-hidden ${darkMode
        ? 'bg-zinc-900 hover:bg-zinc-800'
        : 'bg-white hover:bg-slate-50 shadow-sm hover:shadow-md'
        }`}>
        <div className={`absolute -right-6 -bottom-6 opacity-[0.05] dark:opacity-[0.1] transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-12`}>
            <Icon size={140} className={darkMode ? 'text-white' : 'text-black'} />
        </div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                    <Icon size={24} />
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${darkMode ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                    {trend}
                </span>
            </div>
            <h3 className={`text-3xl font-black tracking-tight mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
            <p className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{label}</p>
        </div>
    </div>
);

export default SidebarAdmin;

import React, { useState } from 'react';
import {
    MapPin, Navigation, Star, TrendingUp, Plus, BarChart3, X, Globe, Settings, Trash2
} from 'lucide-react';
import FormularioLugar from './FormularioLugar';

const SidebarBusiness = ({ lugares, onAddLugar, setIsOpen, isOpen }) => {
    const [activePanel, setActivePanel] = useState(null);
    const [myPlaces, setMyPlaces] = useState(lugares.slice(0, 3));
    const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);

    const stats = [
        { label: "Mis Lugares", value: myPlaces.length || 0, icon: <MapPin size={20} />, color: "bg-purple-500" },
        { label: "Vistas Totales", value: "2.4K", icon: <TrendingUp size={20} />, color: "bg-blue-500" },
        { label: "Reseñas", value: 48, icon: <Star size={20} />, color: "bg-yellow-500" },
        { label: "Clicks", value: 156, icon: <Navigation size={20} />, color: "bg-green-500" },
    ];

    // CRUD Operations
    const handleCreateLocation = () => {
        setEditingLocation(null);
        setIsLocationFormOpen(true);
    };

    const handleEditLocation = (location) => {
        // Mapear al formato que espera FormularioLugar
        setEditingLocation({
            ...location,
            nombre: location.nombre,
            descripcion: location.descripcion,
            categoria: location.categoria,
            latitud: location.latitud || 0,
            longitud: location.longitud || 0,
            imagen: location.imagen
        });
        setIsLocationFormOpen(true);
    };

    const handleDeleteLocation = (locationId) => {
        if (window.confirm('¿Estás seguro de eliminar esta ubicación?')) {
            setMyPlaces(myPlaces.filter(l => l.id !== locationId));
        }
    };

    const handleSaveLocation = (nuevoLugar) => {
        if (editingLocation) {
            setMyPlaces(myPlaces.map(l => l.id === editingLocation.id ? { ...l, ...nuevoLugar } : l));
        } else {
            setMyPlaces([...myPlaces, { ...nuevoLugar, id: Date.now() }]);
        }
        setIsLocationFormOpen(false);
        setEditingLocation(null);
    };

    // Clases para sidebar de BUSINESS (pantalla completa)
    const businessSidebarClasses = `
    absolute z-[20000] overflow-hidden will-change-transform
    transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]
    top-4 left-4 bottom-4 right-4
    flex flex-col rounded-3xl border
    bg-zinc-900/95 backdrop-blur-xl border-purple-500/20
    shadow-[0_8px_32px_rgba(139,92,246,0.2)]
    ${!isOpen ? '-translate-x-[105%] opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
  `;

    if (activePanel === 'analytics') {
        return (
            <div className={businessSidebarClasses}>
                <div className="flex flex-col h-full">
                    <div className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setActivePanel(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all">
                                <X size={20} />
                            </button>
                            <h1 className="text-xl font-bold text-white">Analíticas de Mi Negocio</h1>
                        </div>
                    </div>
                    <div className="p-6 flex-grow overflow-y-auto scrollbar-hide">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3 text-white`}>
                                        {stat.icon}
                                    </div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-zinc-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <h3 className="font-bold text-white mb-4">Vistas por Semana</h3>
                            <div className="flex items-end gap-2 h-32">
                                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-zinc-500">
                                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={businessSidebarClasses}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-500/20 rounded-xl">
                                <Globe className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Mi Negocio</h1>
                                <p className="text-sm text-zinc-500">Gestiona tus ubicaciones</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen && setIsOpen(false)}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 flex-grow overflow-y-auto scrollbar-hide">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:border-white/10 transition-all" onClick={() => setActivePanel('analytics')}>
                                <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center mb-2 text-white`}>
                                    {stat.icon}
                                </div>
                                <p className="text-xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-zinc-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Acciones</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleCreateLocation} className="p-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-3 transition-all">
                                <Plus size={20} />
                                <span>Agregar Ubicación</span>
                            </button>
                            <button onClick={() => setActivePanel('analytics')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center gap-3 transition-all border border-white/5">
                                <BarChart3 size={20} />
                                <span>Ver Analíticas</span>
                            </button>
                        </div>
                    </div>

                    {/* FormularioLugar para BUSINESS */}
                    <FormularioLugar
                        isOpen={isLocationFormOpen}
                        onClose={() => { setIsLocationFormOpen(false); setEditingLocation(null); }}
                        onSubmit={handleSaveLocation}
                        initialData={editingLocation}
                    />

                    {/* My Places */}
                    <div>
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Mis Ubicaciones</h2>
                        <div className="space-y-2">
                            {myPlaces.map((lugar) => (
                                <div key={lugar.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                                        {lugar.imagen ? (
                                            <img src={lugar.imagen} className="w-full h-full object-cover" alt={lugar.nombre} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><MapPin className="text-zinc-600" size={20} /></div>
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-semibold text-white truncate">{lugar.nombre}</h3>
                                        <p className="text-xs text-zinc-500">{lugar.categoria || 'Sin categoría'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold">Activo</span>
                                        <button
                                            onClick={() => handleEditLocation(lugar)}
                                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all"
                                            title="Editar"
                                        >
                                            <Settings size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLocation(lugar.id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {myPlaces.length === 0 && (
                            <div className="text-center py-8">
                                <MapPin className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-500">No tienes ubicaciones todavía</p>
                                <button onClick={handleCreateLocation} className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all">
                                    Agregar Primera Ubicación
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarBusiness;

import React, { useState } from 'react';
import {
  Search, X, Star, MapPin, Navigation, Phone,
  Globe, MoreHorizontal, Menu, Plus, Trash2,
  Ticket, Clock, BarChart3, Users, TrendingUp, Settings, Database
} from 'lucide-react';

// DATOS DE PRUEBA
const MOCK_PLACES = [
  { id: 1, nombre: "Café Central", rating: 4.8, categoria: "Cafetería", descripcion: "Café acogedor con especialidad en espresso", imagen: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400&auto=format&fit=crop", horario: "Lun-Dom: 7:00 - 22:00" },
  { id: 2, nombre: "Grand Vista Hotel", rating: 4.5, categoria: "Hotel", descripcion: "Hotel boutique con vistas panorámicas", imagen: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop", horario: "24 horas" },
  { id: 3, nombre: "Parque del Retiro", rating: 4.9, categoria: "Parque", descripcion: "Hermoso parque público con jardines", imagen: "https://images.unsplash.com/photo-1576082869502-d7b38df3743e?q=80&w=400&auto=format&fit=crop", horario: "6:00 - 22:00" },
  { id: 4, nombre: "Restaurante La Plaza", rating: 4.7, categoria: "Restaurante", descripcion: "Cocina tradicional con ingredientes frescos", imagen: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop", horario: "12:00 - 23:00" },
  { id: 5, nombre: "Museo de Arte", rating: 4.6, categoria: "Museo", descripcion: "Colección de arte contemporáneo y clásico", imagen: "https://images.unsplash.com/photo-1566127444979-b2e871d3bef8?q=80&w=400&auto=format&fit=crop", horario: "Mar-Dom: 10:00 - 19:00" }
];

const EVENTOS_DESTACADOS = [
  { id: 101, title: "Noche de Jazz", date: "Hoy, 20:00", location: "Café Central", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=300&auto=format&fit=crop" },
  { id: 102, title: "Feria de Diseño", date: "Mañana", location: "Matadero", image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=300&auto=format&fit=crop" },
  { id: 103, title: "Ruta de Tapas", date: "Sáb, 13:00", location: "Centro", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto=format&fit=crop" },
  { id: 104, title: "Cine de Verano", date: "Dom, 21:00", location: "Parque Retiro", image: "https://images.unsplash.com/photo-1517604931442-710e8b6b0606?q=80&w=300&auto=format&fit=crop" }
];

const RatingBadge = ({ rating }) => (
  <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md self-start">
    <Star size={12} className="fill-yellow-500 text-yellow-500" />
    <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{rating || 4.5}</span>
  </div>
);

const ActionButton = ({ icon, label, primary }) => (
  <button className={`flex flex-col items-center justify-center gap-2 w-full py-3 rounded-xl transition-all duration-200 ${primary ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700' : 'bg-gray-50 dark:bg-white/5 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// --- SKELETON SCREEN COMPONENT ---
const SkeletonScreen = () => (
  <div className="absolute inset-0 p-6 animate-pulse">
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 bg-white/10 rounded-2xl"></div>
      <div className="flex-1">
        <div className="h-6 bg-white/10 rounded-lg w-48 mb-2"></div>
        <div className="h-4 bg-white/5 rounded-lg w-32"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-2xl bg-white/5">
          <div className="w-10 h-10 bg-white/10 rounded-xl mb-3"></div>
          <div className="h-6 bg-white/10 rounded-lg w-16 mb-2"></div>
          <div className="h-3 bg-white/5 rounded-lg w-20"></div>
        </div>
      ))}
    </div>
    <div className="h-4 bg-white/5 rounded-lg w-32 mb-4"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-white/5 rounded-2xl"></div>
      ))}
    </div>
    <div className="h-4 bg-white/5 rounded-lg w-40 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
          <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-5 bg-white/10 rounded-lg w-32 mb-2"></div>
            <div className="h-3 bg-white/5 rounded-lg w-20"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Sidebar = ({
  lugares = [],
  filteredLugares = [],
  searchTerm = "",
  setSearchTerm,
  onLugarClick,
  isOpen = true,
  setIsOpen,
  onAddLugar,
  onDeleteLugar,
  userRole = 'user'
}) => {
  const [localSearch, setLocalSearch] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevRole, setPrevRole] = useState(userRole);

  const displayPlaces = filteredLugares.length > 0 ? filteredLugares : MOCK_PLACES;
  const currentSearch = setSearchTerm ? searchTerm : localSearch;
  const handleSearchChange = (value) => {
    if (setSearchTerm) setSearchTerm(value);
    else setLocalSearch(value);
  };

  const handlePlaceClick = (lugar) => {
    setSelectedPlace(lugar);
    if (onLugarClick) onLugarClick(lugar);
  };

  // Clases para sidebar de USUARIO (pequeño, izquierda)
  const userSidebarClasses = `
    absolute z-[20000] overflow-hidden will-change-transform
    transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]
    top-4 left-4 bottom-4 w-[calc(100%-32px)] md:w-[380px]
    flex flex-col rounded-3xl border
    bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl border-white/40 dark:border-white/5
    shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
    ${selectedPlace ? '-translate-x-[20px] opacity-50 scale-95 pointer-events-none' : ''}
    ${!isOpen ? '-translate-x-[105%] opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
  `;

  return (
    <>
      <div className={userSidebarClasses}>
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200/50 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <MapPin className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">Memoria Radar</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Explora tu ciudad</p>
              </div>
            </div>
            <button onClick={() => setIsOpen && setIsOpen(false)} className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-black/20 border border-transparent dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-black/40 transition-all"
              placeholder="Buscar lugares, eventos..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto scrollbar-hide p-6 pt-2 space-y-8">
          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categorías</h2>
              <button className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">Ver todas</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: <Clock />, label: "Abierto", color: "bg-green-500" },
                { icon: <Star />, label: "Top", color: "bg-yellow-500" },
                { icon: <Ticket />, label: "Eventos", color: "bg-purple-500" },
                { icon: <MoreHorizontal />, label: "Más", color: "bg-gray-500" }
              ].map((cat, i) => (
                <button key={i} className="flex flex-col items-center gap-2 group">
                  <div className={`w-14 h-14 ${cat.color} bg-opacity-10 dark:bg-opacity-20 rounded-2xl flex items-center justify-center text-${cat.color.split('-')[1]}-600 dark:text-${cat.color.split('-')[1]}-400 group-hover:scale-105 transition-transform duration-200 border border-${cat.color.split('-')[1]}-200 dark:border-${cat.color.split('-')[1]}-500/30`}>
                    {React.cloneElement(cat.icon, { size: 24 })}
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Events */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Eventos Destacados</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide snap-x">
              {EVENTOS_DESTACADOS.map(evento => (
                <div key={evento.id} className="snap-start flex-shrink-0 w-64 h-36 rounded-2xl overflow-hidden relative group cursor-pointer">
                  <img src={evento.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={evento.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-xs font-bold text-blue-400 mb-1">{evento.date}</span>
                    <h3 className="text-white font-bold leading-tight">{evento.title}</h3>
                    <p className="text-xs text-gray-300 flex items-center gap-1 mt-1"><MapPin size={10} /> {evento.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Places List */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Lugares Populares</h2>
            <div className="space-y-3">
              {displayPlaces.map((lugar) => (
                <div
                  key={lugar.id}
                  onClick={() => handlePlaceClick(lugar)}
                  className="group flex gap-4 p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-zinc-800 flex-shrink-0 relative">
                    {lugar.imagen ? (
                      <img src={lugar.imagen} className="w-full h-full object-cover" alt={lugar.nombre} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><MapPin className="text-gray-400" size={24} /></div>
                    )}
                    <div className="absolute top-1 right-1">
                      <div className="bg-white/90 dark:bg-black/60 backdrop-blur-sm p-1 rounded-lg">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2">{lugar.nombre}</h3>
                      {lugar.rating && <span className="text-xs font-bold text-gray-900 dark:text-white">{lugar.rating}</span>}
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{lugar.categoria}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{lugar.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Place Detail Modal (Overlay) */}
      {selectedPlace && (
        <div className={`absolute z-[1250] top-4 left-4 bottom-4 w-[calc(100%-32px)] md:w-[380px] bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-left-10 duration-300 border border-gray-200 dark:border-white/10`}>
          <div className="relative h-64 flex-shrink-0">
            <img src={selectedPlace.imagen || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"} className="w-full h-full object-cover" alt={selectedPlace.nombre} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-transparent to-transparent"></div>
            <button onClick={() => setSelectedPlace(null)} className="absolute top-4 left-4 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-all">
              <X size={20} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">{selectedPlace.categoria}</span>
                <RatingBadge rating={selectedPlace.rating} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">{selectedPlace.nombre}</h2>
              <p className="text-gray-300 text-sm flex items-center gap-1"><MapPin size={14} /> A 1.2 km de ti</p>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-white dark:bg-[#1C1C1E]">
            <div className="flex gap-3">
              <ActionButton icon={<Navigation />} label="Ir ahora" primary />
              <ActionButton icon={<Phone />} label="Llamar" />
              <ActionButton icon={<Globe />} label="Web" />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Información</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selectedPlace.descripcion}</p>
              </div>

              {selectedPlace.horario && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <Clock className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Horario</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPlace.horario}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

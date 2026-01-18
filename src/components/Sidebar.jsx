import React, { useState } from 'react';
import {
  Search, X, Star, MapPin, Navigation, Phone,
  Globe, MoreHorizontal, Menu, Plus, Trash2,
  Ticket, Clock
} from 'lucide-react';

// DATOS DE PRUEBA
const MOCK_PLACES = [
  {
    id: 1,
    nombre: "Café Central",
    rating: 4.8,
    categoria: "Cafetería",
    descripcion: "Café acogedor con especialidad en espresso",
    imagen: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400&auto=format&fit=crop",
    horario: "Lun-Dom: 7:00 - 22:00"
  },
  {
    id: 2,
    nombre: "Grand Vista Hotel",
    rating: 4.5,
    categoria: "Hotel",
    descripcion: "Hotel boutique con vistas panorámicas",
    imagen: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop",
    horario: "24 horas"
  },
  {
    id: 3,
    nombre: "Parque del Retiro",
    rating: 4.9,
    categoria: "Parque",
    descripcion: "Hermoso parque público con jardines",
    imagen: "https://images.unsplash.com/photo-1576082869502-d7b38df3743e?q=80&w=400&auto=format&fit=crop",
    horario: "6:00 - 22:00"
  },
  {
    id: 4,
    nombre: "Restaurante La Plaza",
    rating: 4.7,
    categoria: "Restaurante",
    descripcion: "Cocina tradicional con ingredientes frescos",
    imagen: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop",
    horario: "12:00 - 23:00"
  },
  {
    id: 5,
    nombre: "Museo de Arte",
    rating: 4.6,
    categoria: "Museo",
    descripcion: "Colección de arte contemporáneo y clásico",
    imagen: "https://images.unsplash.com/photo-1566127444979-b2e871d3bef8?q=80&w=400&auto=format&fit=crop",
    horario: "Mar-Dom: 10:00 - 19:00"
  }
];

const EVENTOS_DESTACADOS = [
  {
    id: 101,
    title: "Noche de Jazz",
    date: "Hoy, 20:00",
    location: "Café Central",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: 102,
    title: "Feria de Diseño",
    date: "Mañana",
    location: "Matadero",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: 103,
    title: "Ruta de Tapas",
    date: "Sáb, 13:00",
    location: "Centro",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: 104,
    title: "Cine de Verano",
    date: "Dom, 21:00",
    location: "Parque Retiro",
    image: "https://images.unsplash.com/photo-1517604931442-710e8b6b0606?q=80&w=300&auto=format&fit=crop"
  }
];

const RatingBadge = ({ rating }) => (
  <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md self-start">
    <Star size={12} className="fill-yellow-500 text-yellow-500" />
    <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{rating || 4.5}</span>
  </div>
);

const ActionButton = ({ icon, label, primary }) => (
  <button className={`
    flex flex-col items-center justify-center gap-2 w-full py-3 rounded-xl transition-all duration-200
    ${primary
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700'
      : 'bg-gray-50 dark:bg-white/5 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/10'}
  `}>
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-xs font-medium">{label}</span>
  </button>
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
  onDeleteLugar
}) => {
  const [localSearch, setLocalSearch] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);

  // DEBUG: Ver cuando cambia isOpen
  React.useEffect(() => {
    console.log('🔄 isOpen cambió a:', isOpen);
  }, [isOpen]);

  const displayPlaces = filteredLugares.length > 0 ? filteredLugares : MOCK_PLACES;

  const currentSearch = setSearchTerm ? searchTerm : localSearch;
  const handleSearchChange = (value) => {
    if (setSearchTerm) {
      setSearchTerm(value);
    } else {
      setLocalSearch(value);
    }
  };

  const handlePlaceClick = (lugar) => {
    setSelectedPlace(lugar);
    if (onLugarClick) onLugarClick(lugar);
  };

  return (
    <>
      {/* Botón flotante para abrir cuando está cerrado */}
      {!isOpen && (
        <button
          onClick={() => {
            console.log('Abriendo sidebar');
            setIsOpen && setIsOpen(true);
          }}
          className="fixed top-6 left-6 z-[9999] bg-white/90 dark:bg-black/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20 hover:scale-110 transition-all duration-300"
        >
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* SIDEBAR FLOTANTE PRINCIPAL */}
      <div className={`
        absolute z-20 
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        top-4 left-2 right-2 bottom-4 w-auto md:w-[380px] md:left-4 md:right-auto
        flex flex-col 
        rounded-3xl border 
        bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl 
        border-white/40 dark:border-white/5
        shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
        ${selectedPlace ? '-translate-x-[20px] opacity-0 md:opacity-50 scale-95 pointer-events-none' : ''}
        ${!isOpen ? '-translate-x-[120%]' : 'translate-x-0'}
      `}>

        {/* Header */}
        <div className="p-5 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Explorar</h1>
            <div className="flex items-center gap-2">
              {onAddLugar && (
                <button
                  onClick={onAddLugar}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  title="Agregar lugar"
                >
                  <Plus size={18} />
                </button>
              )}
              <button
                onClick={() => {
                  console.log('CLICK EN X - Intentando cerrar sidebar');
                  console.log('setIsOpen disponible:', !!setIsOpen);
                  console.log('isOpen actual:', isOpen);
                  if (setIsOpen) {
                    setIsOpen(false);
                    console.log('✅ setIsOpen(false) ejecutado');
                  } else {
                    console.error('❌ ERROR: setIsOpen no está definido!');
                  }
                }}
                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Cerrar sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/10 focus:bg-white dark:focus:bg-[#2C2C2E] 
                         border-0 rounded-xl py-3 pl-10 pr-4 
                         text-gray-800 dark:text-gray-100 placeholder-gray-500 
                         outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-grow overflow-y-auto px-3 pb-4 no-scrollbar">

          {/* Eventos Destacados */}
          <div className="mb-6 mt-2">
            <div className="flex items-center justify-between px-2 mb-3">
              <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket size={14} className="text-blue-500" />
                Destacados
              </h2>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 -mx-3 px-3 no-scrollbar">
              {EVENTOS_DESTACADOS.map(event => (
                <div key={event.id} className="relative w-28 h-40 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 border border-black/5 dark:border-white/5">
                  <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white border border-white/20">
                    {event.date.split(',')[0]}
                  </div>
                  <div className="absolute bottom-3 left-2 right-2">
                    <p className="text-[10px] font-medium text-blue-300 truncate">{event.location}</p>
                    <p className="text-white text-xs font-bold leading-tight mt-0.5 line-clamp-2">{event.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lugares */}
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-2">
            Cerca de ti
          </h2>

          <div className="space-y-3">
            {displayPlaces.map((lugar) => (
              <div
                key={lugar.id}
                onClick={() => handlePlaceClick(lugar)}
                className="group flex gap-3 p-3 rounded-2xl 
                           bg-white/50 dark:bg-white/5 
                           hover:bg-white dark:hover:bg-white/10
                           border border-transparent hover:border-gray-100 dark:hover:border-white/5
                           shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 relative"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0 relative bg-gray-200 dark:bg-gray-700">
                  {lugar.imagen ? (
                    <img src={lugar.imagen} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={lugar.nombre} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-grow min-w-0 justify-center">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">{lugar.nombre}</h3>
                    <RatingBadge rating={lugar.rating} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{lugar.categoria}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{lugar.descripcion}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Disponible</span>
                  </div>
                </div>

                {onDeleteLugar && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLugar(lugar.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg 
                               text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PANEL DE DETALLE */}
      {selectedPlace && (
        <div className={`
          absolute z-30 flex flex-col 
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          top-4 left-2 right-2 bottom-4 w-auto md:w-[380px] md:left-[420px] md:right-auto
          rounded-3xl border 
          bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl
          border-white/40 dark:border-white/5
          shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)]
        `}>
          <button
            onClick={() => setSelectedPlace(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full text-gray-500 dark:text-gray-200 transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>

          <div className="relative h-56 w-full flex-shrink-0 rounded-t-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            {selectedPlace.imagen ? (
              <img src={selectedPlace.imagen} className="w-full h-full object-cover" alt={selectedPlace.nombre} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
            )}
            <div className="absolute bottom-4 left-5 right-5 z-20 text-white">
              <h1 className="text-3xl font-bold mb-1 tracking-tight">{selectedPlace.nombre}</h1>
              <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                <span>{selectedPlace.categoria}</span>
                <div className="flex items-center bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg ml-2">
                  <Star size={12} className="fill-white text-white mr-1" />
                  <span>{selectedPlace.rating || 4.5}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-4 gap-3 mb-8">
              <ActionButton icon={<Navigation />} label="Ir" primary />
              <ActionButton icon={<Phone />} label="Llamar" />
              <ActionButton icon={<Globe />} label="Web" />
              <ActionButton icon={<MoreHorizontal />} label="Más" />
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 flex gap-4 items-center">
                <MapPin className="text-blue-500" size={24} />
                <div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium text-sm">{selectedPlace.descripcion || 'Información del lugar'}</p>
                  <p className="text-gray-400 text-xs">A 2.5 km • 12 min en auto</p>
                </div>
              </div>
              {selectedPlace.horario && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 flex gap-4 items-center">
                  <Clock className="text-green-500" size={24} />
                  <div>
                    <p className="text-green-600 dark:text-green-400 font-medium text-sm">Abierto ahora</p>
                    <p className="text-gray-400 text-xs">{selectedPlace.horario}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default Sidebar;

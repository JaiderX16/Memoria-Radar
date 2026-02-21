import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    MapPin,
    Compass,
    Coffee,
    Camera,
    ArrowRight,
    Utensils,
    Mountain,
    Settings,
    User,
    X,
    Star
} from 'lucide-react';

const TRENDS = ['#Miradores', '#Cafés', '#Rutas', '#Histórico', '#Naturaleza'];

const SearchModal = ({ isOpen, onClose, onSelectSpot, spots = [] }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const filteredSpots = query
        ? spots.filter(s =>
            (s.title || s.nombre || '').toLowerCase().includes(query.toLowerCase()) ||
            (s.subtitle || s.categoria || '').toLowerCase().includes(query.toLowerCase())
        )
        : [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh]">
            <style>{`
        @keyframes blurIn {
          0% { opacity: 0; filter: blur(20px); transform: scale(0.95); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1); }
        }
        .animate-blurIn {
          animation: blurIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

            {/* Backdrop oscuro con blur fuerte */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Contenedor principal */}
            <div className="relative w-full max-w-xl px-6 animate-blurIn">

                {/* INPUT ESTILO CAPTURA */}
                <div className="relative group">
                    <div className="flex items-center justify-between">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="¿Qué buscas?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-transparent text-4xl md:text-5xl font-black text-white placeholder:text-white/20 border-none outline-none tracking-tighter py-4 uppercase"
                            autoComplete="off"
                        />
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
                        >
                            <X size={24} strokeWidth={3} />
                        </button>
                    </div>
                    {/* Línea decorativa blanca */}
                    <div className={`h-1.5 bg-white transition-all duration-700 ease-out mt-2 rounded-full ${query ? 'w-full opacity-100' : 'w-16 opacity-30 shadow-[0_0_15px_rgba(255,255,255,0.3)]'}`} />
                </div>

                {/* CONTENIDO */}
                <div className="mt-12 space-y-10">

                    {/* TENDENCIAS / CATEGORÍAS */}
                    {!query && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase">
                                    TENDENCIAS
                                </p>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {TRENDS.map((tag, i) => (
                                    <button
                                        key={tag}
                                        className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 text-gray-400 hover:bg-white hover:text-black hover:scale-105 transition-all duration-300"
                                        onClick={() => setQuery(tag.replace('#', ''))}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            {/* Footer con controles rápidos */}
                            <div className="pt-10 flex gap-10">
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-blue-500/20">
                                        <Settings size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-white/60 group-hover:text-white transition-colors uppercase tracking-widest">Ajustes</span>
                                        <span className="text-[9px] font-bold text-white/20">Preferencias</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-orange-500/20">
                                        <User size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-white/60 group-hover:text-white transition-colors uppercase tracking-widest">Mi Ruta</span>
                                        <span className="text-[9px] font-bold text-white/20">Guardados</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RESULTADOS */}
                    {query && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase">
                                    RESULTADOS
                                </p>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
                                {filteredSpots.length > 0 ? (
                                    filteredSpots.map((spot) => (
                                        <div
                                            key={spot.id}
                                            className="group flex items-start gap-5 p-4 rounded-[28px] bg-[#1a1a1a]/40 hover:bg-[#252525]/60 backdrop-blur-xl border border-white/5 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-2xl active:scale-95"
                                            onClick={() => { onSelectSpot(spot); onClose(); }}
                                        >
                                            {/* Imagen del lugar */}
                                            <div className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden shadow-lg border border-white/10">
                                                <img
                                                    src={spot.image || spot.imagen || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300&h=300&auto=format&fit=crop"}
                                                    alt={spot.nombre || spot.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                {/* Badge de estrella si es destacado */}
                                                <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                                    <Star size={12} className="fill-white" />
                                                </div>
                                            </div>

                                            {/* Info de la tarjeta */}
                                            <div className="flex-1 min-w-0 pt-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-xl font-black text-white uppercase tracking-tight truncate pr-4">
                                                        {spot.nombre || spot.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                                                        <Star size={12} className="fill-orange-400 text-orange-400" />
                                                        <span className="text-xs font-black text-white">{spot.rating || "4.5"}</span>
                                                    </div>
                                                </div>

                                                <span className="inline-block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">
                                                    {spot.categoria || spot.subtitle || 'Lugar'}
                                                </span>

                                                <p className="text-sm text-white/40 font-medium line-clamp-2 leading-relaxed tracking-tight group-hover:text-white/60 transition-colors">
                                                    {spot.descripcion || spot.description || "Descubre este lugar increíble con experiencias únicas y momentos memorables."}
                                                </p>
                                            </div>

                                            {/* Botón Flecha */}
                                            <div className="self-center ml-2">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-300">
                                                    <ArrowRight size={18} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white/5 p-8 rounded-3xl border border-dashed border-white/10 text-center">
                                        <p className="text-white/20 font-black text-xs uppercase tracking-[.2em]">
                                            No se encontraron resultados para "{query}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SearchModal;

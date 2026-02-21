import React from 'react';
import { MapPin, X } from 'lucide-react';

const Header = ({ setIsOpen, places = [], onPlaceClick }) => {
    // Filtrar lugares que tienen imagen para mostrar en historias
    const featuredPlaces = places.filter(p => p.imagen).slice(0, 10);

    return (
        <div className="pt-6 pb-2 border-b border-gray-200/50 dark:border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between px-6 mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lugares Destacados</h2>
                <button
                    onClick={() => setIsOpen && setIsOpen(false)}
                    className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 transition-all"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Stories Scroll */}
            <div className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide snap-x">
                {/* Add Story Button (Optional, maybe for future) */}
                {/* <div className="flex flex-col items-center gap-2 flex-shrink-0 snap-start">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-400">
                        <span className="text-2xl">+</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500">Nuevo</span>
                </div> */}

                {featuredPlaces.map((place) => (
                    <button
                        key={place.id}
                        onClick={() => onPlaceClick && onPlaceClick(place)}
                        className="flex flex-col items-center gap-2 flex-shrink-0 snap-start group"
                    >
                        <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 group-hover:scale-105 transition-transform">
                            <div className="p-[2px] bg-white dark:bg-[#1C1C1E] rounded-full">
                                <img
                                    src={place.imagen}
                                    alt={place.nombre}
                                    className="w-14 h-14 rounded-full object-cover"
                                />
                            </div>
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 w-16 text-center truncate">
                            {place.nombre}
                        </span>
                    </button>
                ))}

                {featuredPlaces.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No hay lugares destacados aún.</p>
                )}
            </div>
        </div>
    );
};

export default Header;

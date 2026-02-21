import React from 'react';
import { MapPin, Star } from 'lucide-react';

const Places = ({ places, onPlaceClick, selectedPlaceId }) => (
    <div className="px-4 mb-8">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Lugares Populares</h2>
        <div className="space-y-3">
            {places.map((lugar) => {
                const isSelected = selectedPlaceId === lugar.id;
                return (
                    <div
                        key={lugar.id}
                        onClick={() => onPlaceClick && onPlaceClick(lugar)}
                        className={`group flex gap-4 p-3 rounded-2xl transition-all cursor-pointer border ${isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/50 ring-1 ring-blue-500/20'
                            : 'hover:bg-gray-100 dark:hover:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/10'
                            }`}
                    >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-zinc-800 flex-shrink-0 relative">
                            {lugar.imagen ? (
                                <img src={lugar.imagen} className="w-full h-full object-cover" alt={lugar.nombre} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <MapPin className="text-gray-400" size={24} />
                                </div>
                            )}
                            <div className="absolute top-1 right-1">
                                <div className="bg-white/90 dark:bg-black/60 backdrop-blur-sm p-1 rounded-lg">
                                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold truncate pr-2 ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {lugar.nombre}
                                </h3>
                                {lugar.rating && (
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{lugar.rating}</span>
                                )}
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{lugar.categoria}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                {lugar.descripcion}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

export default Places;

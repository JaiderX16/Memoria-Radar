import React from 'react';
import { MapPin } from 'lucide-react';



const Events = ({ eventos = [], onEventClick, selectedEventoId }) => (
    <div className="px-6 mb-8">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Eventos Destacados</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide snap-x">
            {eventos.map(evento => (
                <div
                    key={evento.id}
                    onClick={() => onEventClick && onEventClick(evento)}
                    className={`snap-start flex-shrink-0 w-64 h-36 rounded-2xl overflow-hidden relative group cursor-pointer border-2 transition-all ${selectedEventoId === evento.id ? 'border-yellow-400 scale-[1.02] shadow-lg' : 'border-transparent'}`}
                >
                    <img src={evento.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={evento.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                        <span className="text-xs font-bold text-blue-400 mb-1">{evento.date}</span>
                        <h3 className="text-white font-bold leading-tight">{evento.title}</h3>
                        <p className="text-xs text-gray-300 flex items-center gap-1 mt-1"><MapPin size={10} /> {evento.location}</p>
                    </div>
                    {selectedEventoId === evento.id && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-black p-1 rounded-full shadow-md">
                            <span className="text-[10px] font-black">★</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export default Events;

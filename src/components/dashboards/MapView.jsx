import React from 'react';
import { MapPin, Layers, Navigation, X, Trash2, Map as MapIcon, Plus } from 'lucide-react';

const MapView = ({
    filteredPlaces,
    filterCategory,
    setFilterCategory,
    selectedPlace,
    setSelectedPlace,
    setModalType,
    setFormData,
    deleteItem,
    darkMode
}) => {
    return (
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

                    {filteredPlaces.map((place) => (
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
                                {/* Details would go here */}
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
};

export default MapView;

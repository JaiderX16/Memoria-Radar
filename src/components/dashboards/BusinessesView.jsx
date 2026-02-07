import React from 'react';
import { Settings, Plus, MapPin, Trash2 } from 'lucide-react';

const BusinessesView = ({
    filteredBusinesses,
    setActiveView,
    setModalType,
    setFormData,
    deleteItem
}) => {
    return (
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
                {filteredBusinesses.map(biz => (
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
};

export default BusinessesView;

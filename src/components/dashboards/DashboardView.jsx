import React from 'react';
import { Users, MapPin, BrainCircuit, Briefcase, TrendingUp, Activity } from 'lucide-react';
import StatCard from './StatCard';

const DashboardView = ({ users, places, businesses, notifications, darkMode }) => {
    return (
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
};

export default DashboardView;

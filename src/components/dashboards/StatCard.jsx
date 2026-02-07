import React from 'react';

const StatCard = ({ label, value, icon: Icon, trend, darkMode }) => (
    <div className={`relative p-6 rounded-[2rem] transition-all duration-500 group overflow-hidden ${darkMode
        ? 'bg-zinc-900 hover:bg-zinc-800'
        : 'bg-white hover:bg-slate-50 shadow-sm hover:shadow-md'
        }`}>
        <div className={`absolute -right-6 -bottom-6 opacity-[0.05] dark:opacity-[0.1] transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-12`}>
            <Icon size={140} className={darkMode ? 'text-white' : 'text-black'} />
        </div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${trend.startsWith('+')
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        </div>
    </div>
);

export default StatCard;

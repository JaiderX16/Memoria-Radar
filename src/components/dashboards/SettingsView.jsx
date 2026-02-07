import React from 'react';
import { Settings } from 'lucide-react';

const SettingsView = () => (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
        <div className="bg-slate-100 dark:bg-zinc-900 p-8 rounded-3xl mb-6 shadow-inner">
            <Settings size={64} className="text-slate-300 dark:text-zinc-700" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configuración</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-8">
            Personaliza tu experiencia en SPOT Manager.
        </p>
        <div className="flex gap-4">
            <button onClick={() => alert("Abriendo documentación externa...")} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-105 transition-transform">
                Documentación
            </button>
            <button onClick={() => alert("Contactando soporte...")} className="px-6 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                Soporte
            </button>
        </div>
    </div>
);

export default SettingsView;

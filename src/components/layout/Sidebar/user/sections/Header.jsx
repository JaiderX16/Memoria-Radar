import React from 'react';
import { MapPin, X } from 'lucide-react';

const Header = ({ setIsOpen }) => (
    <div className="p-6 pb-4 border-b border-gray-200/50 dark:border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <MapPin className="text-white" size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">Memoria Radar</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Explora tu ciudad</p>
                </div>
            </div>
            <button
                onClick={() => setIsOpen && setIsOpen(false)}
                className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 transition-all"
            >
                <X size={20} />
            </button>
        </div>
    </div>
);

export default Header;

import React from 'react';
import {
    Clock, Star, Ticket, MoreHorizontal, Globe,
    BarChart3, ShoppingBag, Music
} from 'lucide-react';

const Categories = ({ selectedCategories, onCategorySelect }) => {
    const categories = [
        { id: 'restaurante', icon: <Clock />, label: "Comida", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
        { id: 'parque', icon: <Star />, label: "Parques", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
        { id: 'museo', icon: <Ticket />, label: "Cultura", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { id: 'hotel', icon: <MoreHorizontal />, label: "Hoteles", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { id: 'monumento', icon: <Globe />, label: "Turismo", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
        { id: 'tiendas', icon: <BarChart3 />, label: "Compras", color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
        { id: 'mercado', icon: <ShoppingBag />, label: "Mercados", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        { id: 'vida nocturna', icon: <Music />, label: "Fiesta", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" }
    ];

    return (
        <div className="px-6 mb-6">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Categorías</h2>
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x">
                {categories.map((cat) => {
                    const isActive = selectedCategories?.includes(cat.id);
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onCategorySelect && onCategorySelect(cat.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 snap-start shrink-0
                                ${isActive
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-lg shadow-slate-900/10'
                                    : 'bg-white dark:bg-[#1C1C1E] text-slate-600 dark:text-gray-300 border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'}
                            `}
                        >
                            <span className={`${isActive ? 'text-white dark:text-black' : cat.color}`}>
                                {React.cloneElement(cat.icon, { size: 16, strokeWidth: 2.5 })}
                            </span>
                            <span className="text-sm font-bold whitespace-nowrap">{cat.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Categories;

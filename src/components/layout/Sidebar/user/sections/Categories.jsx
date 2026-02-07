import React from 'react';
import {
    Clock, Star, Ticket, MoreHorizontal, Globe,
    BarChart3, ShoppingBag, Music
} from 'lucide-react';

const Categories = ({ selectedCategories, onCategorySelect }) => {
    const categories = [
        { id: 'restaurante', icon: <Clock />, label: "Comida", color: "bg-orange-500" },
        { id: 'parque', icon: <Star />, label: "Parques", color: "bg-green-500" },
        { id: 'museo', icon: <Ticket />, label: "Cultura", color: "bg-blue-500" },
        { id: 'hotel', icon: <MoreHorizontal />, label: "Hoteles", color: "bg-purple-500" },
        { id: 'monumento', icon: <Globe />, label: "Turismo", color: "bg-red-500" },
        { id: 'tiendas', icon: <BarChart3 />, label: "Compras", color: "bg-pink-500" },
        { id: 'mercado', icon: <ShoppingBag />, label: "Mercados", color: "bg-yellow-500" },
        { id: 'vida nocturna', icon: <Music />, label: "Fiesta", color: "bg-indigo-500" }
    ];

    return (
        <div className="px-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categorías</h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
                {categories.map((cat, i) => {
                    const isActive = selectedCategories?.includes(cat.id);
                    const colorBase = cat.color.split('-')[1];
                    return (
                        <button
                            key={i}
                            onClick={() => onCategorySelect && onCategorySelect(cat.id)}
                            className={`flex flex-col items-center gap-2 group transition-all duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isActive
                                ? `${cat.color} text-white shadow-lg`
                                : `${cat.color} bg-opacity-10 dark:bg-opacity-20 text-${colorBase}-600 dark:text-${colorBase}-400 border border-${colorBase}-200 dark:border-${colorBase}-500/30`
                                }`}>
                                {React.cloneElement(cat.icon, { size: 24 })}
                            </div>
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                {cat.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Categories;

import React, { useRef, useState, useEffect } from 'react';
import {
    Clock, Star, Ticket, MoreHorizontal, Globe,
    BarChart3, ShoppingBag, Music, ChevronLeft, ChevronRight
} from 'lucide-react';

const Categories = ({ selectedCategories, onCategorySelect }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(true);

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

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftScroll(scrollLeft > 0);
        // Usamos un margen de 2px para evitar problemas de redondeo
        setShowRightScroll(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, []);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="px-6 mb-6">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Categorías</h2>
            <div className="relative group">
                {showLeftScroll && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x relative"
                >
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

                {showRightScroll && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Categories;

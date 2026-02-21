import React from 'react';
import Header from './sections/Header';
import Search from './sections/Search';
import Categories from './sections/Categories';
import Events from './sections/Events';
import Places from './sections/Places';

const Sidebar = ({
    lugares = [],
    eventos = [],
    onEventClick,
    selectedEvento,
    searchTerm = "",
    onSearch,
    onLugarClick,
    isOpen = true,
    setIsOpen,
    onCategorySelect,
    selectedCategories = [],
    selectedLugar // Recibe el lugar seleccionado desde App.jsx
}) => {
    // Clases para sidebar de USUARIO (pequeño, izquierda)
    const userSidebarClasses = `
    absolute z-[20000] overflow-hidden will-change-transform
    transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]
    top-4 left-4 bottom-4 w-[calc(100%-32px)] md:w-[380px]
    flex flex-col rounded-3xl border
    bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl border-white/40 dark:border-white/5
    shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
    ${!isOpen ? '-translate-x-[105%] opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
  `;

    return (
        <div className={userSidebarClasses}>
            <Header setIsOpen={setIsOpen} places={lugares} onPlaceClick={onLugarClick} />

            <div className="flex-grow overflow-y-auto scrollbar-hide pt-2">
                <Search value={searchTerm} onChange={onSearch} />

                <Categories
                    selectedCategories={selectedCategories}
                    onCategorySelect={onCategorySelect}
                />

                <Events
                    eventos={eventos}
                    onEventClick={onEventClick}
                    selectedEventoId={selectedEvento?.id}
                />

                <Places
                    places={lugares}
                    onPlaceClick={onLugarClick}
                    selectedPlaceId={selectedLugar?.id}
                />
            </div>
        </div>
    );
};

export default Sidebar;

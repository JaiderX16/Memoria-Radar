import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parse, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

// --- Custom Date Picker ---
export const CustomDatePicker = ({ value, onChange, placeholder = "Seleccionar fecha", className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);

    // Initial sync with value
    useEffect(() => {
        if (value) {
            const date = parse(value, 'yyyy-MM-dd', new Date());
            if (isValid(date)) {
                setCurrentMonth(date);
            }
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDayClick = (day) => {
        onChange({ target: { name: 'date', value: format(day, 'yyyy-MM-dd') } });
        setIsOpen(false);
    };

    // Calendar Grid Generation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

    const formattedDate = value ? format(parse(value, 'yyyy-MM-dd', new Date()), "d 'de' MMMM, yyyy", { locale: es }) : '';

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between cursor-pointer w-full bg-gray-50/50 dark:bg-[#1c1c1e]/50 border border-gray-200 dark:border-white/5 rounded-2xl py-3.5 px-4 text-slate-800 dark:text-white transition-all ${className} ${isOpen ? 'ring-2 ring-pink-500/20 border-pink-500/50' : ''}`}
            >
                <span className={!value ? 'text-slate-400 dark:text-zinc-500' : ''}>
                    {formattedDate || placeholder}
                </span>
                <CalendarIcon size={18} className="text-slate-400 dark:text-zinc-500" />
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
                    <div className="w-72 bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-gray-300">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-bold text-slate-800 dark:text-white capitalize">
                                {format(currentMonth, 'MMMM yyyy', { locale: es })}
                            </span>
                            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-gray-300">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 mb-2">
                            {weekDays.map(day => (
                                <div key={day} className="text-center text-xs font-medium text-slate-400 dark:text-zinc-500">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, idx) => {
                                const isSelected = value === format(day, 'yyyy-MM-dd');
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleDayClick(day)}
                                        className={`
                                        h-9 w-9 rounded-xl flex items-center justify-center text-sm font-medium transition-all
                                        ${!isCurrentMonth ? 'text-slate-300 dark:text-zinc-700' : 'text-slate-700 dark:text-zinc-300'}
                                        ${isSelected
                                                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                                                : 'hover:bg-gray-100 dark:hover:bg-white/10'}
                                        ${isToday && !isSelected ? 'border border-pink-500/50 text-pink-500' : ''}
                                    `}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Custom Time Picker ---
export const CustomTimePicker = ({ value, onChange, placeholder = "Hora", className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Generate time slots (15 min intervals)
    const timeSlots = [];
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 15) {
            const hour = i.toString().padStart(2, '0');
            const minute = j.toString().padStart(2, '0');
            timeSlots.push(`${hour}:${minute}`);
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTimeSelect = (time) => {
        onChange({ target: { name: 'time', value: time } });
        setIsOpen(false);
    };

    // Format display: converting "14:00" to "02:00 PM"
    const formatTimeDisplay = (timeString) => {
        if (!timeString) return '';
        const [h, m] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(h), parseInt(m));
        return format(date, 'hh:mm a');
    };

    return (
        <div className="relative w-full sm:w-36" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between cursor-pointer w-full bg-gray-50/50 dark:bg-[#1c1c1e]/50 border border-gray-200 dark:border-white/5 rounded-2xl py-3.5 px-4 text-slate-800 dark:text-white transition-all ${className} ${isOpen ? 'ring-2 ring-pink-500/20 border-pink-500/50' : ''}`}
            >
                <span className={!value ? 'text-slate-400 dark:text-zinc-500' : ''}>
                    {formatTimeDisplay(value) || placeholder}
                </span>
                <Clock size={18} className="text-slate-400 dark:text-zinc-500" />
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
                    <div className="w-32 max-h-80 overflow-y-auto bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-1 animate-in zoom-in-95 duration-200 scrollbar-hide" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-1 gap-1">
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => handleTimeSelect(time)}
                                    className={`
                                    w-full text-center py-1.5 rounded-xl text-sm font-medium transition-all
                                    ${value === time
                                            ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300'
                                            : 'text-slate-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5'}
                                `}
                                >
                                    {formatTimeDisplay(time)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

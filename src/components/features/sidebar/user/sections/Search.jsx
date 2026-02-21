import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

const Search = ({ value, onChange }) => (
    <div className="px-6 mb-4">
        <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-black/20 border border-transparent dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-black/40 transition-all"
                placeholder="Buscar lugares, eventos..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

export default Search;

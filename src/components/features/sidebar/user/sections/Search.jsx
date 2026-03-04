import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

import { LiquidGlassInput } from '@/buttons/LiquidGlassInput';

const Search = ({ value, onChange, isDarkMode }) => (
    <div className="px-6 mb-4">
        <LiquidGlassInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar lugares, eventos..."
            leftIcon={<SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />}
            isDarkMode={isDarkMode}
            className="!h-12 w-full"
        />
    </div>
);

export default Search;

import { useState, useMemo, useCallback } from 'react';

export const useFiltrosAvanzados = (lugares) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');

  // Función de búsqueda mejorada
  const searchInText = useCallback((text, term) => {
    if (!text || !term) return false;

    // Normalizar texto para búsqueda (sin acentos, minúsculas)
    const normalizeText = (str) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    const normalizedText = normalizeText(text);
    const normalizedTerm = normalizeText(term);

    // Búsqueda por palabras individuales
    const words = normalizedTerm.split(' ').filter(word => word.length > 0);
    return words.every(word => normalizedText.includes(word));
  }, []);

  // Aplicar filtros
  const lugaresConFiltros = useMemo(() => {
    let filtered = [...lugares];

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(lugar => {
        return (
          searchInText(lugar.nombre, searchTerm) ||
          searchInText(lugar.descripcion, searchTerm) ||
          searchInText(lugar.categoria, searchTerm)
        );
      });
    }

    // Filtro por categorías múltiples (insensible a mayúsculas)
    if (selectedCategories.length > 0) {
      const lowerCategories = selectedCategories.map(c => c.toLowerCase());
      filtered = filtered.filter(lugar =>
        lugar.categoria && lowerCategories.includes(lugar.categoria.toLowerCase())
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'nombre':
          comparison = a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
          break;
        case 'categoria':
          comparison = a.categoria.localeCompare(b.categoria, 'es', { sensitivity: 'base' });
          break;
        case 'reciente':
          // Si hay fecha de creación, usar esa; si no, usar ID como proxy
          const dateA = a.fechaCreacion ? new Date(a.fechaCreacion) : new Date(a.id * 1000);
          const dateB = b.fechaCreacion ? new Date(b.fechaCreacion) : new Date(b.id * 1000);
          comparison = dateB - dateA; // Más reciente primero por defecto
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [lugares, searchTerm, selectedCategories, sortBy, sortOrder, searchInText]);

  // Estadísticas de filtrado
  const filterStats = useMemo(() => {
    const total = lugares.length;
    const filtered = lugaresConFiltros.length;
    const categoriesUsed = selectedCategories.length;
    const hasSearch = searchTerm.trim().length > 0;

    return {
      total,
      filtered,
      categoriesUsed,
      hasSearch,
      isFiltered: hasSearch || categoriesUsed > 0
    };
  }, [lugares.length, lugaresConFiltros.length, selectedCategories.length, searchTerm]);

  // Funciones de control
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSortBy('nombre');
    setSortOrder('asc');
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const clearCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const toggleCategory = useCallback((categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const addCategory = useCallback((categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev : [...prev, categoryId]
    );
  }, []);

  const removeCategory = useCallback((categoryId) => {
    setSelectedCategories(prev => prev.filter(id => id !== categoryId));
  }, []);

  // Sugerencias de búsqueda basadas en los datos
  const searchSuggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];

    const suggestions = new Set();
    const term = searchTerm.toLowerCase();

    lugares.forEach(lugar => {
      // Sugerencias de nombres
      if (lugar.nombre.toLowerCase().includes(term)) {
        suggestions.add(lugar.nombre);
      }

      // Sugerencias de categorías
      if (lugar.categoria.toLowerCase().includes(term)) {
        suggestions.add(lugar.categoria);
      }

      // Sugerencias de palabras en descripción
      if (lugar.descripcion) {
        const words = lugar.descripcion.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.includes(term) && word.length > 3) {
            suggestions.add(word);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }, [searchTerm, lugares]);

  // Filtros rápidos predefinidos
  const quickFilters = useMemo(() => [
    {
      id: 'populares',
      label: 'Lugares populares',
      icon: '⭐',
      apply: () => {
        setSortBy('reciente');
        setSortOrder('desc');
      }
    },
    {
      id: 'cercanos',
      label: 'Más cercanos',
      icon: '📍',
      apply: () => {
        setSortBy('nombre');
        setSortOrder('asc');
      }
    },
    {
      id: 'nuevos',
      label: 'Recién agregados',
      icon: '🆕',
      apply: () => {
        setSortBy('reciente');
        setSortOrder('desc');
      }
    }
  ], []);

  return {
    // Estado
    searchTerm,
    selectedCategories,
    sortBy,
    sortOrder,
    filteredLugares: lugaresConFiltros,
    filterStats,
    searchSuggestions,
    quickFilters,

    // Setters
    setSearchTerm,
    setSelectedCategories,
    setSortBy,
    setSortOrder,

    // Acciones
    clearAllFilters,
    clearSearch,
    clearCategories,
    toggleCategory,
    addCategory,
    removeCategory,

    // Utilidades
    searchInText
  };
};
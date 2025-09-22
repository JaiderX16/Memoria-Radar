import { useState, useMemo, useCallback } from 'react';

export const useFiltrosAvanzados = (lugares, mentionedPlaces = [], filterByMentionedPlaces = false) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // DEBUG: Log cuando cambian los parámetros del hook
  console.log('🔧 [HOOK] useFiltrosAvanzados ejecutándose con:', {
    lugaresCount: lugares.length,
    mentionedPlaces,
    filterByMentionedPlaces
  });

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
    console.log('🔍 [useFiltrosAvanzados] ===== INICIANDO FILTRADO =====');
    console.log('🔍 [useFiltrosAvanzados] Parámetros recibidos:', {
      totalLugares: lugares.length,
      mentionedPlaces: mentionedPlaces,
      mentionedPlacesLength: mentionedPlaces?.length,
      filterByMentionedPlaces: filterByMentionedPlaces,
      searchTerm: searchTerm,
      selectedCategories: selectedCategories
    });
    
    // Función para normalizar texto (definida al inicio)
    const normalizeText = (str) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };
    
    // Log detallado de lugares disponibles
    console.log('🔍 [useFiltrosAvanzados] Primeros 5 lugares disponibles:', 
      lugares.slice(0, 5).map(l => ({
        nombre: l.nombre,
        normalizado: normalizeText(l.nombre)
      }))
    );

    let filtered = [...lugares];

    // 1. PRIORIDAD MÁXIMA: Filtrar por lugares mencionados por MIA
    if (filterByMentionedPlaces && Array.isArray(mentionedPlaces) && mentionedPlaces.length > 0) {
      console.log('🎯 [FILTRADO] ===== APLICANDO FILTRO POR LUGARES MENCIONADOS =====');
      console.log('🎯 [FILTRADO] Lugares mencionados originales:', mentionedPlaces);
      
      const mentionedNormalized = mentionedPlaces.map(place => normalizeText(place));
      console.log('🎯 [FILTRADO] Lugares mencionados normalizados:', mentionedNormalized);
      
      // Log detallado de todos los lugares disponibles para comparación
      console.log('🎯 [FILTRADO] Comparando con lugares disponibles:');
      lugares.forEach((lugar, index) => {
        const lugarNormalizado = normalizeText(lugar.nombre);
        const matches = mentionedNormalized.filter(mentioned => 
          lugarNormalizado.includes(mentioned) || mentioned.includes(lugarNormalizado)
        );
        
        if (index < 10 || matches.length > 0) { // Solo mostrar primeros 10 o los que coinciden
          console.log(`🔍 [FILTRADO] ${index + 1}. "${lugar.nombre}" -> "${lugarNormalizado}" | Matches: [${matches.join(', ')}]`);
        }
      });
      
      filtered = filtered.filter(lugar => {
        const lugarNormalizado = normalizeText(lugar.nombre);
        const matchingMentioned = mentionedNormalized.find(mentioned => 
          lugarNormalizado.includes(mentioned) || mentioned.includes(lugarNormalizado)
        );
        
        if (matchingMentioned) {
          console.log('✅ [FILTRADO] MATCH CONFIRMADO:', {
            lugar: lugar.nombre,
            normalizado: lugarNormalizado,
            coincideCon: matchingMentioned,
            mencionadoOriginal: mentionedPlaces[mentionedNormalized.indexOf(matchingMentioned)]
          });
          return true;
        }
        
        return false;
      });
      
      console.log('🎯 [FILTRADO] ===== RESULTADO FILTRO LUGARES MENCIONADOS =====');
      console.log('🎯 [FILTRADO] Lugares encontrados:', filtered.length, 'de', lugares.length);
      console.log('🎯 [FILTRADO] Nombres encontrados:', filtered.map(l => l.nombre));
      console.log('🎯 [FILTRADO] ===== FIN FILTRO LUGARES MENCIONADOS =====');
    } else {
      // PRIORIDAD 2: Filtros tradicionales (solo si no hay lugares mencionados)
      
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

      // Filtro por categorías múltiples
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(lugar => 
          selectedCategories.includes(lugar.categoria)
        );
      }
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

    console.log('🔍 [FILTRADO] ===== RESULTADO FINAL =====');
    console.log('🔍 [FILTRADO] Lugares finales a retornar:', filtered.length);
    console.log('🔍 [FILTRADO] Nombres finales:', filtered.map(l => l.nombre));
    console.log('🔍 [FILTRADO] filterByMentionedPlaces:', filterByMentionedPlaces);
    console.log('🔍 [FILTRADO] mentionedPlaces:', mentionedPlaces);
    console.log('🔍 [FILTRADO] ===== FIN RESULTADO FINAL =====');
    
    // Exponer lugares filtrados en el estado global para pruebas
    window.lugaresFiltrados = filtered;
    
    return filtered;
  }, [lugares, searchTerm, selectedCategories, sortBy, sortOrder, searchInText, filterByMentionedPlaces, mentionedPlaces]);

  // Estadísticas de filtrado
  const filterStats = useMemo(() => {
    const total = lugares.length;
    const filtered = lugaresConFiltros.length;
    const categoriesUsed = selectedCategories.length;
    const hasSearch = searchTerm.trim().length > 0;
    const hasMentionedPlaces = filterByMentionedPlaces && mentionedPlaces.length > 0;
    
    return {
      total,
      filtered,
      categoriesUsed,
      hasSearch,
      hasMentionedPlaces,
      mentionedPlacesCount: mentionedPlaces.length,
      isFiltered: hasSearch || categoriesUsed > 0 || hasMentionedPlaces
    };
  }, [lugares.length, lugaresConFiltros.length, selectedCategories.length, searchTerm, filterByMentionedPlaces, mentionedPlaces.length]);

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
        // Lógica para lugares populares (podría basarse en visitas, ratings, etc.)
        setSortBy('reciente');
        setSortOrder('desc');
      }
    },
    {
      id: 'cercanos',
      label: 'Más cercanos',
      icon: '📍',
      apply: () => {
        // Lógica para lugares cercanos (requeriría geolocalización)
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
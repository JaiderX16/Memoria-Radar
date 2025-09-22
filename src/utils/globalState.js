// Variables globales para el estado del filtrado manual y lugares mencionados
// Estas variables permiten la coordinación entre Sidebar y MIA

// Estado del filtro manual y lugares mencionados
if (typeof window !== 'undefined') {
  // Inicializar variables globales si no existen
  if (typeof window.manualFilterActive === 'undefined') {
    window.manualFilterActive = false;
  }
  
  if (typeof window.currentManualFilter === 'undefined') {
    window.currentManualFilter = 'todos';
  }
  
  // Nuevas variables para lugares mencionados específicos
  if (typeof window.mentionedPlaces === 'undefined') {
    window.mentionedPlaces = [];
  }
  
  if (typeof window.filterByMentionedPlaces === 'undefined') {
    window.filterByMentionedPlaces = false;
  }
}

// Funciones de utilidad para manejar el estado global
export const globalFilterState = {
  // Obtener el estado actual del filtro manual y lugares mencionados
  getState: () => {
    if (typeof window === 'undefined') {
      return { 
        isActive: false, 
        currentFilter: 'todos',
        mentionedPlaces: [],
        filterByMentionedPlaces: false
      };
    }
    return {
      isActive: window.manualFilterActive || false,
      currentFilter: window.currentManualFilter || 'todos',
      mentionedPlaces: window.mentionedPlaces || [],
      filterByMentionedPlaces: window.filterByMentionedPlaces || false
    };
  },

  // Establecer el filtro manual activo
  setManualFilter: (category) => {
    if (typeof window !== 'undefined') {
      window.manualFilterActive = category !== 'todos';
      window.currentManualFilter = category;
      // Limpiar filtro por lugares mencionados cuando se activa filtro manual
      window.filterByMentionedPlaces = false;
      window.mentionedPlaces = [];
      
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('manualFilterChanged', {
        detail: {
          isActive: window.manualFilterActive,
          currentFilter: window.currentManualFilter,
          mentionedPlaces: window.mentionedPlaces,
          filterByMentionedPlaces: window.filterByMentionedPlaces
        }
      }));
    }
  },

  // Limpiar el filtro manual
  clearManualFilter: () => {
    if (typeof window !== 'undefined') {
      window.manualFilterActive = false;
      window.currentManualFilter = 'todos';
      window.filterByMentionedPlaces = false;
      window.mentionedPlaces = [];
      
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('manualFilterChanged', {
        detail: {
          isActive: false,
          currentFilter: 'todos',
          mentionedPlaces: [],
          filterByMentionedPlaces: false
        }
      }));
    }
  },

  // Establecer filtro por lugares mencionados específicos
  setMentionedPlacesFilter: (places) => {
    console.log('🔥 [GLOBAL_STATE] setMentionedPlacesFilter llamado con:', places);
    if (typeof window !== 'undefined') {
      const placesArray = Array.isArray(places) ? places : [places];
      console.log('🔥 [GLOBAL_STATE] Lugares convertidos a array:', placesArray);
      
      window.mentionedPlaces = placesArray;
      window.filterByMentionedPlaces = window.mentionedPlaces.length > 0;
      
      console.log('🔥 [GLOBAL_STATE] Estado actualizado:', {
        mentionedPlaces: window.mentionedPlaces,
        filterByMentionedPlaces: window.filterByMentionedPlaces
      });
      
      // Limpiar filtro manual cuando se activa filtro por lugares mencionados
      window.manualFilterActive = false;
      window.currentManualFilter = 'todos';
      
      // Disparar evento personalizado para notificar cambios
      const eventDetail = {
        isActive: false,
        currentFilter: 'todos',
        mentionedPlaces: window.mentionedPlaces,
        filterByMentionedPlaces: window.filterByMentionedPlaces
      };
      console.log('🔥 [GLOBAL_STATE] Disparando evento con detalle:', eventDetail);
      
      window.dispatchEvent(new CustomEvent('manualFilterChanged', {
        detail: eventDetail
      }));
    }
  },

  // Limpiar filtro por lugares mencionados
  clearMentionedPlacesFilter: () => {
    if (typeof window !== 'undefined') {
      window.mentionedPlaces = [];
      window.filterByMentionedPlaces = false;
      
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('manualFilterChanged', {
        detail: {
          isActive: window.manualFilterActive,
          currentFilter: window.currentManualFilter,
          mentionedPlaces: [],
          filterByMentionedPlaces: false
        }
      }));
    }
  },

  // Verificar si un filtro específico está activo
  isFilterActive: (category) => {
    const state = globalFilterState.getState();
    return state.isActive && state.currentFilter === category;
  },

  // Obtener el título dinámico basado en el filtro actual
  getDynamicTitle: () => {
    const state = globalFilterState.getState();
    
    // Priorizar lugares mencionados sobre filtro manual
    if (state.filterByMentionedPlaces && state.mentionedPlaces.length > 0) {
      const count = state.mentionedPlaces.length;
      return count === 1 ? '1 lugar mencionado' : `${count} lugares mencionados`;
    }
    
    if (!state.isActive || state.currentFilter === 'todos') {
      return 'Lugares Destacados';
    }
    
    const titles = {
      'parques': 'Parques y Espacios Verdes',
      'monumentos': 'Monumentos y Patrimonio',
      'restaurantes': 'Restaurantes y Gastronomía',
      'museos': 'Museos y Cultura',
      'hoteles': 'Hoteles y Hospedajes',
      'centros-comerciales': 'Centros Comerciales',
      'estadios': 'Estadios y Deportes',
      'naturaleza': 'Naturaleza y Paisajes'
    };
    
    return titles[state.currentFilter] || 'Lugares Destacados';
  },

  // Suscribirse a cambios en el filtro manual
  subscribe: (callback) => {
    if (typeof window !== 'undefined') {
      const handler = (event) => {
        callback(event.detail);
      };
      window.addEventListener('manualFilterChanged', handler);
      
      // Retornar función para desuscribirse
      return () => {
        window.removeEventListener('manualFilterChanged', handler);
      };
    }
    return () => {}; // Función vacía para SSR
  }
};

// Exportar también las funciones individuales para compatibilidad
export const getManualFilterState = globalFilterState.getState;
export const setManualFilter = globalFilterState.setManualFilter;
export const clearManualFilter = globalFilterState.clearManualFilter;
export const setMentionedPlacesFilter = globalFilterState.setMentionedPlacesFilter;
export const clearMentionedPlacesFilter = globalFilterState.clearMentionedPlacesFilter;
export const isFilterActive = globalFilterState.isFilterActive;
export const getDynamicTitle = globalFilterState.getDynamicTitle;

// Inicialización automática
if (typeof window !== 'undefined') {
  // Asegurar que las variables estén disponibles globalmente
  window.globalFilterState = globalFilterState;
}
// Variables globales para el estado del filtrado manual
// Coordinación simple entre componentes

// Estado del filtro manual
if (typeof window !== 'undefined') {
  if (typeof window.manualFilterActive === 'undefined') {
    window.manualFilterActive = false;
  }

  if (typeof window.currentManualFilter === 'undefined') {
    window.currentManualFilter = 'todos';
  }
}

// Funciones de utilidad para manejar el estado global
export const globalFilterState = {
  // Obtener el estado actual del filtro manual
  getState: () => {
    if (typeof window === 'undefined') {
      return {
        isActive: false,
        currentFilter: 'todos'
      };
    }
    return {
      isActive: window.manualFilterActive || false,
      currentFilter: window.currentManualFilter || 'todos'
    };
  },

  // Establecer el filtro manual activo
  setManualFilter: (category) => {
    if (typeof window !== 'undefined') {
      window.manualFilterActive = category !== 'todos';
      window.currentManualFilter = category;

      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('manualFilterChanged', {
        detail: {
          isActive: window.manualFilterActive,
          currentFilter: window.currentManualFilter
        }
      }));
    }
  },

  // Limpiar el filtro manual
  clearManualFilter: () => {
    if (typeof window !== 'undefined') {
      window.manualFilterActive = false;
      window.currentManualFilter = 'todos';

      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('manualFilterChanged', {
        detail: {
          isActive: false,
          currentFilter: 'todos'
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
    return () => { }; // Función vacía para SSR
  }
};

// Exportar también las funciones individuales para compatibilidad
export const getManualFilterState = globalFilterState.getState;
export const setManualFilter = globalFilterState.setManualFilter;
export const clearManualFilter = globalFilterState.clearManualFilter;
export const isFilterActive = globalFilterState.isFilterActive;
export const getDynamicTitle = globalFilterState.getDynamicTitle;

// Funciones placeholder para compatibilidad con Mia.jsx
// TODO: Implementar lógica cuando se integre el servicio de IA
export const setMentionedPlacesFilter = (places) => {
  console.log('[globalState] setMentionedPlacesFilter (stub):', places);
  // Por ahora no hace nada, se implementará cuando se conecte el servicio de IA
};

export const clearMentionedPlacesFilter = () => {
  console.log('[globalState] clearMentionedPlacesFilter (stub)');
  // Por ahora no hace nada, se implementará cuando se conecte el servicio de IA
};

// Inicialización automática
if (typeof window !== 'undefined') {
  window.globalFilterState = globalFilterState;
}
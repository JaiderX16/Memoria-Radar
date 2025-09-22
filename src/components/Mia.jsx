import React, { useState, useEffect, useRef } from 'react';
import { globalFilterState, setMentionedPlacesFilter, clearMentionedPlacesFilter } from '../utils/globalState';
// Usando backend Python (Flask) para IA y datos; sin dependencias locales de IA

// Estilos CSS para MIA
const MiaStyles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
      .quick-suggestions {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .quick-suggestions button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      }
      
      .quick-suggestions button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      
      .mia-message-content {
        line-height: 1.5;
      }
      
      .mia-message-content ul {
        margin: 8px 0;
        padding-left: 20px;
      }
      
      .mia-message-content li {
        margin: 4px 0;
      }
      
      .mia-message-content img {
        max-width: 100%;
        border-radius: 8px;
        margin: 8px 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .mia-message-content strong {
        color: #4a5568;
        font-weight: 600;
      }
      
      .mia-message-content h2, .mia-message-content h3, .mia-message-content h4 {
        margin: 12px 0 8px 0;
        font-weight: 600;
        color: #2d3748;
      }
      
      .mia-loading-dots {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .mia-loading-dots div {
        width: 6px;
        height: 6px;
        background: #9ca3af;
        border-radius: 50%;
        animation: mia-bounce 1.4s infinite ease-in-out both;
      }
      
      .mia-loading-dots div:nth-child(1) { animation-delay: -0.32s; }
      .mia-loading-dots div:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes mia-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1.0); }
      }
      
      .mia-chat-modal {
        animation: mia-modal-in 0.3s ease-out;
      }
      
      @keyframes mia-modal-in {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      .mia-floating-button {
        animation: mia-float 3s ease-in-out infinite;
      }
      
      @keyframes mia-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      /* Grid y tarjetas de lugares con imágenes dentro del chat */
      .mia-places-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
      .mia-place-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px; cursor: pointer; transition: box-shadow .2s ease, transform .2s ease; }
      .mia-place-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
      .mia-place-image { width: 100%; height: 100px; object-fit: cover; border-radius: 8px; display: block; }
      .mia-place-title { font-weight: 600; color: #111827; font-size: 13px; margin-top: 6px; }
      .mia-place-desc { font-size: 12px; color: #6b7280; margin-top: 4px; }
    `
  }} />
);

// API de MIA - funciones auxiliares
const miaApi = {
  // Obtener estadísticas desde el backend Python
  getStats: async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }
    // Fallback mínimo si el backend no responde
    return {
      total_lugares: 0,
      total_imagenes: 0,
      categorias: [],
      estado: 'desconectado'
    };
  },

  // Obtener contexto de base de datos (deprecated: gestionado por el backend en /api/chat)
  getContext: async (category = null, place = null) => {
    try {
      // Ya no se usa en frontend; el backend Python maneja el contexto e intención
      return '';
    } catch (error) {
      return '';
    }
  },

  // Detectar intención del mensaje
  detectIntent: (message) => {
    const lowerMessage = message.toLowerCase();
    const intents = [];
    
    // Categorías - Ahora detecta múltiples categorías usando las mismas del componente de filtros
    if (lowerMessage.includes('monumento') || lowerMessage.includes('estatua') || lowerMessage.includes('plaza')) {
      intents.push({ type: 'category', value: 'monumentos', confidence: 0.9 });
    }
    if (lowerMessage.includes('parque') || lowerMessage.includes('jardín') || lowerMessage.includes('área verde')) {
      intents.push({ type: 'category', value: 'parques', confidence: 0.9 });
    }
    if (lowerMessage.includes('restaurante') || lowerMessage.includes('comida') || lowerMessage.includes('gastronomía') || lowerMessage.includes('platos')) {
      intents.push({ type: 'category', value: 'restaurantes', confidence: 0.9 });
    }
    if (lowerMessage.includes('hotel') || lowerMessage.includes('hospedaje') || lowerMessage.includes('alojamiento')) {
      intents.push({ type: 'category', value: 'hoteles', confidence: 0.9 });
    }
    if (lowerMessage.includes('discoteca') || lowerMessage.includes('club') || lowerMessage.includes('baile')) {
      intents.push({ type: 'category', value: 'discotecas', confidence: 0.9 });
    }
    if (lowerMessage.includes('playa') || lowerMessage.includes('costa') || lowerMessage.includes('mar')) {
      intents.push({ type: 'category', value: 'playas', confidence: 0.9 });
    }
    if (lowerMessage.includes('mercado') || lowerMessage.includes('feria') || lowerMessage.includes('compras')) {
      intents.push({ type: 'category', value: 'mercados', confidence: 0.9 });
    }
    if (lowerMessage.includes('museo') || lowerMessage.includes('exposición') || lowerMessage.includes('arte')) {
      intents.push({ type: 'category', value: 'museos', confidence: 0.9 });
    }
    if (lowerMessage.includes('bar') || lowerMessage.includes('pub') || lowerMessage.includes('bebida')) {
      intents.push({ type: 'category', value: 'bares', confidence: 0.9 });
    }
    if (lowerMessage.includes('tienda') || lowerMessage.includes('shopping') || lowerMessage.includes('comercio')) {
      intents.push({ type: 'category', value: 'tiendas', confidence: 0.9 });
    }
    if (lowerMessage.includes('otro') || lowerMessage.includes('lugar')) {
      intents.push({ type: 'category', value: 'otros', confidence: 0.7 });
    }
    
    // Estadísticas
    if (lowerMessage.includes('estadísticas') || lowerMessage.includes('cuántos lugares') || lowerMessage.includes('total')) {
      intents.push({ type: 'stats', value: 'estadísticas', confidence: 0.9 });
    }
    
    // Información general
    if (lowerMessage.includes('información') || lowerMessage.includes('qué sabes') || lowerMessage.includes('cuéntame')) {
      intents.push({ type: 'info', value: 'general', confidence: 0.8 });
    }
    
    // Saludo
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
      intents.push({ type: 'greeting', value: 'saludo', confidence: 0.9 });
    }
    
    // Limpiar filtros
    if (lowerMessage.includes('limpiar filtros') || lowerMessage.includes('quitar filtros') || lowerMessage.includes('resetear')) {
      intents.push({ type: 'clear_filters', value: 'limpiar', confidence: 0.9 });
    }
    
    return intents.length > 0 ? 
      { type: 'multi', intents: intents } : 
      { type: 'unknown', value: 'general', confidence: 0.5 };
  },

  // Caché de respuestas
  getCachedResponse: (message) => {
    const cacheKey = `mia_cache_${message.toLowerCase()}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data.response;
      }
    }
    return null;
  },

  // Guardar respuesta en caché
  cacheResponse: (message, response) => {
    const cacheKey = `mia_cache_${message.toLowerCase()}`;
    const data = {
      response: response,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(data));
  },

  // Obtener memoria conversacional
  getConversationMemory: () => {
    try {
      const memory = localStorage.getItem('mia_conversation_memory');
      return memory ? JSON.parse(memory) : [];
    } catch (error) {
      return [];
    }
  },

  // Guardar en memoria conversacional
  saveToMemory: (message, response) => {
    try {
      let memory = miaApi.getConversationMemory();
      memory.push({
        message: message,
        response: response,
        timestamp: Date.now()
      });
      
      // Mantener solo los últimos 10 mensajes
      if (memory.length > 10) {
        memory = memory.slice(-10);
      }
      
      localStorage.setItem('mia_conversation_memory', JSON.stringify(memory));
    } catch (error) {
      console.error('Error guardando memoria:', error);
    }
  }
};

// Prompt del sistema mejorado con contexto de MIA
const SYSTEM_PROMPT = `Eres MIA, un asistente turístico especializado en Huancayo, Perú. 

CONTEXTO DE HUANCAYO:
- Ubicado en el valle del Mantaro, región Junín
- Capital del departamento de Junín
- Clima templado seco, ideal para visitar todo el año
- Población aproximada: 500,000 habitantes
- Fundado el 1 de noviembre de 1571

BASE DE DATOS DISPONIBLE:
- Puedes acceder a información sobre lugares turísticos, cultura, gastronomía, historia y naturaleza
- Utiliza las funciones de contexto para obtener información actualizada
- Si no tienes información específica, ofrece información general útil

FUNCIONES ESPECIALES:
1. Estadísticas: Puedo mostrar estadísticas de lugares e imágenes
2. Categorías: Puedo filtrar información por turismo, cultura, gastronomía, historia, naturaleza
3. Búsquedas: Puedo buscar lugares específicos
4. Imágenes: Puedo mostrar imágenes de lugares (cuando estén disponibles)

ESTILO DE RESPUESTA:
- Usa HTML para formatear: <b>negrita</b>, <i>itálica</i>, <ul><li>listas</li></ul>
- Para imágenes usa: <img src="url" alt="descripción" style="max-width:100%;border-radius:8px;">
- Para sugerencias rápidas: <div class="quick-suggestions"><button onclick="sendQuickMessage('mensaje')">Texto del botón</button></div>
- Sé amable, informativo y conciso
- Usa emojis apropiados 🇵🇪✨🏔️

EJEMPLOS DE RESPUESTAS:
- Para turismo: "🏔️ <b>Los mejores lugares para visitar:</b><ul><li>Parque de la Identidad</li><li>Torre Torre</li><li>Plaza Constitución</li></ul><div class=\"quick-suggestions\"><button onclick=\"sendQuickMessage('Cuéntame más sobre el Parque de la Identidad')\">Parque de la Identidad</button></div>"
- Para gastronomía: "🍽️ <b>Platos típicos de Huancayo:</b><ul><li>Papa a la Huancaína</li><li>Cuy chactado</li><li>Trucha frita</li></ul>"

REGLAS:
- Siempre saluda cordialmente
- Ofrece ayuda adicional
- Mantén un tono profesional pero amigable
- Si no sabes algo, sugiere contactar a la oficina de turismo local

¡Hola! Soy MIA, tu asistente de turismo en Huancayo. ¿En qué puedo ayudarte hoy? 🇵🇪`;

const Mia = ({ isOpen, setIsOpen, onSetCategory, onSetSearch, currentFilters, onClearFilters, onToggleCategory }) => {
  console.log('🤖 [MIA] Componente MIA renderizado, isOpen:', isOpen);
  
  // Estado para indicadores visuales del filtro manual
  const [manualFilterState, setManualFilterState] = useState(() => globalFilterState.getState());
  
  // Suscribirse a cambios en el filtro manual para actualizar indicadores
  useEffect(() => {
    console.log('🔄 [MIA] Componente montado');
    
    const unsubscribe = globalFilterState.subscribe((newState) => {
      console.log('🔄 [MIA] Estado global actualizado:', newState);
      setManualFilterState(newState);
    });
    
    // AUTO-PRUEBA: Simular filtrado al cargar
    const autoTestTimer = setTimeout(() => {
      console.log('🧪 [MIA AUTO-TEST] Simulando respuesta de MIA...');
      const lugaresExtraidos = ["Parque Constitución", "Plaza Huamanmarca"];
      console.log('🧪 [MIA AUTO-TEST] Lugares extraídos:', lugaresExtraidos);
      setMentionedPlacesFilter(lugaresExtraidos);
      console.log('🧪 [MIA AUTO-TEST] Filtro aplicado');
    }, 2000); // Esperar 2 segundos después de cargar
    
    return () => {
      unsubscribe();
      clearTimeout(autoTestTimer);
    };
  }, []);

  // Función para mapear categorías del backend al frontend
  const mapBackendToFrontend = (category) => {
    // Mapa de correspondencia entre categorías del backend y frontend
    const categoryMap = {
      'monumentos': 'monumentos',
      'parques': 'parques',
      'restaurantes': 'restaurantes',
      'hoteles': 'hoteles',
      'discotecas': 'discotecas',
      'playas': 'playas',
      'mercados': 'mercados',
      'museos': 'museos',
      'bares': 'bares',
      'tiendas': 'tiendas',
      'otros': 'otros',
      // Mapeo de categorías antiguas a nuevas
      'turismo': 'monumentos',
      'cultura': 'museos',
      'gastronomía': 'restaurantes',
      'historia': 'monumentos',
      'naturaleza': 'parques'
    };
    
    return categoryMap[category] || category;
  };

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Referencia a los filtros actuales para usar en el contexto del chat
  const filtersRef = useRef(currentFilters);
  // Eliminado: referencias a modelos locales de IA
  // const genAI = useRef(null);
  // const model = useRef(null);

  // Inicializar: obtener estadísticas y mensaje de bienvenida desde el frontend (sin IA local)
  useEffect(() => {
    const initMia = async () => {
      try {
        const initialStats = await miaApi.getStats();
        setStats(initialStats);
        setMessages([
          {
            role: 'assistant',
            content: '¡Hola! Soy MIA, tu asistente de turismo en Huancayo. ¿En qué puedo ayudarte hoy? 🇵🇪',
            timestamp: new Date()
          }
        ]);
      } catch (error) {
        console.error('Error al inicializar MIA:', error);
        setMessages([
          {
            role: 'assistant',
            content:
              '¡Hola! Soy MIA, tu asistente de turismo en Huancayo. Estoy aquí para ayudarte a descubrir los mejores lugares de nuestra hermosa ciudad.',
            timestamp: new Date()
          }
        ]);
      }
    };

    initMia();
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Actualizar la referencia cuando cambian los filtros
  useEffect(() => {
    filtersRef.current = currentFilters;
  }, [currentFilters]);

  // Función para enviar mensajes rápidos
  const sendQuickMessage = (message) => {
    setInputMessage(message);
    setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
  };

  // Hacer funciones globales disponibles para elementos HTML inyectados
  useEffect(() => {
    window.sendQuickMessage = sendQuickMessage;
    window.miaSetFilters = (search, category) => {
      try {
        if (category && typeof onSetCategory === 'function') {
          onSetCategory(mapBackendToFrontend(category));
        }
        if (search && typeof onSetSearch === 'function') {
          onSetSearch(search);
        }
      } catch (err) {
        console.warn('Error aplicando filtros desde la tarjeta:', err);
      }
    };
    return () => {
      delete window.sendQuickMessage;
      delete window.miaSetFilters;
    };
  }, [onSetCategory, onSetSearch]);





  const handleSendMessage = async (e) => {
    console.log('🎯 [MIA] handleSendMessage ejecutado, inputMessage:', inputMessage);
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) {
      console.log('⚠️ [MIA] Mensaje vacío o cargando, saliendo');
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Agregar mensaje del usuario
    const userMessageObj = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessageObj]);

    try {
      console.log('🔄 [MIA] Entrando al bloque try-catch principal');
      // Verificar caché primero
      const cachedResponse = miaApi.getCachedResponse(userMessage);
      if (cachedResponse) {
        // Agregar mensaje de respuesta en caché
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: cachedResponse,
            timestamp: new Date()
          }
        ]);
        
        // IMPORTANTE: También procesar lugares mencionados para respuestas en caché
        try {
          const extractRes = await fetch('/api/extract-places', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              response: cachedResponse,
              message: userMessage 
            })
          });
          
          if (extractRes.ok) {
            const extractData = await extractRes.json();
            
            // Procesar lugares mencionados igual que con respuestas nuevas
            console.log('MIA DEBUG CACHE - Datos extraidos:', extractData);
            if (Array.isArray(extractData.lugares_mencionados) && extractData.lugares_mencionados.length > 0) {
              console.log('MIA DEBUG CACHE - Lugares mencionados extraidos:', extractData.lugares_mencionados);
              // Activar filtro por lugares mencionados
              setMentionedPlacesFilter(extractData.lugares_mencionados);
              console.log('MIA DEBUG CACHE - setMentionedPlacesFilter llamado con:', extractData.lugares_mencionados);
              
              // Si hay múltiples lugares, usar búsqueda para mostrar todos
            if (extractData.lugares_mencionados.length > 1 && typeof onSetSearch === 'function') {
              const searchQuery = extractData.lugares_mencionados.join(' ');
              console.log('MIA Query de busqueda creada:', searchQuery);
              onSetSearch(searchQuery);
              console.log('MIA DEBUG CACHE - onSetSearch multiple:', searchQuery);
            } else if (extractData.lugares_mencionados.length === 1 && typeof onSetSearch === 'function') {
              console.log('MIA Aplicando busqueda para lugar unico:', extractData.lugares_mencionados[0]);
              onSetSearch(extractData.lugares_mencionados[0]);
              console.log('MIA DEBUG CACHE - onSetSearch unico:', extractData.lugares_mencionados[0]);
            }
          } else {
            console.log('MIA DEBUG CACHE - No hay lugares mencionados en cache');
            }
          }
        } catch (extractErr) {
          console.warn('Error extrayendo lugares de caché:', extractErr);
        }
        
        setIsLoading(false);
        return;
      }

      // Obtener estado del filtro manual
      const manualState = globalFilterState.getState();
      console.log('🌐 [MIA] Estado manual del filtro:', manualState);
      
      const requestBody = { 
        message: userMessage, 
        auto_filter: !manualState.isActive, // Solo auto-filtrar si no hay filtro manual activo
        manual_filter_active: manualState.isActive,
        current_manual_filter: manualState.currentFilter,
        stream: false,
        currentFilters: filtersRef.current || {},
        memory: miaApi.getConversationMemory()
      };
      console.log('📤 [MIA] Enviando petición al backend:', requestBody);
      
      // Delegar al backend Python: detección de intención, contexto y generación de respuesta
      console.log('🚀 [MIA] Enviando request al backend:', requestBody);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      console.log('📡 [MIA] Respuesta del backend recibida, status:', res.status);

      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
      }

      const data = await res.json();
      console.log('📦 [MIA] Datos recibidos del backend:', data);
      
      let generatedText = data.response || 'Lo siento, no pude generar una respuesta en este momento.';

      // Convertir imágenes en Markdown a etiquetas HTML <img>
      try {
        generatedText = generatedText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) => {
          const safeAlt = (alt || '').replace(/"/g, '&quot;');
          const safeUrl = (url || '').replace(/"/g, '&quot;');
          return `<img src="${safeUrl}" alt="${safeAlt}" style="max-width:100%;border-radius:8px;">`;
        });
      } catch (_) {}

      // Sincronizar filtros con la app según respuesta del backend
      try {
        const manualState = globalFilterState.getState();
        
        // 1) PRIORIDAD: Lugares mencionados específicos (siempre aplicar)
        console.log('🔍 [MIA] ANALISIS COMPLETO - Respuesta del backend:', data);
        console.log('🔍 [MIA] ANALISIS COMPLETO - Verificando lugares_mencionados:', {
          existe: 'lugares_mencionados' in data,
          esArray: Array.isArray(data.lugares_mencionados),
          valor: data.lugares_mencionados,
          longitud: data.lugares_mencionados?.length
        });
        
        if (Array.isArray(data.lugares_mencionados) && data.lugares_mencionados.length > 0) {
          console.log('🎯 [MIA] ===== LUGARES MENCIONADOS RECIBIDOS =====');
          console.log('🎯 [MIA] Lugares del backend:', data.lugares_mencionados);
          console.log('🎯 [MIA] Cantidad:', data.lugares_mencionados.length);
          console.log('🎯 [MIA] Detalles:', data.lugares_mencionados.map(l => ({
            nombre: l,
            normalizado: l?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '')
          })));
          console.log('🎯 [MIA] ===== APLICANDO FILTRO =====');
          
          // Activar filtro por lugares mencionados
          setMentionedPlacesFilter(data.lugares_mencionados);
          console.log('🔍 [MIA] LLAMANDO setMentionedPlacesFilter con:', data.lugares_mencionados);
          console.log('🔍 [MIA] NO usando onSetSearch para evitar interferencia con filtrado por lugares mencionados');
          
          // NOTA: No usamos onSetSearch aquí porque interfiere con el filtrado por lugares mencionados
          // El filtrado se maneja completamente a través de setMentionedPlacesFilter y useFiltrosAvanzados
        } else {
          console.log('🎯 [MIA] No se recibieron lugares mencionados del backend');
        }
        
        // 2) Solo aplicar filtros automáticos si no hay lugares mencionados
        if (!Array.isArray(data.lugares_mencionados) || data.lugares_mencionados.length === 0) {
          // Limpiar lugares mencionados si no los hay en esta respuesta
          clearMentionedPlacesFilter();
          
          if (!manualState.isActive) {
            // Categorías detectadas - ahora maneja múltiples
            if (data.categories && Array.isArray(data.categories) && data.categories.length > 0 && typeof onSetCategory === 'function') {
              const frontendCats = data.categories.map(cat => mapBackendToFrontend(cat));
              // Si hay múltiples categorías, usar onToggleCategory para cada una
              if (frontendCats.length > 1 && typeof onToggleCategory === 'function') {
                // Primero limpiar filtros si es necesario
                if (typeof onClearFilters === 'function') {
                  onClearFilters();
                }
                // Luego agregar cada categoría
                frontendCats.forEach(cat => {
                  if (cat) onToggleCategory(cat);
                });
              } else if (frontendCats.length === 1) {
                // Si es solo una categoría, usar el método original
                onSetCategory(frontendCats[0]);
              }
            } else if (data.category && typeof onSetCategory === 'function') {
              // Compatibilidad con respuestas antiguas
              const frontendCat = mapBackendToFrontend(data.category);
              onSetCategory(frontendCat);
            }
          }
          
          // Lugar específico detectado => usar como búsqueda (permitido siempre)
          const placeName = data.place_name;
          if (placeName && typeof onSetSearch === 'function') {
            onSetSearch(placeName);
          }
        }
        
        // 3) Limpiar filtros si se detecta esa intención (siempre permitido)
        if (data.clear_filters && typeof onClearFilters === 'function') {
          onClearFilters();
          clearMentionedPlacesFilter();
          // También limpiar filtro manual si está activo
          if (manualState.isActive) {
            globalFilterState.clearManualFilter();
          }
        }
      } catch (syncErr) {
        console.warn('No se pudieron sincronizar filtros con la app:', syncErr);
      }

      // Si el backend envía lugares sugeridos, agregamos tarjetas con imágenes (y también botones rápidos)
      if (Array.isArray(data.places) && data.places.length > 0) {
        const escapeHtml = (s) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const escAttr = (s) => (s || '').toString().replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const truncate = (s, n) => {
          const str = (s || '').toString();
          return str.length > n ? str.slice(0, n - 1) + '…' : str;
        };

        const cards = data.places.slice(0, 4).map((p) => {
          const name = p.nombre || p.name || 'Lugar';
          const desc = truncate(p.descripcion || p.description || '', 120);
          const cat = p.categoria || '';
          const img = p.imagen_url || '';
          const nameHtml = escapeHtml(name);
          const descHtml = escapeHtml(desc);
          const nameAttr = escAttr(name);
          const catAttr = escAttr(cat);
          const imgHtml = img ? `<img class="mia-place-image" src="${escAttr(img)}" alt="${nameAttr}" onerror="this.style.display='none'">` : '';
          return `
            <div class="mia-place-card" onclick="miaSetFilters('${nameAttr}','${catAttr}')">
              ${imgHtml}
              <div class="mia-place-title">${nameHtml}</div>
              ${desc ? `<div class="mia-place-desc">${descHtml}</div>` : ''}
            </div>
          `;
        }).join('');

        const gallery = `<div class="mia-places-grid">${cards}</div>`;
        if (!generatedText.includes('mia-places-grid')) {
          generatedText += gallery;
        }

        // Sugerencias rápidas basadas en lugares
        const quickSuggestions =
          '<div class="quick-suggestions">' +
          data.places
            .slice(0, 5)
            .map((p) => {
              const placeName = p.nombre || p.name || 'Lugar';
              const safeName = placeName.replace(/'/g, '&#39;');
              return `<button onclick="sendQuickMessage('${safeName}')">${placeName}</button>`;
            }) 
            .join('') +
          '</div>';
        if (!generatedText.includes('quick-suggestions')) {
          generatedText += quickSuggestions;
        }
      } else {
        // Sugerencias por defecto adaptadas al estado del filtro manual
        const manualState = globalFilterState.getState();
        let defaultSuggestions;
        
        if (manualState.isActive && manualState.currentFilter !== 'todos') {
          // Sugerencias específicas para el filtro manual activo
          const filterSuggestions = {
            'parques': [
              { text: 'Parque de la Identidad', emoji: '🌳' },
              { text: 'Parque Huancayo', emoji: '🌲' },
              { text: 'Cerrito de la Libertad', emoji: '⛰️' }
            ],
            'monumentos': [
              { text: 'Torre Torre', emoji: '🏛️' },
              { text: 'Catedral de Huancayo', emoji: '⛪' },
              { text: 'Plaza Constitución', emoji: '🏛️' }
            ],
            'restaurantes': [
              { text: 'Papa a la Huancaína', emoji: '🍽️' },
              { text: 'Restaurantes típicos', emoji: '🥘' },
              { text: 'Comida regional', emoji: '🍲' }
            ],
            'museos': [
              { text: 'Museo Salesiano', emoji: '🎨' },
              { text: 'Casa del Artesano', emoji: '🏺' },
              { text: 'Cultura Wanka', emoji: '🏛️' }
            ],
            'hoteles': [
              { text: 'Hoteles céntricos', emoji: '🏨' },
              { text: 'Hospedajes económicos', emoji: '🛏️' },
              { text: 'Alojamiento turístico', emoji: '🏠' }
            ]
          };
          
          const suggestions = filterSuggestions[manualState.currentFilter] || [];
          defaultSuggestions = '<div class="quick-suggestions">' +
            suggestions.map(s => `<button onclick="sendQuickMessage('${s.text}')">${s.emoji} ${s.text}</button>`).join('') +
            '</div>';
        } else {
          // Sugerencias generales
          defaultSuggestions =
            '<div class="quick-suggestions">' +
            "<button onclick=\"sendQuickMessage('Monumentos')\">🏛️ Monumentos</button>" +
            "<button onclick=\"sendQuickMessage('Restaurantes')\">🍽️ Restaurantes</button>" +
            "<button onclick=\"sendQuickMessage('Museos')\">🎨 Museos</button>" +
            "<button onclick=\"sendQuickMessage('Parques')\">🌳 Parques</button>" +
            '</div>';
        }
        
        if (!generatedText.includes('quick-suggestions')) {
          generatedText += defaultSuggestions;
        }
      }

      // Guardar en caché y memoria local (frontend)
      if (generatedText) {
        miaApi.cacheResponse(userMessage, generatedText);
        miaApi.saveToMemory(userMessage, generatedText);
      }

      // Agregar respuesta del asistente
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: generatedText,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error al obtener respuesta del backend:', error);
      const fallbackResponse =
        'Lo siento, estoy teniendo problemas para procesar tu pregunta. ¿Podrías intentar de nuevo? Mientras tanto, puedo ayudarte con información sobre turismo, gastronomía, historia y cultura de Huancayo. 🇵🇪';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date()
        }
      ]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Estilos CSS */}
      <MiaStyles />
      
      {/* Botón flotante */}
      <div className={`fixed bottom-6 z-30 ${
        isOpen ? 'right-6 sm:right-96' : 'right-6'
      }`}>
        <div className="relative">
          {/* Indicador de filtro manual activo o lugares mencionados */}
          {(manualFilterState.isActive || (manualFilterState.mentionedPlaces && manualFilterState.mentionedPlaces.length > 0)) && (
            <div className="absolute -top-2 -right-2 z-10">
              <div className={`text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse ${
                manualFilterState.mentionedPlaces && manualFilterState.mentionedPlaces.length > 0
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : 'bg-gradient-to-r from-orange-400 to-orange-500'
              }`}>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  {manualFilterState.mentionedPlaces && manualFilterState.mentionedPlaces.length > 0
                    ? `${manualFilterState.mentionedPlaces.length} lugar${manualFilterState.mentionedPlaces.length > 1 ? 'es' : ''}`
                    : 'Filtro'
                  }
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              console.log('🔘 [MIA] Botón flotante clickeado, isOpen actual:', isOpen);
              setIsOpen(!isOpen);
            }}
            className={`bg-gradient-to-r text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 mia-floating-button ${
              manualFilterState.mentionedPlaces && manualFilterState.mentionedPlaces.length > 0
                ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 animate-pulse'
                : manualFilterState.isActive 
                  ? 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 animate-pulse'
                  : 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            }`}
            style={{
              boxShadow: manualFilterState.mentionedPlaces && manualFilterState.mentionedPlaces.length > 0
                ? '0 4px 15px rgba(34, 197, 94, 0.4)'
                : manualFilterState.isActive 
                  ? '0 4px 15px rgba(249, 115, 22, 0.4)'
                  : '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            title={isOpen ? "Cerrar asistente MIA" : "Abrir asistente MIA"}
          >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
          </button>
        </div>
      </div>

      {/* Panel lateral del chat */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl z-40 flex flex-col mia-chat-modal pointer-events-auto border-l border-gray-200">
          {/* Overlay para móvil */}
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-30 pointer-events-auto" onClick={() => setIsOpen(false)} />
          {/* Panel de chat */}
          <div className="relative h-full w-full bg-white flex flex-col z-40">
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b border-gray-200 text-white transition-all duration-300 ${
              manualFilterState.mentionedPlaces && manualFilterState.mentionedPlaces.length > 0
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : manualFilterState.isActive 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🇵🇪</span>
                </div>
                <div>
                  <h3 className="font-semibold">MIA - Asistente de Huancayo</h3>
                  <p className="text-xs opacity-90">
                    {manualFilterState.isActive 
                      ? `Filtro: ${globalFilterState.getDynamicTitle().replace('Lugares Destacados', 'General')}`
                      : manualFilterState.mentionedPlaces && manualFilterState.mentionedPlaces.length > 0
                        ? `${manualFilterState.mentionedPlaces.length} lugar${manualFilterState.mentionedPlaces.length > 1 ? 'es' : ''} mencionado${manualFilterState.mentionedPlaces.length > 1 ? 's' : ''}`
                        : 'Tu guía turística personal'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {manualFilterState.isActive && (
                  <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs animate-pulse">
                    Filtro activo
                  </div>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                  title="Cerrar chat"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                    }`}
                  >
                    <div 
                      className="mia-message-content"
                      dangerouslySetInnerHTML={{ 
                        __html: message.content.replace(/\n/g, '<br/>') 
                      }}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                    <div className="mia-loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};



// Función de prueba temporal para simular filtrado
window.testMiaFiltering = function(lugaresAProbar = ["Parque Constitución", "parques", "Parque de la Identidad"]) {
  console.log('🧪 [PRUEBA MIA] === INICIANDO PRUEBA DE FILTRADO ===');
  console.log('🧪 [PRUEBA MIA] Lugares a probar:', lugaresAProbar);
  
  // Importar la función desde globalState
  import('../utils/globalState').then(({ setMentionedPlacesFilter }) => {
    console.log('🧪 [PRUEBA MIA] Aplicando filtro con lugares mencionados...');
    setMentionedPlacesFilter(lugaresAProbar);
    console.log('🧪 [PRUEBA MIA] Filtro aplicado. Revisa los logs del hook useFiltrosAvanzados.');
  }).catch(err => {
    console.error('🧪 [PRUEBA MIA] Error al importar globalState:', err);
  });
};

export default Mia;
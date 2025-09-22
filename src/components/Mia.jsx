import React, { useState, useEffect, useRef } from 'react';
import { globalFilterState, setMentionedPlacesFilter, clearMentionedPlacesFilter } from '../utils/globalState';
// Usando backend Python (Flask) para IA y datos; sin dependencias locales de IA

// Estilos CSS para MIA con paleta blanco y negro
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
        background: #000;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
      
      .quick-suggestions button:hover {
        transform: translateY(-2px);
        background: #333;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
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
        color: #000;
        font-weight: 600;
      }
      
      .mia-message-content h2, .mia-message-content h3, .mia-message-content h4 {
        margin: 12px 0 8px 0;
        font-weight: 600;
        color: #000;
      }
      
      .mia-loading-dots {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .mia-loading-dots div {
        width: 6px;
        height: 6px;
        background: #666;
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
    
    return () => {
      unsubscribe();
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

  const sendQuickMessage = (message) => {
    if (message?.trim()) {
      setInputMessage(message);
      setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
    }
  };

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
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: cachedResponse,
            timestamp: new Date()
          }
        ]);
        
        console.log('🎯 [MIA] Respuesta en caché mostrada sin filtros automáticos');
        setIsLoading(false);
        return;
      }

      // Obtener estado del filtro manual
      const manualState = globalFilterState.getState();
      console.log('🌐 [MIA] Estado manual del filtro:', manualState);
      
      const requestBody = { 
        message: userMessage, 
        auto_filter: !manualState.isActive,
        manual_filter_active: manualState.isActive,
        current_manual_filter: manualState.currentFilter,
        stream: false,
        currentFilters: filtersRef.current || {},
        memory: miaApi.getConversationMemory()
      };
      console.log('📤 [MIA] Enviando petición al backend:', requestBody);
      
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
        
        console.log('🔍 [MIA] ANALISIS COMPLETO - Respuesta del backend:', data);
        console.log('🔍 [MIA] ANALISIS COMPLETO - Verificando lugares_mencionados:', {
          existe: 'lugares_mencionados' in data,
          esArray: Array.isArray(data.lugares_mencionados),
          valor: data.lugares_mencionados,
          longitud: data.lugares_mencionados?.length
        });
        
        // FILTRADO AUTOMÁTICO RESTAURADO - Los lugares mencionados activan filtros automáticamente
        if (Array.isArray(data.lugares_mencionados) && data.lugares_mencionados.length > 0) {
          console.log('🎯 [MIA] Aplicando filtro automático para lugares mencionados:', data.lugares_mencionados);
          setMentionedPlacesFilter(data.lugares_mencionados);
        } else {
          console.log('🎯 [MIA] No hay lugares mencionados, limpiando filtros automáticos');
          clearMentionedPlacesFilter();
        }
        
        if (data.clear_filters && typeof onClearFilters === 'function') {
          onClearFilters();
          clearMentionedPlacesFilter();
          if (manualState.isActive) {
            globalFilterState.clearManualFilter();
          }
        }
      } catch (syncErr) {
        console.warn('No se pudieron sincronizar filtros con la app:', syncErr);
      }

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
        const manualState = globalFilterState.getState();
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
        
        const suggestions = manualState.isActive && manualState.currentFilter !== 'todos'
          ? filterSuggestions[manualState.currentFilter] || []
          : [
              { text: 'Monumentos', emoji: '🏛️' },
              { text: 'Restaurantes', emoji: '🍽️' },
              { text: 'Museos', emoji: '🎨' },
              { text: 'Parques', emoji: '🌳' }
            ];
        
        const defaultSuggestions = '<div class="quick-suggestions">' +
          suggestions.map(s => `<button onclick="sendQuickMessage('${s.text}')">${s.emoji} ${s.text}</button>`).join('') +
          '</div>';
        
        if (!generatedText.includes('quick-suggestions')) {
          generatedText += defaultSuggestions;
        }
      }

      if (generatedText) {
        miaApi.cacheResponse(userMessage, generatedText);
        miaApi.saveToMemory(userMessage, generatedText);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: generatedText,
        timestamp: new Date()
      }]);
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
    <div className="relative">
      {/* Estilos CSS */}
      <MiaStyles />
      
      {/* Botón flotante */}
      <button 
        onClick={() => {
          console.log('🔘 [MIA] Botón flotante clickeado, isOpen actual:', isOpen);
          setIsOpen(true);
        }}
        className="fixed bottom-7 right-3 w-16 h-16 bg-black rounded-full shadow-xl transition-all duration-300 z-50 flex items-center justify-center group hover:scale-110 hover:shadow-2xl" 
        style={{ boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' }}
        title="Abrir asistente MIA"
      > 
        <img 
          src="/logo/memoria_logo.svg" 
          alt="Logo Memoria" 
          className="w-10 h-10 object-contain" 
        /> 
      </button> 

      {/* Modal del chat */}
      {isOpen && ( 
        <div 
          className="fixed bottom-7 right-3 w-80 h-96 bg-white rounded-xl shadow-2xl z-50 flex flex-col transform transition-all duration-300 scale-100" 
          style={{ boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' }} 
        > 
          {/* Header del modal */} 
          <div className="bg-black text-white px-4 py-3 rounded-t-xl flex items-center justify-between"> 
            <h2 className="text-lg font-semibold">MIA</h2> 
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors" 
            > 
              ✕ 
            </button> 
          </div> 

          {/* Contenedor de mensajes */} 
          <div className="flex-1 p-4 overflow-y-auto bg-white"> 
            <div className="space-y-3"> 
              {messages.map((message, index) => ( 
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} 
                > 
                  <div 
                    className={` 
                      max-w-xs px-4 py-2 rounded-2xl text-sm 
                      ${message.role === 'user' 
                        ? 'bg-black text-white rounded-br-md' 
                        : 'bg-gray-100 text-black border border-gray-200 rounded-bl-md' 
                      } 
                    `} 
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
                  <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-gray-100 text-black border border-gray-200 rounded-bl-md"> 
                    <span className="italic">MIA está escribiendo...</span> 
                  </div> 
                </div> 
              )} 
              <div ref={messagesEndRef} /> 
            </div> 
          </div> 

          {/* Input para escribir mensajes */} 
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl"> 
            <div className="flex items-end space-x-3"> 
              <input 
                type="text" 
                value={inputMessage} 
                onChange={(e) => setInputMessage(e.target.value)} 
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }} 
                placeholder="Escribe tu mensaje..." 
                className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-2 focus:border-black focus:outline-none transition-colors text-sm" 
                disabled={isLoading} 
              /> 
              <button 
                onClick={handleSendMessage} 
                disabled={isLoading || inputMessage.trim() === ''} 
                className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" 
              > 
                ➤ 
              </button> 
            </div> 
          </div> 
        </div> 
      )} 
    </div>
  );
};





export default Mia;
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUp,
  X,
  MessageSquare,
  Paperclip,
  Smile,
  Bot,
  FileText,
  Image as ImageIcon,
  Trash2,
  ChevronDown,
  Mic,
  Play,
  Pause
} from 'lucide-react';
import { globalFilterState, setMentionedPlacesFilter, clearMentionedPlacesFilter } from '../utils/globalState';

// --- API y Lógica de Negocio ---
const miaApi = {
  getStats: async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }
    return { total_lugares: 0, total_imagenes: 0, categorias: [], estado: 'desconectado' };
  },
  getCachedResponse: (message) => {
    const cacheKey = `mia_cache_${message.toLowerCase()}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) return data.response;
    }
    return null;
  },
  cacheResponse: (message, response) => {
    const cacheKey = `mia_cache_${message.toLowerCase()}`;
    const data = { response: response, timestamp: Date.now() };
    localStorage.setItem(cacheKey, JSON.stringify(data));
  },
  getConversationMemory: () => {
    try {
      const memory = localStorage.getItem('mia_conversation_memory');
      return memory ? JSON.parse(memory) : [];
    } catch (error) {
      return [];
    }
  },
  saveToMemory: (message, response) => {
    try {
      let memory = miaApi.getConversationMemory();
      memory.push({ message: message, response: response, timestamp: Date.now() });
      if (memory.length > 10) memory = memory.slice(-10);
      localStorage.setItem('mia_conversation_memory', JSON.stringify(memory));
    } catch (error) {
      console.error('Error guardando memoria:', error);
    }
  }
};

const Mia = ({ isOpen, setIsOpen, onSetCategory, onSetSearch, currentFilters, onClearFilters, onToggleCategory, chatState, setChatState }) => {
  // --- ESTADOS ---
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy MIA, tu asistente de turismo en Huancayo. ¿En qué puedo ayudarte hoy?",
      sender: 'bot',
      type: 'text',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // --- ESTADOS PARA AUDIO ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioInterval, setAudioInterval] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const filtersRef = useRef(currentFilters);
  const touchStartRef = useRef(null); // Para gestos táctiles

  // Forzar modo oscuro
  const isDarkMode = true;

  const emojis = ["😀", "😃", "😄", "😅", "😂", "🤣", "😊", "🥰", "😍", "😘", "😜", "😎", "🤩", "🥳", "🤔", "🤫", "🙄", "😣", "😢", "😭", "😤", "😠", "🤯", "🥶", "😱", "👋", "👍", "👎", "👏", "🙏", "💪", "🔥", "✨", "❤️", "💔", "💯"];

  // Detectar Móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll al fondo
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages, isTyping, selectedFile, isRecording, isOpen, chatState]);

  // Actualizar ref de filtros
  useEffect(() => {
    filtersRef.current = currentFilters;
  }, [currentFilters]);

  // Lógica del Temporizador de Grabación
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setAudioInterval(interval);
    } else {
      clearInterval(audioInterval);
      setRecordingDuration(0);
    }
    return () => clearInterval(audioInterval);
  }, [isRecording]);

  const startHeightRef = useRef(0);
  const [dynamicHeight, setDynamicHeight] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  // --- GESTOS TÁCTILES Y MOUSE (DRAG) ---
  const handleDragStart = (clientY) => {
    touchStartRef.current = clientY;

    // Calcular altura inicial en píxeles
    const currentHeight = chatState === 'full'
      ? window.innerHeight * 0.92
      : window.innerHeight * 0.45;

    startHeightRef.current = currentHeight;
    setIsDragging(true);
  };

  const handleDragMove = (clientY) => {
    if (!touchStartRef.current) return;

    const diff = clientY - touchStartRef.current;
    const newHeight = startHeightRef.current - diff;

    // Límites
    const maxHeight = window.innerHeight * 0.92;

    if (newHeight > maxHeight + 50) return; // Resistencia superior

    setDynamicHeight(newHeight);
  };

  const handleDragEnd = (clientY) => {
    if (!touchStartRef.current) return;
    const diff = clientY - touchStartRef.current;

    console.log('Drag End:', { diff, chatState });

    // Resetear
    touchStartRef.current = null;
    setDynamicHeight(null);
    setIsDragging(false);

    // Lógica Unificada: Tap vs Drag
    const ABS_DIFF = Math.abs(diff);

    if (ABS_DIFF < 10) {
      // --- TAP (Click) ---
      console.log('Detectado TAP -> Toggle');
      setChatState(prev => prev === 'full' ? 'half' : 'full');
    }
    else {
      // --- DRAG (Snap al más cercano) ---
      const finalHeight = startHeightRef.current - diff;
      const threshold = window.innerHeight * 0.6; // Punto medio aproximado

      if (finalHeight > threshold) {
        setChatState('full');
      } else {
        if (finalHeight < window.innerHeight * 0.25) {
          setChatState('closed');
        } else {
          setChatState('half');
        }
      }
    }
  };

  // Touch Handlers
  const handleTouchStart = (e) => handleDragStart(e.touches[0].clientY);
  const handleTouchMove = (e) => handleDragMove(e.touches[0].clientY);
  const handleTouchEnd = (e) => handleDragEnd(e.changedTouches[0].clientY);

  // Mouse Handlers
  const handleMouseDown = (e) => {
    handleDragStart(e.clientY);
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const handleWindowMouseMove = (e) => {
    handleDragMove(e.clientY);
  };

  const handleWindowMouseUp = (e) => {
    handleDragEnd(e.clientY);
    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
  };

  const [isDragging, setIsDragging] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setShowEmojiPicker(false);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // 1. Manejo de Audio (Simulado por ahora)
    if (isRecording) {
      const newAudioMessage = {
        id: Date.now(),
        sender: 'user',
        type: 'audio',
        audio: {
          duration: formatDuration(recordingDuration),
          seconds: recordingDuration
        },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, newAudioMessage]);
      setIsRecording(false);

      // Respuesta simulada al audio
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: Date.now() + 10,
          text: "He escuchado tu mensaje. Por ahora solo puedo procesar texto, pero estoy aprendiendo.",
          sender: 'bot',
          type: 'text',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 1500);
      return;
    }

    if (inputValue.trim() === "" && !selectedFile) return;

    // 2. Manejo de Archivos
    if (selectedFile) {
      const newFileMessage = {
        id: Date.now(),
        text: null,
        file: {
          name: selectedFile.name,
          size: (selectedFile.size / 1024).toFixed(1) + ' KB',
          type: selectedFile.type.startsWith('image/') ? 'image' : 'doc'
        },
        sender: 'user',
        type: 'file',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, newFileMessage]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    // 3. Manejo de Texto (Conexión con Backend)
    if (inputValue.trim() !== "") {
      const userMessage = inputValue;
      const newTextMessage = {
        id: Date.now() + (selectedFile ? 1 : 0),
        text: userMessage,
        sender: 'user',
        type: 'text',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, newTextMessage]);
      setInputValue("");
      setIsTyping(true);
      setShowEmojiPicker(false);
      setIsLoading(true);

      try {
        // Verificar caché
        const cached = miaApi.getCachedResponse(userMessage);
        if (cached) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now() + 10,
              text: cached,
              sender: 'bot',
              type: 'text',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
            setIsLoading(false);
          }, 500);
          return;
        }

        // Llamada a API
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            context: {
              filters: filtersRef.current,
              history: miaApi.getConversationMemory()
            }
          }),
        });

        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        const data = await res.json();
        const generatedText = data.response || 'Lo siento, no pude generar una respuesta.';

        // Procesar filtros mencionados
        if (Array.isArray(data.lugares_mencionados) && data.lugares_mencionados.length > 0) {
          setMentionedPlacesFilter(data.lugares_mencionados);
        } else {
          clearMentionedPlacesFilter();
        }
        if (data.clear_filters && onClearFilters) {
          onClearFilters();
          clearMentionedPlacesFilter();
        }

        // Guardar memoria
        miaApi.cacheResponse(userMessage, generatedText);
        miaApi.saveToMemory(userMessage, generatedText);

        setMessages(prev => [...prev, {
          id: Date.now() + 10,
          text: generatedText,
          sender: 'bot',
          type: 'text',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          id: Date.now() + 10,
          text: 'Lo siento, tuve un problema de conexión. ¿Podrías intentar de nuevo?',
          sender: 'bot',
          type: 'text',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputValue((prev) => prev + emoji);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleAudioPlay = (id) => {
    setPlayingAudioId(prev => prev === id ? null : id);
  };

  // --- ESTILOS ---
  const bgMain = isDarkMode ? 'bg-black' : 'bg-white';
  const bgGlass = isDarkMode ? 'bg-[#1C1C1E]/85' : 'bg-white/85';
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderSub = isDarkMode ? 'border-white/5' : 'border-gray-200/50';

  const bubbleUserBg = isDarkMode ? 'bg-white' : 'bg-black';
  const bubbleUserText = isDarkMode ? 'text-black' : 'text-white';
  const bubbleBotBg = isDarkMode ? 'bg-[#262626]' : 'bg-[#E9E9EB]';
  const bubbleBotText = isDarkMode ? 'text-white' : 'text-black';

  // Contenedor del Chat (Widget)
  const containerClasses = isMobile
    ? `fixed bottom-0 left-0 right-0 z-[9999] flex flex-col ${isDragging ? '' : 'transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)'} 
       ${bgMain} rounded-t-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden
       ${isOpen ? 'translate-y-0' : 'translate-y-[120%]'} 
       ${chatState === 'full' ? 'h-[92vh]' : 'h-[45vh]'}`
    : `fixed bottom-4 right-16 w-[380px] h-[500px] bg-[#1C1C1E]/85 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/5 origin-bottom-right transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`;

  // Estilo dinámico para el arrastre (Altura)
  const containerStyle = isMobile && isDragging && dynamicHeight ? {
    height: `${dynamicHeight}px`
  } : {};

  return (
    <div className={containerClasses} style={containerStyle}>

      {/* Handle para Móvil (Barra gris) */}
      {isMobile && (
        <div
          className="w-full h-8 absolute top-0 left-0 z-30 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-12 h-1.5 bg-gray-400/30 rounded-full backdrop-blur-sm" />
        </div>
      )}

      {/* Header Horizontal Compacto */}
      <div className={`${bgGlass} backdrop-blur-md border-b ${borderSub} p-4 flex items-center justify-between z-20 shadow-sm sm:shadow-none transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Bot size={20} className={textMain} />
          </div>
          <div className="flex flex-col">
            <h3 className={`font-semibold text-sm ${textMain} leading-tight`}>MIA Asistente</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-[11px] ${textSub} font-medium`}>En línea</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className={`p-2 rounded-full transition-all active:scale-95 ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {isMobile ? <ChevronDown size={20} /> : <X size={18} />}
        </button>
      </div>

      {/* Mensajes */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-hide bg-transparent"
        style={{ paddingTop: '10px' }}
        onClick={() => setShowEmojiPicker(false)}
      >
        <div className={`text-center text-[10px] ${textSub} font-medium my-4 uppercase tracking-wide`}>
          Hoy
        </div>

        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const isLast = index === messages.length - 1;
          const isAudioPlaying = playingAudioId === msg.id;

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}>

              {/* TEXTO */}
              {msg.type === 'text' && (
                <div className={`px-4 py-2.5 max-w-[85%] text-[15px] leading-relaxed relative ${isUser ? `${bubbleUserBg} ${bubbleUserText} rounded-[1.2rem] rounded-tr-sm` : `${bubbleBotBg} ${bubbleBotText} rounded-[1.2rem] rounded-tl-sm`}`}>
                  {msg.text}
                </div>
              )}

              {/* ARCHIVO */}
              {msg.type === 'file' && (
                <div className={`p-3 max-w-[85%] rounded-[1.2rem] flex items-center gap-3 border ${isUser ? `${bubbleUserBg} ${bubbleUserText} rounded-tr-sm ${isDarkMode ? 'border-transparent' : 'border-black/10'}` : `${bubbleBotBg} ${bubbleBotText} rounded-tl-sm border-transparent`}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-current opacity-20' : isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}>
                    {msg.file.type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate w-32">{msg.file.name}</span>
                    <span className={`text-[10px] opacity-70`}>{msg.file.size} • {msg.file.type.toUpperCase()}</span>
                  </div>
                </div>
              )}

              {/* AUDIO */}
              {msg.type === 'audio' && (
                <div className={`p-3 pr-4 rounded-[1.2rem] flex items-center gap-3 min-w-[160px] ${isUser ? `${bubbleUserBg} ${bubbleUserText} rounded-tr-sm` : `${bubbleBotBg} ${bubbleBotText} rounded-tl-sm`}`}>
                  <button
                    onClick={() => toggleAudioPlay(msg.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isUser ? 'bg-gray-200/20 hover:bg-gray-200/30 text-current' : 'bg-white hover:bg-gray-50 text-black shadow-sm'}`}
                  >
                    {isAudioPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-0.5 h-4 w-24 opacity-60">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full bg-current transition-all duration-300 ${isAudioPlaying ? 'animate-pulse' : ''}`}
                          style={{
                            height: isAudioPlaying ? `${Math.random() * 100}%` : `${30 + Math.random() * 50}%`,
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium opacity-70">{msg.audio.duration}</span>
                  </div>
                </div>
              )}

              {isUser && isLast && <span className={`text-[10px] ${textSub} font-medium mt-1 mr-1`}>Entregado</span>}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start">
            <div className={`px-4 py-3 rounded-[1.2rem] rounded-tl-sm flex gap-1 items-center h-10 w-16 justify-center ${bubbleBotBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.15s] ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.3s] ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'}`}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-3 border-t ${borderSub} z-20 relative transition-colors duration-300 pb-3 ${bgGlass} backdrop-blur-md`}>

        {/* Preview File */}
        {selectedFile && !isRecording && (
          <div className="absolute bottom-full left-0 w-full px-3 mb-2 animate-in slide-in-from-bottom-2 duration-200">
            <div className={`${isDarkMode ? 'bg-[#1c1c1e] border-gray-700' : 'bg-white border-gray-200'} border rounded-[1.2rem] shadow-lg p-2 flex items-center justify-between`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 shrink-0">
                  {selectedFile.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                </div>
                <span className={`text-xs font-medium truncate max-w-[180px] ${textMain}`}>{selectedFile.name}</span>
              </div>
              <button onClick={removeSelectedFile} className="p-1.5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-full transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && !isRecording && (
          <div className="absolute bottom-full left-0 w-full px-3 mb-2 animate-in slide-in-from-bottom-2 duration-200">
            <div className={`${isDarkMode ? 'bg-[#1c1c1e]/95 border-gray-700 text-white' : 'bg-white/95 border-gray-200 text-black'} backdrop-blur-xl border rounded-[1.5rem] shadow-lg p-3 grid grid-cols-8 gap-1 h-40 overflow-y-auto scrollbar-hide`}>
              {emojis.map((emoji) => (
                <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} className={`text-xl p-1 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>{emoji}</button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end gap-2">

          {/* MODO GRABACIÓN: Botón Cancelar */}
          {isRecording ? (
            <button
              type="button"
              onClick={handleCancelRecording}
              className="p-2 transition-colors mb-0.5 rounded-full text-red-500 hover:bg-red-500/10"
            >
              <Trash2 size={22} strokeWidth={1.5} />
            </button>
          ) : (
            <>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files[0]) { setSelectedFile(e.target.files[0]); setShowEmojiPicker(false); } }} />
              <button type="button" onClick={() => fileInputRef.current.click()} className={`p-2 transition-colors mb-0.5 rounded-full ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}><Paperclip size={22} strokeWidth={1.5} /></button>
            </>
          )}

          <div className="flex-1 relative">
            {isRecording ? (
              // UI DE GRABACIÓN
              <div className={`w-full h-[42px] border ${isDarkMode ? 'bg-[#1c1c1e] border-gray-700' : 'bg-gray-50 border-gray-300'} rounded-[1.2rem] px-4 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Grabando... {formatDuration(recordingDuration)}</span>
                </div>
                <span className={`text-xs ${textSub}`}>Suelta para enviar</span>
              </div>
            ) : (
              // UI DE TEXTO NORMAL
              <>
                <input
                  type="text"
                  value={inputValue}
                  onClick={() => setShowEmojiPicker(false)}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={selectedFile ? "Añadir un comentario..." : "Escribe un mensaje..."}
                  className={`w-full border ${isDarkMode ? 'bg-[#1c1c1e] border-gray-700 text-white placeholder-gray-500 focus:border-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-100'} text-[15px] rounded-[1.2rem] px-4 py-2 pr-10 focus:outline-none focus:ring-2 transition-all`}
                />
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`absolute right-2 top-2.5 transition-colors ${showEmojiPicker ? 'text-blue-500' : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}><Smile size={20} strokeWidth={2} /></button>
              </>
            )}
          </div>

          {/* BOTÓN ENVIAR vs MICRÓFONO */}
          {(!inputValue.trim() && !selectedFile && !isRecording) ? (
            <button
              type="button"
              onClick={handleStartRecording}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 mb-0.5 shadow-sm ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-black'}`}
            >
              <Mic size={18} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isRecording && !inputValue.trim() && !selectedFile}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 mb-0.5 shadow-sm ${(inputValue.trim() || selectedFile || isRecording) ? (isDarkMode ? 'bg-white text-black hover:scale-105' : 'bg-black text-white hover:scale-105') : (isDarkMode ? 'bg-gray-800 text-gray-600 cursor-default' : 'bg-gray-200 text-gray-400 cursor-default')}`}
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          )}
        </form>
      </div>
    </div >
  );
};

export default Mia;

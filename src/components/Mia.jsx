import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowUp,
    X,
    Paperclip,
    Smile,
    Bot,
    FileText,
    Image as ImageIcon,
    Trash2,
    ChevronDown,
    Mic
} from 'lucide-react';

const Mia = ({ isOpen, setIsOpen, chatState, setChatState }) => {
    // Estados principales
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: '¡Hola! Soy MIA, tu asistente de turismo en Huancayo. ¿En qué puedo ayudarte hoy?',
            sender: 'bot',
            type: 'text',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const touchStartRef = useRef(null);

    const isDarkMode = true;
    const emojis = ['😀', '😃', '😄', '😅', '😂', '🤣', '😊', '🥰', '😍', '😘', '😜', '😎', '🤩', '🥳', '🤔', '🤫', '🙄', '😣', '😢', '😭', '😤', '😠', '🤯', '🥶', '😱', '👋', '👍', '👎', '👏', '🙏', '💪', '🔥', '✨', '❤️', '💔', '💯'];

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Scroll al fondo
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        setTimeout(scrollToBottom, 100);
    }, [messages, isTyping, selectedFile, isRecording, isOpen, chatState]);

    // Gestos táctiles (drag)
    const handleDragStart = (clientY) => {
        touchStartRef.current = clientY;
    };

    const handleDragEnd = (clientY) => {
        if (!touchStartRef.current) return;
        const diff = clientY - touchStartRef.current;
        touchStartRef.current = null;

        const ABS_DIFF = Math.abs(diff);

        if (ABS_DIFF < 10) {
            // TAP - Toggle chat state
            setChatState(prev => prev === 'full' ? 'half' : 'full');
        } else {
            // DRAG - determinar estado según distancia
            if (diff < -100) setChatState('full');
            else if (diff > 100) setChatState('closed');
            else setChatState('half');
        }
    };

    const handleTouchStart = (e) => handleDragStart(e.touches[0].clientY);
    const handleTouchEnd = (e) => handleDragEnd(e.changedTouches[0].clientY);

    const handleMouseDown = (e) => {
        handleDragStart(e.clientY);
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
    };

    const handleWindowMouseMove = (e) => {
        // Opcional: implementar feedback visual durante drag
    };

    const handleWindowMouseUp = (e) => {
        handleDragEnd(e.clientY);
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
    };

    // Enviar mensaje - TODO: Conectar con tu servicio de IA
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (inputValue.trim() === '' && !selectedFile && !isRecording) return;

        // Mensaje de usuario
        const userMessage = inputValue.trim();
        if (userMessage) {
            const newTextMessage = {
                id: Date.now(),
                text: userMessage,
                sender: 'user',
                type: 'text',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, newTextMessage]);
            setInputValue('');
            setIsTyping(true);

            // TODO: Aquí conecta tu servicio de IA real
            // Ejemplo: const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: userMessage }) });
            // const data = await response.json();

            // Placeholder: respuesta simulada
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 10,
                    text: 'Conecta tu servicio de IA aquí para obtener respuestas reales.',
                    sender: 'bot',
                    type: 'text',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                setIsTyping(false);
            }, 1000);
        }

        // Manejo de archivo
        if (selectedFile) {
            const newFileMessage = {
                id: Date.now(),
                file: {
                    name: selectedFile.name,
                    size: (selectedFile.size / 1024).toFixed(1) + ' KB',
                    type: selectedFile.type.startsWith('image/') ? 'image' : 'doc'
                },
                sender: 'user',
                type: 'file',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, newFileMessage]);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }

        // Resetear grabación si estaba activa
        if (isRecording) {
            setIsRecording(false);
        }

        setShowEmojiPicker(false);
    };

    const handleEmojiClick = (emoji) => {
        setInputValue(prev => prev + emoji);
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Estilos
    const bgMain = isDarkMode ? 'bg-black' : 'bg-white';
    const bgGlass = isDarkMode ? 'bg-[#1C1C1E]/85' : 'bg-white/85';
    const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
    const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const borderSub = isDarkMode ? 'border-white/5' : 'border-gray-200/50';
    const bubbleUserBg = isDarkMode ? 'bg-white' : 'bg-black';
    const bubbleUserText = isDarkMode ? 'text-black' : 'text-white';
    const bubbleBotBg = isDarkMode ? 'bg-[#262626]' : 'bg-[#E9E9EB]';
    const bubbleBotText = isDarkMode ? 'text-white' : 'text-black';

    const containerClasses = isMobile
        ? `fixed bottom-0 left-0 right-0 z-[1000] flex flex-col transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) 
       ${bgMain} rounded-t-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden
       ${isOpen ? 'translate-y-0' : 'translate-y-[120%]'} 
       ${chatState === 'full' ? 'h-[92vh]' : 'h-[45vh]'}`
        : `fixed bottom-4 right-16 w-[380px] h-[500px] bg-[#1C1C1E]/85 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/5 origin-bottom-right transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`;

    return (
        <div className={containerClasses}>
            {/* Handle para móvil */}
            {isMobile && (
                <div
                    className="w-full h-8 absolute top-0 left-0 z-30 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                >
                    <div className="w-12 h-1.5 bg-gray-400/30 rounded-full backdrop-blur-sm" />
                </div>
            )}

            {/* Header */}
            <div className={`${bgGlass} backdrop-blur-md border-b ${borderSub} p-4 ${isMobile ? 'pt-10' : ''} flex items-center justify-between z-20 shadow-sm sm:shadow-none transition-colors duration-300`}>
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
                    onClick={() => { setIsOpen(false); setChatState('closed'); }}
                    className={`p-2 rounded-full transition-all active:scale-95 ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    {isMobile ? <ChevronDown size={20} /> : <X size={18} />}
                </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-hide bg-transparent" style={{ paddingTop: '10px' }} onClick={() => setShowEmojiPicker(false)}>
                <div className={`text-center text-[10px] ${textSub} font-medium my-4 uppercase tracking-wide`}>Hoy</div>

                {messages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    const isLast = index === messages.length - 1;

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
                                        <span className="text-[10px] opacity-70">{msg.file.size} • {msg.file.type.toUpperCase()}</span>
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
                {selectedFile && (
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
                {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 w-full px-3 mb-2 animate-in slide-in-from-bottom-2 duration-200">
                        <div className={`${isDarkMode ? 'bg-[#1c1c1e]/95 border-gray-700 text-white' : 'bg-white/95 border-gray-200 text-black'} backdrop-blur-xl border rounded-[1.5rem] shadow-lg p-3 grid grid-cols-8 gap-1 h-40 overflow-y-auto scrollbar-hide`}>
                            {emojis.map(emoji => (
                                <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} className={`text-xl p-1 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>{emoji}</button>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files[0]) { setSelectedFile(e.target.files[0]); setShowEmojiPicker(false); } }} />
                    <button type="button" onClick={() => fileInputRef.current.click()} className={`p-2 transition-colors mb-0.5 rounded-full ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}><Paperclip size={22} strokeWidth={1.5} /></button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onClick={() => setShowEmojiPicker(false)}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={selectedFile ? 'Añadir un comentario...' : 'Escribe un mensaje...'}
                            className={`w-full border ${isDarkMode ? 'bg-[#1c1c1e] border-gray-700 text-white placeholder-gray-500 focus:border-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-100'} text-[15px] rounded-[1.2rem] px-4 py-2 pr-10 focus:outline-none focus:ring-2 transition-all`}
                        />
                        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`absolute right-2 top-2.5 transition-colors ${showEmojiPicker ? 'text-blue-500' : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}><Smile size={20} strokeWidth={2} /></button>
                    </div>

                    {(!inputValue.trim() && !selectedFile) ? (
                        <button
                            type="button"
                            onClick={() => setIsRecording(true)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 mb-0.5 shadow-sm ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-black'}`}
                        >
                            <Mic size={18} strokeWidth={2.5} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!inputValue.trim() && !selectedFile}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 mb-0.5 shadow-sm ${(inputValue.trim() || selectedFile) ? (isDarkMode ? 'bg-white text-black hover:scale-105' : 'bg-black text-white hover:scale-105') : (isDarkMode ? 'bg-gray-800 text-gray-600 cursor-default' : 'bg-gray-200 text-gray-400 cursor-default')}`}
                        >
                            <ArrowUp size={18} strokeWidth={2.5} />
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Mia;
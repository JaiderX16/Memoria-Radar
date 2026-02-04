import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowUp,
    Paperclip,
    Smile,
    FileText,
    Image as ImageIcon,
    Trash2,
    Mic
} from 'lucide-react';

const MiaMobile = ({ isOpen, setIsOpen, chatState, setChatState }) => {
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
    const [isRecording, setIsRecording] = useState(false);

    // Estados para detección de teclado
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const emojis = ['😀', '😃', '😄', '😅', '😂', '🤣', '😊', '🥰', '😍', '😘', '😜', '😎', '🤩', '🥳', '🤔', '🤫', '🙄', '😣', '😢', '😭', '😤', '😠', '🤯', '🥶', '😱', '👋', '👍', '👎', '👏', '🙏', '💪', '🔥', '✨', '❤️', '💔', '💯'];

    // Detectar teclado en móvil
    useEffect(() => {
        const initialHeight = window.innerHeight;
        setViewportHeight(initialHeight);

        const handleResize = () => {
            const currentHeight = window.visualViewport?.height || window.innerHeight;
            const heightDiff = initialHeight - currentHeight;

            // Si la diferencia es mayor a 150px, asumimos que el teclado está visible
            if (heightDiff > 150) {
                setKeyboardVisible(true);
                setViewportHeight(currentHeight);
            } else {
                setKeyboardVisible(false);
                setViewportHeight(initialHeight);
            }
        };

        // Escuchar cambios en el visual viewport (más preciso para teclados)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            return () => window.visualViewport.removeEventListener('resize', handleResize);
        } else {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    // Scroll al fondo
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 100);
        }
    }, [messages, isTyping, selectedFile, isRecording, isOpen]);

    // Enviar mensaje
    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (inputValue.trim() === '' && !selectedFile && !isRecording) return;

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

        if (isRecording) setIsRecording(false);
        setShowEmojiPicker(false);
    };

    const handleEmojiClick = (emoji) => setInputValue(prev => prev + emoji);
    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Calcular altura basada en el estado (para cuando no se está arrastrando)
    const getTargetHeight = () => {
        if (chatState === 'closed') return 0;
        if (keyboardVisible) return viewportHeight;
        if (chatState === 'full') return window.innerHeight * 0.92;
        return window.innerHeight * 0.45;
    };

    // Estado para la altura dinámica (animaciones y drag)
    const [currentHeight, setCurrentHeight] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const dragStartHeight = useRef(0);

    // Sincronizar altura cuando cambia el estado (y no se está arrastrando)
    useEffect(() => {
        if (!isDragging) {
            setCurrentHeight(getTargetHeight());
        }
    }, [chatState, keyboardVisible, viewportHeight, isDragging]);

    // Sincronizar chatState con isOpen (para asegurar consistencia)
    useEffect(() => {
        if (chatState === 'closed') {
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    }, [chatState, setIsOpen]);

    // Manejadores de Pointer (Mouse + Touch unificados)
    const handlePointerDown = (e) => {
        // Solo permitir botón izquierdo del mouse o toque
        if (e.button !== 0) return;

        setIsDragging(true);
        dragStartY.current = e.clientY;
        dragStartHeight.current = currentHeight;

        // Capturar el puntero para que no se pierda el arrastre si se mueve rápido
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevenir selección de texto o comportamientos raros

        const currentY = e.clientY;
        const deltaY = dragStartY.current - currentY; // Arriba es positivo
        const newHeight = dragStartHeight.current + deltaY;

        const maxHeight = window.innerHeight * 0.95;
        const minHeight = 0;

        if (newHeight >= minHeight && newHeight <= maxHeight) {
            setCurrentHeight(newHeight);
        }
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);

        // Liberar captura
        e.currentTarget.releasePointerCapture(e.pointerId);

        const screenHeight = window.innerHeight;
        const heightPercentage = currentHeight / screenHeight;

        // Lógica de Snap
        if (heightPercentage < 0.25) {
            setChatState('closed');
            setIsOpen(false);
        } else if (heightPercentage < 0.70) {
            setChatState('half');
        } else {
            setChatState('full');
        }
    };

    if (!isOpen && chatState === 'closed' && currentHeight === 0) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-gray-200/50 dark:border-white/10 overflow-hidden bg-white dark:bg-[#121214]`}
            style={{
                height: `${currentHeight}px`,
                transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
            }}
        >
            {/* Handle visual + Área de arrastre */}
            <div
                className="w-full flex justify-center pt-6 pb-4 cursor-grab active:cursor-grabbing z-50"
                style={{ touchAction: 'none' }} // CRÍTICO: Le dice al navegador que no haga scroll nativo
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp} // Manejar interrupciones
            >
                <div className="w-16 h-1.5 rounded-full bg-gray-300/50 dark:bg-white/20 pointer-events-none" />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                <div className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-hide py-4" onClick={() => setShowEmojiPicker(false)}>
                    <div className={`text-center text-[10px] text-gray-500 dark:text-gray-400 font-bold my-4 uppercase tracking-widest opacity-50`}>HOY</div>

                    {messages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}>
                                {msg.type === 'text' && (
                                    <div className={`px-4 py-3 max-w-[85%] text-[15px] leading-relaxed ${isUser ? 'bg-black text-white dark:bg-[#262626] dark:text-white rounded-2xl rounded-tr-none' : 'bg-[#E9E9EB] text-black dark:bg-[#262626] dark:text-white rounded-2xl rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                )}
                                {msg.type === 'file' && (
                                    <div className={`p-3 max-w-[85%] rounded-2xl flex items-center gap-3 ${isUser ? 'bg-black text-white dark:bg-[#262626] dark:text-white rounded-tr-none' : 'bg-[#E9E9EB] text-black dark:bg-[#262626] dark:text-white rounded-tl-none'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-white/10' : 'bg-white dark:bg-gray-700/50'}`}>
                                            {msg.file.type === 'image' ? <ImageIcon size={20} /> : <FileText size={16} />}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-medium truncate w-32">{msg.file.name}</span>
                                            <span className="text-[10px] opacity-70">{msg.file.size}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {isTyping && (
                        <div className="flex items-start">
                            <div className={`px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-10 justify-center bg-[#E9E9EB] dark:bg-[#262626]`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="mt-auto bg-inherit">
                <div className={`p-4 ${keyboardVisible ? 'pb-4' : 'pb-10'} bg-transparent border-t border-gray-200/50 dark:border-white/10 transition-all duration-300`}>
                    {selectedFile && (
                        <div className="mb-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className={`bg-gray-50 border-gray-200 dark:bg-[#1c1c1e]/50 dark:border-white/10 border rounded-xl p-2 flex items-center justify-between`}>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                                        {selectedFile.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                                    </div>
                                    <span className={`text-xs font-medium truncate text-gray-900 dark:text-white`}>{selectedFile.name}</span>
                                </div>
                                <button onClick={removeSelectedFile} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    )}

                    {showEmojiPicker && (
                        <div className="mb-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className={`bg-white border-gray-200 dark:bg-[#1c1c1e] dark:border-white/10 border rounded-2xl p-3 grid grid-cols-8 gap-1 h-40 overflow-y-auto scrollbar-hide shadow-xl`}>
                                {emojis.map(emoji => (
                                    <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} className="text-xl p-1 hover:bg-white/5 rounded-lg transition-colors">{emoji}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }} />
                        <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-400 hover:text-white transition-colors"><Paperclip size={24} strokeWidth={1.5} /></button>

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className={`w-full bg-gray-100 border-transparent text-gray-900 dark:bg-[#1c1c1e]/50 dark:border-white/10 dark:text-white dark:placeholder-gray-500 border rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-white/5 transition-all`}
                            />
                            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`absolute right-4 top-3.5 ${showEmojiPicker ? 'text-blue-500' : 'text-gray-400'}`}><Smile size={20} /></button>
                        </div>

                        <button
                            type="submit"
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${inputValue.trim() || selectedFile ? 'bg-white text-black scale-105 shadow-lg' : 'bg-[#1c1c1e]/50 text-gray-500'}`}
                        >
                            {inputValue.trim() || selectedFile ? <ArrowUp size={22} strokeWidth={2.5} /> : <Mic size={22} strokeWidth={2} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MiaMobile;

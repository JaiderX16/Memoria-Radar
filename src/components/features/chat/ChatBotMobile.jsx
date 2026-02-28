import React, { useState, useEffect, useRef } from 'react';
import { Drawer } from 'vaul';
import {
    ArrowUp,
    Paperclip,
    Smile,
    FileText,
    Image as ImageIcon,
    Trash2,
    Mic
} from 'lucide-react';

const ChatBotMobile = ({ isOpen, setIsOpen, chatState, setChatState }) => {
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

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const emojis = ['😀', '😃', '😄', '😅', '😂', '🤣', '😊', '🥰', '😍', '😘', '😜', '😎', '🤩', '🥳', '🤔', '🤫', '🙄', '😣', '😢', '😭', '😤', '😠', '🤯', '🥶', '😱', '👋', '👍', '👎', '👏', '🙏', '💪', '🔥', '✨', '❤️', '💔', '💯'];

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

    // 1. Sync isOpen based on external chatState (Parent -> Child)
    useEffect(() => {
        if (chatState !== 'closed' && !isOpen) {
            setIsOpen(true);
        } else if (chatState === 'closed' && isOpen) {
            setIsOpen(false);
        }
    }, [chatState]);

    // 2. Handle drawer closure (Child -> Parent)
    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            setChatState('closed');
        }
    };

    const [snap, setSnap] = useState(0.5);

    // 3. Optional: Sync snap from chatState if forced from parent
    useEffect(() => {
        if (chatState === 'full' && snap !== 1) setSnap(1);
        if (chatState === 'half' && snap !== 0.5) setSnap(0.5);
    }, [chatState]);

    // 4. Report snap changes back to parent
    const onSnapChange = (s) => {
        setSnap(s);
        if (s === 1) setChatState('full');
        else if (s === 0.5) setChatState('half');
        else if (s === 0) {
            setChatState('closed');
            setIsOpen(false);
        }
    };

    return (
        <Drawer.Root
            open={isOpen}
            onOpenChange={handleOpenChange}
            snapPoints={[0.5, 1]}
            activeSnapPoint={snap}
            setActiveSnapPoint={onSnapChange}
            shouldScaleBackground={false} // Desactivado para no achicar el mapa y poder usarlo
            dismissible={true}
            fadeFromIndex={0}
            modal={false} // Permite usar el mapa interactivo detrás
        >
            <Drawer.Portal>
                {/* Vaul exige Drawer.Content con medidas fijas para calcular el drag. Lo hacemos alto pero transparente a clics */}
                <Drawer.Content
                    className="fixed bottom-0 left-0 right-0 flex flex-col justify-start outline-none pointer-events-none z-[100005]"
                    style={{ height: '96vh' }}
                >
                    {/* Contenedor visual dinámico que sí captura clics. Usamos alturas fijas en VH puro para evitar bugs de teclado en iOS */}
                    <div className="w-full flex-col flex bg-white/80 dark:bg-black/60 backdrop-blur-3xl border-t border-white/40 dark:border-white/10 rounded-t-[32px] overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.12)] pointer-events-auto"
                        style={{ height: snap === 1 ? '96vh' : '48vh', transition: 'height 0.4s cubic-bezier(0.32, 0.72, 0, 1)' }}
                    >
                        <Drawer.Title className="sr-only">Chat de MIA</Drawer.Title>
                        <Drawer.Description className="sr-only">Asistente virtual de turismo en Huancayo</Drawer.Description>

                        {/* Handle visual */}
                        <div className="w-full flex justify-center pt-5 pb-3 flex-shrink-0 cursor-grab active:cursor-grabbing bg-transparent relative z-10">
                            <div className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/30 backdrop-blur-sm" />
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide flex flex-col pt-2 w-full" onClick={() => setShowEmojiPicker(false)}>
                            <div className={`text-center text-[10px] text-gray-500 dark:text-gray-400 font-bold my-4 uppercase tracking-widest opacity-50`}>HOY</div>

                            {messages.map((msg) => {
                                const isUser = msg.sender === 'user';
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full group`}>
                                        {msg.type === 'text' && (
                                            <div className={`px-4 py-3 max-w-[85%] text-[15px] leading-relaxed backdrop-blur-md transition-all duration-300 ${isUser ? 'bg-black text-white dark:bg-white/10 dark:text-white rounded-2xl rounded-tr-none shadow-sm' : 'bg-white/60 text-black dark:bg-white/5 dark:text-white rounded-2xl rounded-tl-none border border-black/5 dark:border-white/5 shadow-sm'}`}>
                                                {msg.text}
                                            </div>
                                        )}
                                        {msg.type === 'file' && (
                                            <div className={`p-3 max-w-[85%] rounded-2xl flex items-center gap-3 backdrop-blur-md ${isUser ? 'bg-black text-white dark:bg-white/10 dark:text-white rounded-tr-none' : 'bg-white/60 text-black dark:bg-white/5 dark:text-white rounded-tl-none border border-black/5 dark:border-white/5'}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-white/10' : 'bg-white shadow-sm dark:bg-white/10'}`}>
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
                                <div className="flex items-start mt-4">
                                    <div className={`px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-10 justify-center backdrop-blur-md bg-white/80 dark:bg-white/10 border border-black/5 dark:border-white/10 shadow-sm`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Input Area */}
                        <div className="mt-auto bg-transparent flex-shrink-0 z-50">
                            <div className="p-4 pb-6 transition-all duration-300 relative">
                                {/* Gradiente difuminado sobre el input para suavizar la transición del scroll */}
                                <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-white/80 dark:to-black/60 pointer-events-none" />

                                {selectedFile && (
                                    <div className="mb-3 animate-in fade-in slide-in-from-bottom-2">
                                        <div className={`bg-white/60 border-black/5 dark:bg-white/5 dark:border-white/5 border rounded-xl p-2 flex items-center justify-between backdrop-blur-md`}>
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
                                        <div className={`bg-white/80 border-black/5 dark:bg-[#1c1c1e]/80 dark:border-white/5 border rounded-2xl p-3 grid grid-cols-8 gap-1 h-40 overflow-y-auto scrollbar-hide shadow-xl backdrop-blur-xl`}>
                                            {emojis.map(emoji => (
                                                <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} className="text-xl p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">{emoji}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }} />
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"><Paperclip size={24} strokeWidth={1.5} /></button>

                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Escribe un mensaje..."
                                            className={`w-full bg-white/50 dark:bg-white/10 border-transparent text-gray-900 dark:text-white dark:placeholder-gray-400 border rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-all backdrop-blur-md shadow-inner`}
                                        />
                                        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`absolute right-4 top-3.5 ${showEmojiPicker ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}><Smile size={20} /></button>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${inputValue.trim() || selectedFile ? 'bg-black text-white dark:bg-white dark:text-black scale-[1.02] shadow-lg' : 'bg-black/5 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}
                                    >
                                        {inputValue.trim() || selectedFile ? <ArrowUp size={20} strokeWidth={2.5} /> : <Mic size={20} strokeWidth={2} />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root >
    );
};

export default ChatBotMobile;
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

    // Sincronizar chatState con isOpen
    useEffect(() => {
        if (chatState === 'closed') {
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    }, [chatState, setIsOpen]);

    // Update chatState based on open state changes from Drawer
    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            setChatState('closed');
        } else {
            // Default to half when opening if currently closed
            if (chatState === 'closed') {
                setChatState('half');
                setSnap(0.45);
            }
        }
    };

    const [snap, setSnap] = useState(0.45);

    // Sync snap state with chatState (Two-way binding)
    useEffect(() => {
        if (chatState === 'full' && snap !== 1) {
            setSnap(1);
        } else if (chatState === 'half' && snap !== 0.45) {
            setSnap(0.45);
        }
    }, [chatState]);

    // Update chatState when snap changes
    useEffect(() => {
        if (snap === 1) {
            setChatState('full');
        } else if (typeof snap === 'number' && snap < 0.6) {
            setChatState('half');
        }
    }, [snap, setChatState]);

    console.log('DEBUG: MiaMobile Render - isOpen:', isOpen);

    return (
        <Drawer.Root
            open={isOpen}
            onOpenChange={handleOpenChange}
            shouldScaleBackground={false}
        >
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[9999]" />
                <Drawer.Content
                    className="bg-red-500 dark:bg-red-900 border-2 border-yellow-400 flex flex-col rounded-t-[32px] fixed z-[10000] outline-none h-[50vh] max-w-lg mx-auto left-0 right-0 bottom-0"
                >
                    {/* Título requerido por Radix Dialog (accesibilidad) */}
                    <Drawer.Title className="sr-only">MIA Chat</Drawer.Title>

                    {/* Handle visual */}
                    <div className="w-full flex justify-center pt-6 pb-4 flex-shrink-0">
                        <div className="w-16 h-1.5 rounded-full bg-gray-300/50 dark:bg-white/20" />
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
                                            <div className={`px-4 py-3 max-w-[85%] text-[15px] leading-relaxed backdrop-blur-md ${isUser ? 'bg-black text-white dark:bg-[#262626] dark:text-white rounded-2xl rounded-tr-none' : 'bg-[#E9E9EB] text-black dark:bg-[#262626] dark:text-white rounded-2xl rounded-tl-none'}`}>
                                                {msg.text}
                                            </div>
                                        )}
                                        {msg.type === 'file' && (
                                            <div className={`p-3 max-w-[85%] rounded-2xl flex items-center gap-3 backdrop-blur-md ${isUser ? 'bg-black text-white dark:bg-[#262626] dark:text-white rounded-tr-none' : 'bg-[#E9E9EB] text-black dark:bg-[#262626] dark:text-white rounded-tl-none'}`}>
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
                                    <div className={`px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-10 justify-center backdrop-blur-md bg-[#E9E9EB] dark:bg-[#262626]`}>
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
                    <div className="mt-auto bg-inherit flex-shrink-0">
                        <div className={`p-4 pb-8 bg-transparent border-t border-gray-200/50 dark:border-white/10 transition-all duration-300`}>
                            {selectedFile && (
                                <div className="mb-3 animate-in fade-in slide-in-from-bottom-2">
                                    <div className={`bg-gray-50 border-gray-200 dark:bg-[#1c1c1e]/50 dark:border-white/10 border rounded-xl p-2 flex items-center justify-between backdrop-blur-md`}>
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
                                        className={`w-full bg-gray-100 border-transparent text-gray-900 dark:bg-[#1c1c1e]/50 dark:border-white/10 dark:text-white dark:placeholder-gray-500 border rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-white/5 transition-all backdrop-blur-md`}
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
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default MiaMobile;
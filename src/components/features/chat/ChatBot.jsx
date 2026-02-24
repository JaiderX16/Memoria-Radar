import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowUp,
    Paperclip,
    Smile,
    Bot,
    FileText,
    Image as ImageIcon,
    Trash2,
    ChevronDown,
    Mic
} from 'lucide-react';
import ChatBotMobile from './ChatBotMobile';

const ChatBot = ({ isOpen, setIsOpen, chatState, setChatState, ...props }) => {
    console.log('DEBUG: ChatBot Render', { isOpen, chatState });
    // Siempre usar el componente con vaul Drawer
    return <ChatBotMobile isOpen={isOpen} setIsOpen={setIsOpen} chatState={chatState} setChatState={setChatState} {...props} />;
};

const ChatBotDesktop = ({ isOpen, setIsOpen }) => {
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
    }, [messages, isTyping, selectedFile, isOpen]);

    // Enviar mensaje
    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (inputValue.trim() === '' && !selectedFile) return;

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

        setShowEmojiPicker(false);
    };

    const handleEmojiClick = (emoji) => setInputValue(prev => prev + emoji);
    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`fixed bottom-4 right-16 w-[380px] h-[600px] bg-white/90 backdrop-blur-xl dark:bg-[#121214]/85 dark:backdrop-blur-2xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-200/50 dark:border-white/10 transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
            {/* Header */}
            <div className={`bg-transparent p-4 flex items-center justify-between z-20 transition-colors duration-300`}>
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-gray-100 dark:bg-[#1c1c1e]/50 dark:border dark:border-white/10`}>
                        <Bot size={24} className="text-gray-900 dark:text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className={`font-bold text-base text-gray-900 dark:text-white leading-tight`}>MIA Asistente</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className={`text-xs text-gray-500 dark:text-gray-400 font-medium`}>En línea</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsOpen(false)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 bg-gray-100 text-gray-500 dark:bg-[#1c1c1e]/50 dark:text-gray-400 dark:hover:text-white`}
                >
                    <ChevronDown size={24} />
                </button>
            </div>

            {/* Messages */}
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

            {/* Input */}
            <div className={`p-4 pb-10 bg-transparent border-t border-gray-200/50 dark:border-white/10`}>
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
    );
};

export default ChatBot;
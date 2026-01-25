import React, { useState, useEffect, useRef } from 'react';
import {
    Bot,
    ChevronDown
} from 'lucide-react';
import { Drawer } from 'vaul';
import MiaMessageList from './MiaMessageList';
import MiaChatInput from './MiaChatInput';

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

    const isDarkMode = true;
    const emojis = ['😀', '😃', '😄', '😅', '😂', '🤣', '😊', '🥰', '😍', '😘', '😜', '😎', '🤩', '🥳', '🤔', '🤫', '🙄', '😣', '😢', '😭', '😤', '😠', '🤯', '🥶', '😱', '👋', '👍', '👎', '👏', '🙏', '💪', '🔥', '✨', '❤️', '💔', '💯'];

    // Detectar móvil
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        setIsMobile(mediaQuery.matches);

        const handler = (e) => setIsMobile(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Scroll al fondo
    const scrollToBottom = () => {
        // En móvil usamos 'auto' para evitar saltos o lag si el teclado está abriéndose
        messagesEndRef.current?.scrollIntoView({ behavior: isMobile ? 'auto' : 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 100);
        }
    }, [messages, isTyping, selectedFile, isRecording, isOpen, isMobile]);

    // Sincronizar chatState con vaul snap points
    const snapPoints = [0.45, 0.92];
    const [activeSnapPoint, setActiveSnapPoint] = useState(snapPoints[0]);

    useEffect(() => {
        if (isMobile) {
            if (chatState === 'half') setActiveSnapPoint(0.45);
            if (chatState === 'full') setActiveSnapPoint(0.92);
            if (chatState === 'closed') setIsOpen(false);
        }
    }, [chatState, isMobile, setIsOpen]);

    const handleSnapPointChange = (snap) => {
        if (snap === null) return;
        setActiveSnapPoint(snap);
        if (snap === 0.45) setChatState('half');
        if (snap === 0.92) setChatState('full');
        if (snap === 0) {
            setChatState('closed');
            setIsOpen(false);
        }
    };

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

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Estilos
    const bgMain = isMobile
        ? (isDarkMode ? 'bg-[#121214]' : 'bg-white')
        : (isDarkMode ? 'bg-[#121214]/85 backdrop-blur-2xl' : 'bg-white/90 backdrop-blur-xl');

    const bgHeader = isDarkMode ? 'bg-transparent' : 'bg-transparent';
    const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
    const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';

    const ChatHeader = (
        <div className={`${bgHeader} p-4 flex items-center justify-between z-20 transition-colors duration-300`}>
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isDarkMode ? 'bg-[#1c1c1e]/50 border border-white/10' : 'bg-gray-100'}`}>
                    <Bot size={24} className={textMain} />
                </div>
                <div className="flex flex-col">
                    <h3 className={`font-bold text-base ${textMain} leading-tight`}>MIA Asistente</h3>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className={`text-xs ${textSub} font-medium`}>En línea</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => { setIsOpen(false); setChatState('closed'); }}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${isDarkMode ? 'bg-[#1c1c1e]/50 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500'}`}
            >
                <ChevronDown size={24} />
            </button>
        </div>
    );

    const messageListProps = {
        messages,
        isTyping,
        messagesEndRef,
        isDarkMode,
        isMobile,
        setShowEmojiPicker
    };

    const chatInputProps = {
        inputValue,
        setInputValue,
        handleSendMessage,
        fileInputRef,
        selectedFile,
        setSelectedFile,
        removeSelectedFile,
        showEmojiPicker,
        setShowEmojiPicker,
        isDarkMode,
        isMobile,
        emojis
    };

    if (!isMobile) {
        return (
            <div className={`fixed bottom-4 right-16 w-[380px] h-[600px] ${bgMain} rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-white/10 transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                {ChatHeader}
                <MiaMessageList {...messageListProps} />
                <MiaChatInput {...chatInputProps} />
            </div>
        );
    }

    return (
        <Drawer.Root
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setChatState('closed');
            }}
            snapPoints={snapPoints}
            activeSnapPoint={activeSnapPoint}
            setActiveSnapPoint={handleSnapPointChange}
            fadeFromIndex={0}
            modal={false}
        >
            <Drawer.Portal>
                <Drawer.Content className={`${bgMain} flex flex-col rounded-t-[40px] fixed bottom-0 left-0 right-0 z-[1000] outline-none ${isMobile ? 'shadow-none' : 'shadow-[0_-10px_40px_rgba(0,0,0,0.3)]'} h-full border-t border-white/10`}>
                    <div
                        className="flex flex-col overflow-hidden"
                        style={{ height: activeSnapPoint ? `${activeSnapPoint * 100}dvh` : '45dvh' }}
                    >
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mt-4 mb-2" />

                        <div className="flex-1 overflow-hidden flex flex-col">
                            <MiaMessageList {...messageListProps} />
                        </div>
                        <div className="mt-auto">
                            <MiaChatInput {...chatInputProps} />
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default Mia;

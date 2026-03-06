import React, { useState, useEffect, useRef } from 'react';
import { Bot, ArrowUp } from 'lucide-react';
import { LiquidGlassInput } from '@/buttons/LiquidGlassInput';
import { LiquidActionButton } from '@/buttons/LiquidActionButton';

export default function ChatBotMobile({
    isOpen,
    setIsOpen,
    chatState,
    setChatState,
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isTyping,
    setIsTyping,
    domCanvas,
    pageRef,
    isDarkMode
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [sheetHeight, setSheetHeight] = useState(50); // Altura en vh

    const sheetRef = useRef(null);
    const startY = useRef(0);
    const startHeight = useRef(0);
    const currentHeightRef = useRef(50);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 100);
        }
    }, [messages, isOpen, sheetHeight, isTyping]);

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;

        // Añadir mensaje del usuario
        const newUserMsg = { id: Date.now(), text: inputValue.trim(), sender: 'user', type: 'text' };
        if (setMessages) setMessages(prev => [...prev, newUserMsg]);
        if (setInputValue) setInputValue('');
        if (setIsTyping) setIsTyping(true);

        // Simular respuesta del bot tras 1 segundo
        setTimeout(() => {
            const botResponse = { id: Date.now() + 10, text: 'Conecta tu servicio de IA aquí para obtener respuestas reales.', sender: 'bot', type: 'text' };
            if (setMessages) setMessages(prev => [...prev, botResponse]);
            if (setIsTyping) setIsTyping(false);
        }, 1000);
    };

    // Funciones para abrir/cerrar el modal
    const closeSheet = () => {
        if (setIsOpen) setIsOpen(false);
        if (setChatState) setChatState('closed');
    };

    // Iniciar el arrastre
    const onDragStart = (e) => {
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startY.current = clientY;
        if (sheetRef.current) {
            startHeight.current = sheetRef.current.getBoundingClientRect().height;
            setIsDragging(true);
        }
    };

    // Efecto para manejar el arrastre continuo globalmente
    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (e) => {
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaY = startY.current - clientY;
            const newHeightPx = startHeight.current + deltaY;
            const windowHeight = window.innerHeight;
            let newHeightVh = (newHeightPx / windowHeight) * 100;

            // Añadir un poco de resistencia elástica si se arrastra más allá del 90%
            if (newHeightVh > 90) {
                newHeightVh = 90 + (newHeightVh - 90) * 0.2;
            }

            setSheetHeight(newHeightVh);
            currentHeightRef.current = newHeightVh;
        };

        const handleEnd = () => {
            setIsDragging(false);
            const finalHeight = currentHeightRef.current;

            // Lógica de "Snapping" (Ajuste automático) al soltar
            if (finalHeight > 70) {
                setSheetHeight(90); // Expandir al 90%
                currentHeightRef.current = 90;
            } else if (finalHeight < 35) {
                closeSheet(); // Cerrar si se arrastra muy abajo
            } else {
                setSheetHeight(50); // Volver a la mitad (50%)
                currentHeightRef.current = 50;
            }
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging]);

    // Restaurar altura al abrir si estaba cerrado por arrastre
    useEffect(() => {
        if (isOpen) {
            if (currentHeightRef.current < 35) {
                setSheetHeight(50);
                currentHeightRef.current = 50;
            }
        }
    }, [isOpen]);

    // Si no está el chat para renderizar (no hay parent messages), fallback visual 
    // Ojo: esto asume que siempre recibimos messages
    const displayMessages = messages || [];
    const displayInput = inputValue || '';

    return (
        <>
            {/* El fondo ya no tiene un overlay que bloquee los clics para que se pueda interactuar con el mapa/app */}

            {/* --- Modal Bottom Sheet --- */}
            <div
                ref={sheetRef}
                style={{
                    height: `${sheetHeight}vh`,
                    transform: isOpen ? 'translateY(0)' : 'translateY(100%)'
                }}
                className={`fixed bottom-0 left-0 right-0 z-[1000] bg-white/20 dark:bg-[#1c1c1e]/40 backdrop-blur-[24px] rounded-t-[48px] shadow-2xl flex flex-col w-full border-t border-white/20 dark:border-white/[0.1] ${isDragging ? 'transition-none' : 'transition-all duration-300 ease-out'
                    }`}
                role="dialog"
                aria-modal="true"
            >
                {/* Zona superior (Header) que se puede arrastrar */}
                <div
                    className="pt-6 pb-4 px-6 cursor-grab active:cursor-grabbing flex-shrink-0"
                    onMouseDown={onDragStart}
                    onTouchStart={onDragStart}
                >
                    {/* Indicador visual de arrastre (Handle) */}
                    <div
                        className="w-14 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 hover:bg-gray-400 transition-colors"
                    />


                </div>

                {/* Contenedor scrollable de mensajes */}
                <div
                    className="flex-1 overflow-y-auto px-6 pb-4 pt-2 space-y-4 scrollbar-hide relative"
                    style={{
                        maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)'
                    }}
                >
                    <div className="text-center text-[10px] text-gray-500 dark:text-gray-400 font-bold my-2 uppercase tracking-widest opacity-50">HOY</div>
                    {displayMessages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}>
                                <div className={`px-4 py-3 max-w-[85%] text-[15px] leading-relaxed backdrop-blur-md shadow-sm ${isUser
                                    ? 'bg-black text-white dark:bg-[#262626] dark:text-white rounded-2xl rounded-tr-none'
                                    : 'bg-[#E9E9EB] text-black dark:bg-[#262626] dark:text-white rounded-2xl rounded-tl-none border border-gray-200/50 dark:border-white/5'
                                    }`}>
                                    {msg.text || (msg.file && `Envió un archivo: ${msg.file.name}`)}
                                </div>
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
                    {/* Div invisible para anclar el scroll automático al fondo */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input de texto inferior (Fijo en la base) */}
                <div className="flex-shrink-0 p-6 pb-8 bg-transparent">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <LiquidGlassInput
                                isDarkMode={isDarkMode}
                                domCanvas={domCanvas}
                                pageRef={pageRef}
                                value={displayInput}
                                onChange={(e) => setInputValue && setInputValue(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                className="!h-12 !text-sm"
                            />
                        </div>
                        <div className="w-[48px] h-[48px] shrink-0">
                            <LiquidActionButton
                                isDarkMode={isDarkMode}
                                domCanvas={domCanvas}
                                pageRef={pageRef}
                                onClick={handleSendMessage}
                                disabled={!displayInput.trim()}
                                className={!displayInput.trim() ? "opacity-50 pointer-events-none" : ""}
                            >
                                <ArrowUp size={20} strokeWidth={2.5} className={!displayInput.trim() ? "text-gray-500/50 rotate-90" : "text-black dark:text-white rotate-90"} />
                            </LiquidActionButton>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
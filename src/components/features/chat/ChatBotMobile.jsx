import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Send } from 'lucide-react';

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
                className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] shadow-2xl flex flex-col w-full ${isDragging ? 'transition-none' : 'transition-all duration-300 ease-out'
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
                <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 pt-2">
                    {displayMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-2.5 shadow-sm text-sm leading-relaxed ${msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm border border-gray-200'
                                }`}>
                                {msg.text || (msg.file && `Envió un archivo: ${msg.file.name}`)}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-start">
                            <div className={`px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center h-10 justify-center backdrop-blur-md bg-gray-100`}>
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
                <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white pb-6">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={displayInput}
                            onChange={(e) => setInputValue && setInputValue(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-base rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent block py-3.5 px-5 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!displayInput.trim()}
                            className="p-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-full transition-colors flex items-center justify-center shadow-sm"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
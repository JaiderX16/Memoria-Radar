import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

const Mia = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "¡Hola! ¿En qué puedo ayudarte?", sender: "received" },
    { id: 2, text: "Hola, tengo una consulta sobre mi pedido", sender: "sent" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "sent"
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
    
    // Simular respuesta automática
    setTimeout(() => {
      const autoReply = {
        id: messages.length + 2,
        text: "Gracias por tu mensaje. Te responderemos pronto.",
        sender: "received"
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Contenido de ejemplo */}
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Mi Página Web</h1>
        <p className="text-gray-600">Contenido de ejemplo...</p>
      </div>
      
      {/* Botón flotante con SVG personalizado en la esquina inferior derecha */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-black hover:bg-gray-800 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center group hover:scale-105"
      >
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 1170 1051" 
          className="fill-white"
        >
          <g transform="translate(0.000000,1051.000000) scale(0.100000,-0.100000)">
            <path d="M0 5255 l0 -5255 5850 0 5850 0 0 5255 0 5255 -5850 0 -5850 0 0 -5255z m3665 2430 c1544 -1550 1956 -1965 2450 -2468 198 -202 366 -369 373 -372 15 -5 43 7 64 29 21 20 110 91 253 201 136 105 174 134 241 187 23 18 86 66 140 107 55 41 104 80 109 86 6 6 37 31 70 55 33 24 76 56 95 72 19 16 40 33 47 38 7 6 17 10 23 10 5 0 10 4 10 8 0 5 28 29 63 55 34 26 85 64 112 86 97 77 221 173 335 259 63 47 124 95 135 106 11 12 38 33 60 47 22 15 52 37 66 50 14 13 63 53 108 89 45 36 103 82 129 103 26 20 79 61 117 91 39 29 76 61 84 70 7 9 18 16 23 16 5 0 30 19 54 43 25 23 59 50 75 60 16 11 29 23 29 28 0 5 6 9 14 9 14 0 30 29 21 38 -3 3 -5 0 -5 -7 0 -7 -4 -10 -9 -7 -12 8 -60 -17 -65 -34 -3 -8 -4 -3 -2 12 4 32 -21 46 -39 22 -7 -10 -17 -14 -24 -10 -9 6 -9 11 -1 21 14 17 2 45 -20 45 -10 0 -17 7 -16 17 1 12 -13 20 -48 29 -28 7 -53 11 -58 8 -13 -8 -28 5 -22 21 4 9 16 12 39 8 l33 -5 -2 46 -1 45 -51 -5 -51 -6 -7 32 c-3 18 -6 43 -6 56 0 13 -5 35 -12 49 -15 33 -28 15 -28 -37 0 -21 -4 -38 -10 -38 -5 0 -10 13 -10 29 0 16 -6 31 -14 34 -8 3 -16 18 -18 33 -3 28 -28 47 -28 22 0 -7 -11 -15 -25 -16 -21 -1 -25 3 -25 24 0 23 4 26 25 22 19 -4 25 -1 25 13 0 12 -7 19 -19 19 -30 0 -36 21 -12 39 20 15 20 18 6 36 -15 20 -15 20 -26 1 -11 -18 -12 -18 -31 5 -18 23 -19 23 -13 2 5 -20 4 -21 -19 -10 -13 6 -22 15 -20 18 9 15 -10 40 -42 55 -21 10 -34 23 -34 35 0 11 -8 22 -17 25 -43 13 -47 20 -44 67 1 26 -2 47 -7 47 -5 0 -8 -10 -8 -22 1 -28 -34 -37 -53 -14 -10 12 -9 17 8 28 24 15 29 58 6 58 -8 0 -15 -3 -15 -8 0 -4 -14 -13 -31 -21 -16 -7 -28 -16 -24 -19 6 -7 -35 -52 -48 -52 -5 0 -27 -19 -48 -42 -22 -24 -39 -39 -39 -33 0 5 11 21 24 35 13 14 49 52 80 85 30 33 72 78 92 100 97 104 400 414 852 873 l495 502 939 0 c516 0 938 -3 938 -7 0 -5 -559 -566 -1241 -1248 -682 -682 -1428 -1431 -1657 -1664 -720 -734 -2560 -2571 -2573 -2571 -12 0 -775 760 -4492 4478 -545 545 -993 997 -995 1002 -3 7 324 10 955 10 l958 0 1330 -1335z"/>
          </g>
        </svg>
      </button>

      {/* Overlay del modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-4">
          <div 
            className="bg-white rounded-xl w-full max-w-md h-96 md:h-[600px] flex flex-col shadow-2xl transform transition-all duration-300 scale-100 mb-20 mr-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="bg-black text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-lg font-semibold">MIA</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenedor de mensajes */}
            <div className="flex-1 p-4 overflow-y-auto bg-white">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm
                        ${message.sender === 'sent'
                          ? 'bg-black text-white rounded-br-md'
                          : 'bg-gray-100 text-black border border-gray-200 rounded-bl-md'
                        }
                      `}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input para escribir mensajes */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
              <div className="flex items-end space-x-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-2 resize-none focus:border-black focus:outline-none transition-colors text-sm min-h-[40px] max-h-24"
                  rows="1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isTyping || inputValue.trim() === ''}
                  className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mia;
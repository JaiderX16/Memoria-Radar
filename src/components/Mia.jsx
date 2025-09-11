import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyB1qalKS0md42_dGxaiwNm1QPIS2Q2woDo" });

function Mia() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputValue.trim() === '') return;

    const newUserMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: inputValue,
      });

      const botResponse = response.text;
      
      const newBotMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Error al obtener respuesta de Gemini:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-7 right-3 w-16 h-16 bg-black rounded-full shadow-xl transition-all duration-300 z-50 flex items-center justify-center group hover:scale-110 hover:shadow-2xl"
        style={{ boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' }}
      >
        <img 
          src="/logo/memoria_logo.svg" 
          alt="Logo Memoria" 
          className="w-10 h-10 object-contain"
        />
      </button>

      {/* Modal del chat */}
      {isOpen && (
        <div 
          className="fixed bottom-7 right-3 w-80 h-96 bg-white rounded-xl shadow-2xl z-50 flex flex-col transform transition-all duration-300 scale-100"
          style={{ boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' }}
        >
          {/* Header del modal */}
          <div className="bg-black text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
            <h2 className="text-lg font-semibold">MIA</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Contenedor de mensajes */}
          <div className="flex-1 p-4 overflow-y-auto bg-white">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-xs px-4 py-2 rounded-2xl text-sm
                      ${message.sender === 'user'
                        ? 'bg-black text-white rounded-br-md'
                        : 'bg-gray-100 text-black border border-gray-200 rounded-bl-md'
                      }
                    `}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-gray-100 text-black border border-gray-200 rounded-bl-md">
                    <span className="italic">MIA está escribiendo...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input para escribir mensajes */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
            <div className="flex items-end space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-2 focus:border-black focus:outline-none transition-colors text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={isTyping || inputValue.trim() === ''}
                className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mia;
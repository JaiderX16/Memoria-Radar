import React from 'react';
import {
    FileText,
    Image as ImageIcon
} from 'lucide-react';

const MiaMessageList = React.memo(({
    messages,
    isTyping,
    messagesEndRef,
    isDarkMode,
    isMobile,
    setShowEmojiPicker
}) => {

    // Derived styles
    const backdropClass = isMobile ? '' : 'backdrop-blur-md';
    const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const bubbleUserBg = isDarkMode ? 'bg-[#262626]' : 'bg-black';
    const bubbleUserText = isDarkMode ? 'text-white' : 'text-white';
    const bubbleBotBg = isDarkMode ? 'bg-[#262626]' : 'bg-[#E9E9EB]';
    const bubbleBotText = isDarkMode ? 'text-white' : 'text-black';

    return (
        <div className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-hide py-4" onClick={() => setShowEmojiPicker(false)}>
            <div className={`text-center text-[10px] ${textSub} font-bold my-4 uppercase tracking-widest opacity-50`}>HOY</div>

            {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}>
                        {msg.type === 'text' && (
                            <div className={`px-4 py-3 max-w-[85%] text-[15px] leading-relaxed ${backdropClass} ${isUser ? `${bubbleUserBg} ${bubbleUserText} rounded-2xl rounded-tr-none` : `${bubbleBotBg} ${bubbleBotText} rounded-2xl rounded-tl-none`}`}>
                                {msg.text}
                            </div>
                        )}
                        {msg.type === 'file' && (
                            <div className={`p-3 max-w-[85%] rounded-2xl flex items-center gap-3 ${backdropClass} ${isUser ? `${bubbleUserBg} ${bubbleUserText} rounded-tr-none` : `${bubbleBotBg} ${bubbleBotText} rounded-tl-none`}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-white/10' : isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
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
                    <div className={`px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-10 justify-center ${backdropClass} ${bubbleBotBg}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
});

export default MiaMessageList;

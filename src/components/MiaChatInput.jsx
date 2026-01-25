import React from 'react';
import {
    ArrowUp,
    Paperclip,
    Smile,
    FileText,
    Image as ImageIcon,
    Trash2,
    Mic
} from 'lucide-react';

const MiaChatInput = ({
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
}) => {

    // Derived styles
    const backdropClass = isMobile ? '' : 'backdrop-blur-md';

    const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
    const borderSub = isDarkMode ? 'border-white/10' : 'border-gray-200/50';

    const handleEmojiClick = (emoji) => setInputValue(prev => prev + emoji);

    return (
        <div className={`p-4 pb-10 ${isDarkMode ? 'bg-transparent' : 'bg-transparent'} border-t ${borderSub}`}>
            {selectedFile && (
                <div className="mb-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className={`${isDarkMode ? 'bg-[#1c1c1e]/50 border-white/10' : 'bg-gray-50 border-gray-200'} border rounded-xl p-2 flex items-center justify-between ${backdropClass}`}>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                                {selectedFile.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                            </div>
                            <span className={`text-xs font-medium truncate ${textMain}`}>{selectedFile.name}</span>
                        </div>
                        <button onClick={removeSelectedFile} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                </div>
            )}

            {showEmojiPicker && (
                <div className="mb-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className={`${isDarkMode ? 'bg-[#1c1c1e] border-white/10' : 'bg-white border-gray-200'} border rounded-2xl p-3 grid grid-cols-8 gap-1 h-40 overflow-y-auto scrollbar-hide shadow-xl`}>
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
                        className={`w-full ${isDarkMode ? 'bg-[#1c1c1e]/50 border-white/10 text-white placeholder-gray-500' : 'bg-gray-100 border-transparent text-gray-900'} border rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-white/5 transition-all ${backdropClass}`}
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
    );
};

export default MiaChatInput;

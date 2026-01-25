import React, { useRef } from 'react';
import { X, ChevronLeft, ImageIcon, Download } from 'lucide-react';

const ImageViewer = ({ src, name, onClose, onUpdateImage, theme }) => {
    const fileInputRef = useRef(null);

    if (!src && !name) return null;

    const handleDownload = () => {
        if (!src) return;
        const link = document.createElement('a');
        link.href = src;
        link.download = `perfil_${name.replace(/\s+/g, '_').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateImage(reader.result, true);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-4 px-6 text-white absolute top-0 w-full z-10 pt-12 bg-black">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <span className="font-bold text-lg tracking-wide">{name || 'Foto de Perfil'}</span>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-0 overflow-hidden bg-black" onClick={onClose}>
                <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    {src ? (
                        <img src={src} alt="Full view" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="w-40 h-40 bg-gray-800 rounded-full flex items-center justify-center text-white text-6xl font-black border-2 border-white/20">
                            {name?.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 pb-10 flex justify-around text-white absolute bottom-0 w-full bg-black border-t border-white/10">
                <div className="flex flex-col items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer transition-opacity group" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/10"><ImageIcon size={24} /></div>
                    <span className="text-[10px] font-medium tracking-wider uppercase">Cambiar</span>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer transition-opacity group" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
                    <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/10"><Download size={24} /></div>
                    <span className="text-[10px] font-medium tracking-wider uppercase">Guardar</span>
                </div>
            </div>
        </div>
    );
};

export default ImageViewer;

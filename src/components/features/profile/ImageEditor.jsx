import React, { useState, useEffect, useRef } from 'react';
import { X, Move, ZoomIn, ZoomOut, CheckCircle } from 'lucide-react';

const ImageEditor = ({ src, onCancel, onSave, theme, isDarkMode }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const [imgDim, setImgDim] = useState({ w: 0, h: 0 });
    const containerSize = 256;
    const imageRef = useRef(null);

    const handleImageLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        const ratio = Math.max(containerSize / naturalWidth, containerSize / naturalHeight);
        setImgDim({ w: naturalWidth * ratio, h: naturalHeight * ratio });
    };

    const handleMouseDown = (e) => {
        setDragging(true);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setLastPos({ x: clientX, y: clientY });
    };

    const handleMouseMove = (e) => {
        if (!dragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - lastPos.x;
        const dy = clientY - lastPos.y;

        setPosition(prev => {
            let newX = prev.x + dx;
            let newY = prev.y + dy;

            const currentW = imgDim.w * scale;
            const currentH = imgDim.h * scale;
            const maxX = Math.max(0, (currentW - containerSize) / 2);
            const maxY = Math.max(0, (currentH - containerSize) / 2);

            if (newX > maxX) newX = maxX;
            if (newX < -maxX) newX = -maxX;
            if (newY > maxY) newY = maxY;
            if (newY < -maxY) newY = -maxY;

            return { x: newX, y: newY };
        });

        setLastPos({ x: clientX, y: clientY });
    };

    const handleMouseUp = () => setDragging(false);

    useEffect(() => {
        setPosition(prev => {
            const currentW = imgDim.w * scale;
            const currentH = imgDim.h * scale;
            const maxX = Math.max(0, (currentW - containerSize) / 2);
            const maxY = Math.max(0, (currentH - containerSize) / 2);

            let newX = prev.x;
            let newY = prev.y;

            if (newX > maxX) newX = maxX;
            if (newX < -maxX) newX = -maxX;
            if (newY > maxY) newY = maxY;
            if (newY < -maxY) newY = -maxY;

            return { x: newX, y: newY };
        });
    }, [scale, imgDim]);

    const handleSave = () => {
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, size, size);

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        const img = imageRef.current;
        const pixelRatio = size / containerSize;

        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const baseScale = Math.max(size / naturalWidth, size / naturalHeight);

        const drawWidth = naturalWidth * baseScale;
        const drawHeight = naturalHeight * baseScale;

        ctx.translate(size / 2, size / 2);
        ctx.translate(position.x * pixelRatio, position.y * pixelRatio);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        onSave(canvas.toDataURL('image/png'));
    };

    return (
        <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-4 px-6 text-white absolute top-0 w-full z-10 pt-12 bg-black">
                <h3 className="font-bold text-lg tracking-wide uppercase">Ajustar Foto</h3>
                <button onClick={onCancel} className="p-2 -mr-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div
                className="flex-1 flex flex-col items-center justify-center p-4 w-full bg-black"
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchEnd={handleMouseUp}
            >
                <div className="relative w-64 h-64 border-2 border-white rounded-full overflow-hidden shadow-none flex items-center justify-center bg-gray-900 cursor-move touch-none">
                    <img
                        ref={imageRef}
                        src={src}
                        alt="Edit"
                        draggable={false}
                        className="max-w-none select-none pointer-events-none"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            minWidth: '100%',
                            minHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            maxWidth: 'none',
                            maxHeight: 'none'
                        }}
                        onLoad={handleImageLoad}
                    />
                    <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none"></div>
                    <div className="absolute inset-0 cursor-move" onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}></div>
                </div>

                <p className="text-white/40 text-[10px] uppercase font-bold mt-6 tracking-widest flex items-center gap-2">
                    <Move size={12} /> Arrastra y Zoom
                </p>
            </div>

            <div className="p-6 pb-10 w-full bg-black border-t border-white/10">
                <div className="flex items-center gap-4 mb-8 px-4">
                    <ZoomOut size={16} className="text-white/50" />
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer text-white accent-white"
                    />
                    <ZoomIn size={16} className="text-white/50" />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3.5 rounded-xl font-bold uppercase tracking-widest text-white border border-white/20 hover:bg-white/10 transition-colors text-xs"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3.5 rounded-xl font-bold uppercase tracking-widest bg-white text-black hover:bg-gray-200 transition-colors text-xs border border-white flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={16} /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;

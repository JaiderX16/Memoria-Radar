import React from 'react';
import { TouchableGlassContainer } from './TouchableGlassContainer';
import { LiquidGlassButton } from './LiquidGlassButton';

export const LiquidActionButton = ({
    imageUrl,
    domCanvas,
    pageRef,
    isDarkMode = false,
    className = '',
    onClick,
    children,
    style
}) => {
    return (
        <TouchableGlassContainer
            className={`rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] ignore-capture ${className}`}
            data-html2canvas-ignore="true"
            onClick={onClick}
            style={style}
        >
            {({ isPressed, isHovered }) => (
                <>
                    {/* Fallback Glass Background - Solo visible si el canvas no está listo */}
                    {!domCanvas && (
                        <div className={`absolute inset-0 rounded-full border transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-white/20' : 'bg-black/5 border-black/10'}`}>
                            <div className={`absolute inset-0 rounded-full border border-white/5 opacity-50`} />
                        </div>
                    )}

                    <div className="absolute inset-0">
                        <LiquidGlassButton
                            imageUrl={imageUrl}
                            pageRef={pageRef}
                            domCanvas={domCanvas}
                            shape="circle"
                            isPressed={isPressed}
                        />
                    </div>

                    {/* Borde y Brillo Frontal */}
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none border transition-colors duration-300 rounded-full ${(isHovered || isPressed) ? 'border-cyan-400/50' : (isDarkMode ? 'border-white/20' : 'border-black/20')}`}>
                        <div className={`drop-shadow-lg transition-all duration-300 ${(isHovered || isPressed) ? 'text-cyan-400 scale-110' : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                            {children}
                        </div>
                    </div>
                </>
            )}
        </TouchableGlassContainer>
    );
};

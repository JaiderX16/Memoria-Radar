import React, { useState } from 'react';
import { cn } from "@/utils/cn";
import { LiquidGlassButtonWebGL } from './LiquidGlassButton';

interface LiquidActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isDarkMode?: boolean;
    domCanvas?: HTMLCanvasElement | null;
    pageRef?: React.RefObject<HTMLElement | null>;
    shape?: "circle" | "pill";
    imageUrl?: string;
}

/**
 * Premium Liquid Glass Button Wrapper
 * Integrates WebGL effects behind interactive content.
 * 
 * Uses WebGL-only variant from cristal-liquido to avoid WebGPU
 * cross-device texture issues. The domCanvas should be captured
 * during the map's render event for reliable GL buffer reading.
 */
export const LiquidActionButton: React.FC<LiquidActionButtonProps> = ({
    children,
    onClick,
    className,
    isDarkMode = false,
    domCanvas,
    pageRef,
    shape = "circle",
    imageUrl,
    ...props
}) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            className={cn(
                "relative flex items-center justify-center transition-transform duration-200 active:scale-95 group",
                "w-10 h-10 rounded-full",
                className
            )}
            data-html2canvas-ignore="true"
            {...props}
        >
            <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] overflow-hidden">
                <LiquidGlassButtonWebGL
                    domCanvas={domCanvas}
                    pageRef={pageRef}
                    shape={shape}
                    isPressed={isPressed}
                    imageUrl={imageUrl}
                />
            </div>
            <div className={cn(
                "relative z-10 flex items-center justify-center transition-colors duration-300 drop-shadow-md",
                isDarkMode ? "text-white" : "text-slate-800"
            )}>
                {children}
            </div>
            {/* Glossy overlay or border */}
            <div className="absolute inset-0 rounded-[inherit] border border-white/20 dark:border-white/10 pointer-events-none group-hover:border-blue-500/50 transition-colors duration-300" />
        </button>
    );
};

export default LiquidActionButton;

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
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center justify-center transition-transform duration-200 active:scale-95 group",
                "w-12 h-12 rounded-full",
                isDarkMode ? "bg-white/10 backdrop-blur-md border-[0.5px] border-white/20" : "bg-black/5 backdrop-blur-md border-[0.5px] border-black/10",
                className
            )}
            {...props}
        >
            <div className={cn(
                "relative z-10 flex items-center justify-center transition-colors duration-300 drop-shadow-md",
                isDarkMode ? "text-white" : "text-gray-900"
            )}>
                {children}
            </div>
            {/* Simple smooth overlay on hover */}
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none transition-colors duration-300 group-hover:bg-black/5 dark:group-hover:bg-white/5" />
        </button>
    );
};

export default LiquidActionButton;

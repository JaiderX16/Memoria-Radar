import React, { useState } from 'react';
import { LiquidGlassButtonWebGL } from './LiquidGlassButton';

export interface LiquidGlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'shape'> {
  domCanvas?: HTMLCanvasElement | null;
  pageRef?: React.RefObject<HTMLElement | null>;
  isDarkMode?: boolean;
  liquidGlassEffect?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const LiquidGlassInput: React.FC<LiquidGlassInputProps> = ({
  domCanvas,
  pageRef,
  isDarkMode = true,
  liquidGlassEffect = false,
  leftIcon,
  rightIcon,
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative w-full h-16 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] group transition-all duration-300 overflow-hidden ${isDarkMode ? 'bg-[#1c1c1e]/40 backdrop-blur-xl border border-white/20' : 'bg-white/40 backdrop-blur-xl border border-black/10'} ${isFocused ? 'ring-2 ring-blue-500/50' : ''} ${className}`}>
      {liquidGlassEffect && (
        <div className={`absolute inset-0 transition-opacity duration-500 overflow-hidden rounded-[inherit] pointer-events-none ${domCanvas ? 'opacity-100' : 'opacity-0'}`}>
          <LiquidGlassButtonWebGL
            domCanvas={domCanvas}
            pageRef={pageRef}
            shape="pill"
            isPressed={isFocused}
          />
        </div>
      )}
      <div className={`absolute inset-0 flex items-center justify-between px-6 rounded-full pointer-events-none`}>
        <div className={`flex items-center gap-3 w-full transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {leftIcon && <div className="flex-shrink-0 opacity-80">{leftIcon}</div>}
          <input
            {...props}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={`w-full bg-transparent border-none outline-none font-medium text-lg placeholder:text-current placeholder:opacity-50 pointer-events-auto ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          />
        </div>
        {rightIcon && <div className={`flex-shrink-0 ml-3 transition-colors duration-500 opacity-80 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rightIcon}</div>}
      </div>
    </div>
  );
};

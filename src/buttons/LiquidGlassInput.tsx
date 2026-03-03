import React, { useState } from 'react';
import { LiquidGlassButton } from './LiquidGlassButton';

export interface LiquidGlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'shape'> {
  domCanvas: HTMLCanvasElement | null;
  pageRef: React.RefObject<HTMLElement | null>;
  isDarkMode?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const LiquidGlassInput: React.FC<LiquidGlassInputProps> = ({
  domCanvas,
  pageRef,
  isDarkMode = true,
  leftIcon,
  rightIcon,
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative w-full h-16 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] group ${className}`}>
      <div className={`absolute inset-0 transition-opacity duration-500 ${domCanvas ? 'opacity-100' : 'opacity-0'}`}>
        <LiquidGlassButton 
          domCanvas={domCanvas} 
          pageRef={pageRef} 
          shape="pill" 
          isPressed={isFocused} 
        />
      </div>
      <div className={`absolute inset-0 flex items-center justify-between px-6 border rounded-full transition-colors duration-500 pointer-events-none ${isFocused ? (isDarkMode ? 'border-white/40' : 'border-black/40') : (isDarkMode ? 'border-white/20' : 'border-black/10')}`}>
        <div className={`flex items-center gap-3 w-full transition-colors duration-500 ${isDarkMode ? 'text-white/80' : 'text-gray-900/80'}`}>
          {leftIcon && <div className="flex-shrink-0">{leftIcon}</div>}
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
            className={`w-full bg-transparent border-none outline-none font-medium text-lg placeholder:text-current placeholder:opacity-70 pointer-events-auto ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          />
        </div>
        {rightIcon && <div className={`flex-shrink-0 ml-3 transition-colors duration-500 ${isDarkMode ? 'text-white/80' : 'text-gray-900/80'}`}>{rightIcon}</div>}
      </div>
    </div>
  );
};

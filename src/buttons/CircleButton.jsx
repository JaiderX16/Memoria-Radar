import React, { forwardRef } from 'react';

/**
 * CircleButton - Un botón premium con estética de vidrio (Glassmorphism).
 * Diseñado para sentirse vivo y elegante con efectos de desenfoque y gradientes sutiles.
 */
const CircleButton = forwardRef(({
  children,
  onClick,
  className = '',
  style = {},
  isTransparentMode = false,
  isDarkMode = true,
  disabled = false,
  ...props
}, ref) => {

  // Clases base para el diseño redondeado y efectos de transición suaves
  const baseClasses = "group relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-90 disabled:opacity-40 disabled:pointer-events-none overflow-hidden";

  // Capas de fondo y bordes para el efecto Glassmorphism premium (Estilo Apple)
  // Reducimos contrastes y aumentamos el blur para una estética más refinada
  const glassClasses = isTransparentMode
    ? 'bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/40'
    : `bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-110 active:scale-95 [--tw-gradient-from:rgba(255,255,255,0.4)] dark:[--tw-gradient-from:rgba(255,255,255,0.01)]`;

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${glassClasses} ${className}`}
      style={{
        ...style,
        // Gradiente interno extremadamente sutil para profundidad Apple-like
        backgroundImage: 'radial-gradient(circle at top left, var(--tw-gradient-from), transparent)',
      }}
      {...props}
    >
      {/* Efecto de brillo al pasar el mouse (Glow effect) más sutil */}
      <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-700 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />

      {/* Contenido (icono/hijos) con un z-index superior */}
      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
        {children}
      </div>

      {/* Brillo en el borde (Highlight) */}
      <div className="absolute inset-0 border border-white/5 rounded-full pointer-events-none" />
    </button>
  );
});

CircleButton.displayName = 'CircleButton';

export default CircleButton;

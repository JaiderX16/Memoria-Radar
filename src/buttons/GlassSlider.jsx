import React, { useState, useRef, useEffect, useCallback } from 'react';

export const GlassSlider = () => {
  // Estado para el progreso del slider (0 a 100)
  const [value, setValue] = useState(40);
  // Estado para saber si el usuario está interactuando con el slider
  const [isDragging, setIsDragging] = useState(false);
  // Referencia al contenedor para calcular la posición exacta
  const sliderRef = useRef(null);

  // Calcula el porcentaje basado en la posición del puntero del usuario
  const handleMove = useCallback((clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let percent = ((clientX - rect.left) / rect.width) * 100;

    // Limitamos el valor entre 0 y 100
    percent = Math.max(0, Math.min(100, percent));
    setValue(percent);
  }, []);

  // Se dispara al hacer clic o al tocar el slider/pulgar
  const handlePointerDown = (e) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  // Efecto para escuchar los movimientos globales una vez que se inicia el arrastre
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      handleMove(e.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    // Usamos el document para asegurar que el usuario puede arrastrar 
    // incluso si el cursor se sale visualmente del contenedor del slider
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    // Limpieza de eventos
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="glass-slider-wrapper">
      <style>{`
        /* --- Estilos consolidados --- */
        .glass-slider-wrapper {
          font-family: "Inter", sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          min-height: 300px;
          background-color: transparent;
          box-sizing: border-box;
        }

        .slider-container {
          position: relative;
          width: 320px;
          height: 10px;
          background: #D6D6DA;
          border-radius: 999px;
          /* Previene el scroll de la página en móviles mientras se arrastra */
          touch-action: none; 
          cursor: pointer;
        }

        .slider-progress {
          position: absolute;
          height: 100%;
          background: linear-gradient(117deg, #49a3fc 0%, #3681ee 100%);
          border-radius: 999px;
          z-index: 1;
        }

        .slider-thumb-glass {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 65px;
          height: 42px;
          border-radius: 999px;
          cursor: pointer;
          z-index: 2;
          background-color: #fff;
          box-shadow: 0 1px 8px 0 rgba(0, 30, 63, 0.1), 0 0 2px 0 rgba(0, 9, 20, 0.1);
          overflow: hidden;
          /* Force hardware acceleration and clipping for filters */
          -webkit-mask-image: -webkit-radial-gradient(white, black);
          isolation: isolate;
          transition: transform 0.15s ease, height 0.15s ease;
        }

        .slider-thumb-glass-filter {
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: inherit;
          backdrop-filter: blur(0.6px);
          -webkit-backdrop-filter: blur(0.6px);
          filter: url(#mini-liquid-lens);
        }

        .slider-thumb-glass-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background-color: rgba(255, 255, 255, 0.1);
        }

        .slider-thumb-glass-specular {
          position: absolute;
          inset: 0;
          z-index: 2;
          border-radius: inherit;
          box-shadow:
            inset 1px 1px 0 rgba(69, 168, 243, 0.2),
            inset 1px 3px 0 rgba(28, 63, 90, 0.05),
            inset 0 0 22px rgb(255 255 255 / 60%),
            inset -1px -1px 0 rgba(69, 168, 243, 0.12);
        }

        .slider-thumb-glass-filter,
        .slider-thumb-glass-overlay,
        .slider-thumb-glass-specular {
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        /* --- Estado Activo (Dragging) --- */
        .slider-thumb-glass.active {
          background-color: transparent;
          box-shadow: none;
        }

        .slider-thumb-glass.active .slider-thumb-glass-filter,
        .slider-thumb-glass.active .slider-thumb-glass-overlay,
        .slider-thumb-glass.active .slider-thumb-glass-specular {
          opacity: 1;
        }

        .slider-thumb-glass:active {
          transform: translate(-50%, -50%) scaleY(0.98) scaleX(1.1);
        }
      `}</style>

      {/* --- Estructura del Slider --- */}
      <div
        className="slider-container"
        ref={sliderRef}
        onPointerDown={handlePointerDown}
      >
        <div
          className="slider-progress"
          style={{ width: `${value}%` }}
        />
        <div
          className={`slider-thumb-glass ${isDragging ? 'active' : ''}`}
          style={{ left: `${value}%` }}
        >
          <div className="slider-thumb-glass-filter" />
          <div className="slider-thumb-glass-overlay" />
          <div className="slider-thumb-glass-specular" />
        </div>
      </div>

      {/* --- SVG Filter (Lente Líquido) --- */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="mini-liquid-lens" x="-50%" y="-50%" width="200%" height="200%">
          <feImage
            x="0"
            y="0"
            result="normalMap"
            xlinkHref="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><radialGradient id='invmap' cx='50%' cy='50%' r='75%'><stop offset='0%' stop-color='rgb(128,128,255)'/><stop offset='90%' stop-color='rgb(255,255,255)'/></radialGradient><rect width='100%' height='100%' fill='url(%23invmap)'/></svg>"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="normalMap"
            scale="-252"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feMerge>
            <feMergeNode in="displaced" />
          </feMerge>
        </filter>
      </svg>
    </div>
  );
}

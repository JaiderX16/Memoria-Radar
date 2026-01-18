import React, { useRef, useState, useEffect } from "react";
import * as THREE from 'three';
import { Navigation, X, Clock, ChevronDown, ChevronRight, Star, Globe, ArrowRight } from "lucide-react";

// --- GENERADOR DE TEXTURA (360 Fallback) ---
const createFallbackTexture = (colorHex) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // Fondo (Darker for dark theme)
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(1, '#0f0f0f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);

  // Horizonte
  ctx.fillStyle = '#27272a'; // zinc-800
  ctx.fillRect(0, 128, 512, 128);

  // Elementos
  ctx.fillStyle = colorHex || '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.bezierCurveTo(150, 100, 350, 200, 512, 150);
  ctx.lineTo(512, 256);
  ctx.lineTo(0, 256);
  ctx.globalAlpha = 0.6;
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Texto
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 10;
  ctx.fillText("VISTA 360", 256, 80);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText("Arrastra para moverte", 256, 100);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

// --- COMPONENTE VISOR 3D ---
const PanoramaViewer = ({ color }) => {
  const mountRef = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const lastInteractionTime = useRef(Date.now());

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer, scene, camera, sphere, animationId;

    try {
      const w = container.clientWidth;
      const h = container.clientHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
      camera.position.set(0, 0, 0.1);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const geometry = new THREE.SphereGeometry(10, 60, 40);
      // No invertimos la geometría, usamos BackSide en el material para verla desde dentro

      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(
        '/img/Parque_Constitucion.jpg',
        (tex) => {
          console.log('✅ Textura cargada:', tex.image.width, 'x', tex.image.height);
          tex.colorSpace = THREE.SRGBColorSpace; // IMPORTANTE: Para colores vivos y correctos
        },
        undefined,
        (err) => console.error('❌ Error cargando textura:', err)
      );

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide, // Renderizar el interior de la esfera
        color: 0xffffff,      // Color base blanco puro para no oscurecer
        transparent: false,
        opacity: 1
      });

      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      const onDown = (x, y) => {
        isDragging.current = true;
        previousMousePosition.current = { x, y };
        container.style.cursor = 'grabbing';
        lastInteractionTime.current = Date.now();
      };
      const onMove = (x, y) => {
        if (!isDragging.current) return;
        const deltaX = x - previousMousePosition.current.x;
        const deltaY = y - previousMousePosition.current.y;
        sphere.rotation.y += deltaX * 0.005;
        sphere.rotation.x += deltaY * 0.005;
        sphere.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, sphere.rotation.x));
        previousMousePosition.current = { x, y };
        lastInteractionTime.current = Date.now();
      };
      const onUp = () => {
        isDragging.current = false;
        container.style.cursor = 'grab';
      };

      const handleMouseDown = (e) => { e.stopPropagation(); onDown(e.clientX, e.clientY); };
      const handleMouseMove = (e) => { if (isDragging.current) e.stopPropagation(); onMove(e.clientX, e.clientY); };
      const handleMouseUp = (e) => { onUp(); };

      // Zoom con rueda del mouse
      const handleWheel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        camera.fov = Math.max(30, Math.min(120, camera.fov - delta * 10));
        camera.updateProjectionMatrix();
      };

      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      const animate = () => {
        if (!sphere) return;
        if (!isDragging.current && Date.now() - lastInteractionTime.current > 2000) {
          sphere.rotation.y += 0.001;
          sphere.rotation.x = sphere.rotation.x * 0.95;
        }
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        if (animationId) cancelAnimationFrame(animationId);
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('wheel', handleWheel);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        renderer.dispose();
      };

    } catch (e) { console.error(e); }
  }, [color]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />;
};

export default function LugarModal({ selectedLocation, routeInfo, isRouting, onClose, onCalculateRoute }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
    setShowSidePanel(false);
  }, [selectedLocation]);

  const handleExpandClick = (e) => {
    e.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true); // Primer click: Expandir hacia abajo
    } else {
      setShowSidePanel(!showSidePanel); // Segundo click: Toggle panel lateral
    }
  };

  if (!selectedLocation) return null;

  return (
    <div className="flex items-end">
      {/* MODAL PRINCIPAL */}
      <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden animate-spring-in w-[340px] relative z-20 transition-spring">

        {/* Visor 360 */}
        <div className="relative w-full h-40 bg-black group touch-none">
          <PanoramaViewer color={selectedLocation.color} />
          <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm pointer-events-none border border-gray-200 dark:border-white/10">
            <div className="w-1.5 h-1.5 rounded-full border border-white/80 border-t-transparent animate-spin"></div>
            <span className="text-[9px] font-bold text-gray-800 dark:text-white/90 tracking-wide">360° LIVE</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-2 right-2 p-1.5 bg-gray-200/80 dark:bg-black/40 hover:bg-gray-300 dark:hover:bg-black/60 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors backdrop-blur-sm border border-gray-300 dark:border-white/10"
          >
            <X size={14} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{selectedLocation.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-gray-500 dark:text-white/50 font-medium">Ubicación seleccionada</p>
              {(selectedLocation.lat !== undefined || selectedLocation.latitud !== undefined) && (
                <span className="text-[10px] font-mono bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-gray-500 dark:text-white/30 border border-gray-200 dark:border-white/5">
                  {selectedLocation.lat ?? selectedLocation.latitud}, {selectedLocation.lng ?? selectedLocation.longitud}
                </span>
              )}
            </div>
          </div>

          {/* Área Expandida */}
          {isExpanded && (
            <div className="mb-4 animate-expand-down">
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed mb-3">
                Explora este increíble lugar con vistas panorámicas únicas.
                Ideal para reuniones y eventos corporativos.
              </p>
              <div className="flex gap-2">
                <span className="text-[10px] bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded border border-green-200 dark:border-green-500/30 font-medium">Abierto</span>
                <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-400 px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700">Wifi Gratis</span>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-2">
            {/* Botón de Ruta */}
            <div className="flex-1">
              {routeInfo ? (
                <div className="bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-2.5 flex items-center justify-between h-full">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-200">
                    <Clock size={16} />
                    <span className="font-bold text-sm">{routeInfo.duration} min</span>
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-300 font-medium">
                    {routeInfo.distance} km
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onCalculateRoute(); }}
                  disabled={isRouting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed h-full"
                >
                  {isRouting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Navigation size={16} fill="currentColor" />
                      Ir a lugar
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Botón Expansor */}
            <button
              onClick={handleExpandClick}
              className={`
                w-12 rounded-xl flex items-center justify-center transition-spring border
                ${showSidePanel
                  ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-lg' // Activo
                  : isExpanded
                    ? 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 border-gray-200 dark:border-zinc-700 scale-100' // Intermedio
                    : 'bg-gray-50 dark:bg-zinc-800/50 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 border-gray-200 dark:border-zinc-700/50 scale-100'} // Inicial
              `}
            >
              {isExpanded ? (
                <ArrowRight size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PANEL LATERAL (Reviews) */}
      {showSidePanel && (
        <div className="ml-2 w-[280px] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden animate-slide-right h-[380px] flex flex-col z-10">
          {/* Header Lateral */}
          <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Star size={14} className="text-orange-400 fill-orange-400" />
              Reseñas y Detalles
            </h3>
          </div>

          {/* Contenido Scrolleable */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 p-2 rounded-xl text-center border border-blue-200 dark:border-blue-500/20">
                <Clock className="mx-auto text-blue-600 dark:text-blue-400 mb-1" size={16} />
                <span className="block text-[10px] font-semibold text-blue-700 dark:text-blue-200">09:00 - 18:00</span>
              </div>
              <div className="bg-green-50 dark:bg-green-500/10 p-2 rounded-xl text-center border border-green-200 dark:border-green-500/20">
                <Globe className="mx-auto text-green-600 dark:text-green-400 mb-1" size={16} />
                <span className="block text-[10px] font-semibold text-green-700 dark:text-green-200">Online</span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-gray-600 dark:text-zinc-400 mb-2">Lo que dice la gente</h4>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg border border-gray-200 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-zinc-300">Usuario {i}</span>
                    <div className="flex ml-auto">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={6} className="fill-orange-400 text-orange-400" />)}</div>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-zinc-500 leading-snug">
                    "Una experiencia increíble, las vistas 360 son lo mejor que he visto en una app de mapas."
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button className="w-full py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-zinc-400 rounded-lg text-xs font-semibold transition-colors">
                Ver las 1.2k reseñas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

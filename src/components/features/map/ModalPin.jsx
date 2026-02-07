import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Navigation, X, Clock, ChevronDown, ArrowRight, Star, Globe } from 'lucide-react';

// TODO: Reemplazar con URL de imagen 360 real desde backend
const DEFAULT_360_IMAGE = '/img/Parque_Constitucion.jpg';

// Componente Visor 360° con Three.js
const PanoramaViewer = ({ imageUrl = DEFAULT_360_IMAGE, color }) => {
  const mountRef = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

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
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(
        imageUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
        },
        undefined,
        (err) => console.error('Error cargando imagen 360:', err)
      );

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
        color: 0xffffff,
        transparent: false,
        opacity: 1
      });

      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        if (!isDragging.current) {
          sphere.rotation.y += 0.0005; // Auto-rotación lenta
        }
        renderer.render(scene, camera);
      };
      animate();

      // Mouse/Touch interactions
      const onPointerDown = (e) => {
        isDragging.current = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        previousMousePosition.current = { x: clientX, y: clientY };
      };

      const onPointerMove = (e) => {
        if (!isDragging.current) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaMove = {
          x: clientX - previousMousePosition.current.x,
          y: clientY - previousMousePosition.current.y
        };

        const deltaRotationQuaternion = new THREE.Quaternion()
          .setFromEuler(new THREE.Euler(
            (deltaMove.y * (Math.PI / 180)) * 0.3,
            (deltaMove.x * (Math.PI / 180)) * 0.3,
            0,
            'XYZ'
          ));

        sphere.quaternion.multiplyQuaternions(deltaRotationQuaternion, sphere.quaternion);
        previousMousePosition.current = { x: clientX, y: clientY };
      };

      const onPointerUp = () => {
        isDragging.current = false;
      };

      renderer.domElement.addEventListener('mousedown', onPointerDown);
      renderer.domElement.addEventListener('mousemove', onPointerMove);
      renderer.domElement.addEventListener('mouseup', onPointerUp);
      renderer.domElement.addEventListener('touchstart', onPointerDown);
      renderer.domElement.addEventListener('touchmove', onPointerMove);
      renderer.domElement.addEventListener('touchend', onPointerUp);

      return () => {
        cancelAnimationFrame(animationId);
        renderer.domElement.removeEventListener('mousedown', onPointerDown);
        renderer.domElement.removeEventListener('mousemove', onPointerMove);
        renderer.domElement.removeEventListener('mouseup', onPointerUp);
        renderer.domElement.removeEventListener('touchstart', onPointerDown);
        renderer.domElement.removeEventListener('touchmove', onPointerMove);
        renderer.domElement.removeEventListener('touchend', onPointerUp);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (error) {
      console.error('Error inicializando visor 360:', error);
    }
  }, [imageUrl]);

  return <div ref={mountRef} className="w-full h-full rounded-t-2xl overflow-hidden bg-black" />;
};

// Componente Modal Principal
const ModalPin = ({ selectedLocation, onClose, onCalculateRoute, routeInfo, isRouting }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

  const handleExpandClick = (e) => {
    e.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
    } else if (isExpanded && !showSidePanel) {
      setShowSidePanel(true);
    } else {
      setIsExpanded(false);
      setShowSidePanel(false);
    }
  };

  return (
    <div className="flex items-start">
      {/* Modal Principal */}
      <div className="w-[340px] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden animate-scale-in h-[380px] flex flex-col">
        {/* Visor 360 */}
        <div className="h-48 relative bg-black">
          <PanoramaViewer color={selectedLocation.color} />
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-2 right-2 p-1.5 bg-gray-200/80 dark:bg-black/40 hover:bg-gray-300 dark:hover:bg-black/60 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors backdrop-blur-sm border border-gray-300 dark:border-white/10"
          >
            <X size={14} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{selectedLocation.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-gray-500 dark:text-white/50 font-medium">
                {selectedLocation.categoria || 'Lugar turístico'}
              </p>
              {(selectedLocation.lat !== undefined || selectedLocation.latitud !== undefined) && (
                <span className="text-[10px] font-mono bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-gray-500 dark:text-white/30 border border-gray-200 dark:border-white/5">
                  {(selectedLocation.lat ?? selectedLocation.latitud).toFixed(4)}, {(selectedLocation.lng ?? selectedLocation.longitud).toFixed(4)}
                </span>
              )}
            </div>
          </div>

          {/* Descripción expandida */}
          {isExpanded && (
            <div className="mb-4 animate-expand-down">
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed mb-3">
                {selectedLocation.descripcion || 'Descripción del lugar disponible próximamente.'}
              </p>
              {selectedLocation.website && (
                <a
                  href={selectedLocation.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Globe size={12} />
                  Sitio web
                </a>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 mt-auto">
            {/* Botón de ruta */}
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

            {/* Botón expansor */}
            <button
              onClick={handleExpandClick}
              className={`w-12 rounded-xl flex items-center justify-center transition-all border
                ${showSidePanel
                  ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-lg'
                  : isExpanded
                    ? 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 border-gray-200 dark:border-zinc-700'
                    : 'bg-gray-50 dark:bg-zinc-800/50 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 border-gray-200 dark:border-zinc-700/50'
                }`}
            >
              {isExpanded ? <ArrowRight size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Panel lateral de detalles (TODO: Cargar desde backend) */}
      {showSidePanel && (
        <div className="ml-2 w-[280px] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden animate-slide-right h-[380px] flex flex-col z-10">
          <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Star size={14} className="text-orange-400 fill-orange-400" />
              Información adicional
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <p className="text-xs text-gray-600 dark:text-zinc-400 mb-4">
              TODO: Cargar horarios, reseñas y detalles desde el backend.
            </p>

            {/* Placeholder para información adicional */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 p-2 rounded-xl text-center border border-blue-200 dark:border-blue-500/20">
                <Clock className="mx-auto text-blue-600 dark:text-blue-400 mb-1" size={16} />
                <span className="block text-[10px] font-semibold text-blue-700 dark:text-blue-200">Horario</span>
              </div>
              <div className="bg-green-50 dark:bg-green-500/10 p-2 rounded-xl text-center border border-green-200 dark:border-green-500/20">
                <Globe className="mx-auto text-green-600 dark:text-green-400 mb-1" size={16} />
                <span className="block text-[10px] font-semibold text-green-700 dark:text-green-200">Estado</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalPin;

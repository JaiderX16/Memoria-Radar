import React, { useState, useEffect } from 'react';
import { Navigation, X, Clock, ChevronUp, ArrowRight, ArrowLeft, Star, Globe } from 'lucide-react';

// ... (rest of imports remains same, skipping for brevity in replacement)



// Componente Visor Luma (reemplaza el visor 360° con Three.js)
const PanoramaViewer = () => {
  return (
    <div className="w-full h-full relative bg-gray-100 overflow-hidden">
      <iframe
        src="https://lumalabs.ai/embed/4b2a92dc-983f-433e-aa43-f89db0ea5917?mode=sparkles&background=%23ffffff&color=%23000000&showTitle=true&loadBg=true&logoPosition=bottom-left&infoPosition=bottom-right&cinematicVideo=undefined&showMenu=false"
        width="100%"
        height="100%"
        title="luma embed"
        style={{ border: 'none' }}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; gyroscope; magnetometer; xr-spatial-tracking"
      />
    </div>
  );
};

// Componente Modal Principal
const ModalPin = ({ selectedLocation, onClose, onCalculateRoute, routeInfo, isRouting }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

  // Resetear estado cuando cambia la ubicación seleccionada
  useEffect(() => {
    setIsExpanded(false);
    setShowSidePanel(false);
  }, [selectedLocation.id]);

  const handleExpandClick = (e) => {
    e.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
    } else {
      setShowSidePanel(!showSidePanel);
    }
  };

  return (
    <div className="relative flex items-stretch gap-0">
      {/* MODAL PRINCIPAL - Alineado con panel lateral */}
      <div
        className="w-[340px] pointer-events-auto z-[100] animate-in zoom-in-95 fade-in duration-300 origin-bottom flex"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="bg-white/80 backdrop-blur-2xl dark:bg-[#121214]/85 dark:backdrop-blur-2xl rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border-transparent overflow-y-auto scrollbar-hide ring-1 ring-black/5 transition-all duration-300 flex flex-col w-full max-h-[550px]">

          {/* Visor Luma o Imagen Fallback */}
          <div className="relative w-full h-48 bg-gray-100 dark:bg-[#1c1c1e] group">
            {selectedLocation.image || selectedLocation.imagen ? (
              <img
                src={selectedLocation.image || selectedLocation.imagen}
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                alt={selectedLocation.name}
              />
            ) : null}
            <div className="absolute inset-0">
              <PanoramaViewer />
            </div>

            {/* Overlay "LIVE" */}
            <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm pointer-events-none">
              <div className="w-2 h-2 rounded-full border-2 border-black/80 dark:border-white/80 border-t-transparent animate-spin"></div>
              <span className="text-[10px] font-bold text-black/80 dark:text-white/80 tracking-wide">3D LIVE</span>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-[20px] font-semibold text-black dark:text-white tracking-tight leading-tight">
                  {selectedLocation.name}
                </h2>
                <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">
                  {selectedLocation.categoria || 'Lugar turístico'}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-8 h-8 bg-gray-100 dark:bg-[#1c1c1e]/50 hover:bg-gray-200 dark:hover:bg-[#1c1c1e] rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Descripción expandida */}
            {isExpanded && (
              <div className="mt-4 mb-2 animate-in slide-in-from-top-4 fade-in duration-300">
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-3">
                  {selectedLocation.descripcion || 'Explora este increíble lugar con vistas panorámicas únicas.'}
                </p>
                <div className="flex gap-2 mb-2">
                  <span className="text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-md font-medium">Abierto</span>
                  {selectedLocation.website && (
                    <a
                      href={selectedLocation.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                    >
                      Ver sitio web
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 mt-auto">
              {routeInfo ? (
                <div className="basis-2/3 bg-blue-50 dark:bg-blue-500/20 border-transparent rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                    <Clock size={16} />
                    <span className="font-bold text-sm">{routeInfo.duration} min</span>
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    {routeInfo.distance} km
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onCalculateRoute(); }}
                  disabled={isRouting}
                  className="basis-2/3 bg-[#007AFF] hover:bg-[#0062cc] active:scale-[0.98] transition-all text-white font-medium text-[15px] py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRouting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Navigation size={18} strokeWidth={2.5} fill="currentColor" className="text-white/20" />
                      <span>Ir al sitio</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleExpandClick}
                className={`
                  basis-1/3 active:scale-[0.95] transition-all rounded-2xl flex items-center justify-center
                  ${showSidePanel
                    ? 'bg-black dark:bg-white text-white dark:text-black ring-2 ring-offset-2 ring-black dark:ring-white'
                    : isExpanded
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                      : 'bg-gray-100 dark:bg-[#1c1c1e]/50 hover:bg-gray-200 dark:hover:bg-[#1c1c1e] text-[#007AFF] dark:text-white'}
                `}
              >
                {showSidePanel ? (
                  <ArrowLeft size={24} strokeWidth={2.5} />
                ) : isExpanded ? (
                  <ArrowRight size={24} strokeWidth={2.5} />
                ) : (
                  <ChevronUp size={24} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL LATERAL */}
      {showSidePanel && (
        <div
          className="absolute left-full top-0 h-full w-[340px] ml-2 pointer-events-auto z-[90] animate-in slide-in-from-right-8 fade-in duration-300 flex"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="bg-white/90 backdrop-blur-2xl dark:bg-[#121214]/85 dark:backdrop-blur-2xl rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border-transparent overflow-hidden ring-1 ring-black/5 flex flex-col w-full h-full">

            {/* Cabecera del Panel Lateral */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                <Star size={20} className="text-orange-400 fill-orange-400" />
                Reseñas y Detalles
              </h3>
              <div className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500 dark:text-gray-300">
                4.8 ★
              </div>
            </div>

            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-hide space-y-6">

              {/* Sección de Estado y Horario */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-blue-100 dark:border-blue-500/10">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <Clock className="text-blue-600 dark:text-blue-400" size={18} strokeWidth={2.5} />
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-blue-400 dark:text-blue-300/70 mb-0.5">Horario</span>
                    <span className="block text-sm font-bold text-slate-700 dark:text-zinc-200">09:00 - 18:00</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-500/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Globe className="text-emerald-600 dark:text-emerald-400" size={18} strokeWidth={2.5} />
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-emerald-400 dark:text-emerald-300/70 mb-0.5">Estado</span>
                    <span className="block text-sm font-bold text-slate-700 dark:text-zinc-200">Abierto Ahora</span>
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="h-px bg-gray-100 dark:bg-white/5 w-full"></div>

              {/* Lista de Reseñas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white/90">
                    Comentarios Recientes
                  </h4>
                  <span className="text-xs text-slate-400 dark:text-white/40">3 nuevos</span>
                </div>

                {[1, 2, 3].map((i) => (
                  <div key={i} className="group bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 p-4 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-white/80 ring-2 ring-white dark:ring-[#121214]">
                        U{i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-white truncate">Usuario Demo {i}</span>
                          <span className="text-[10px] text-slate-400 dark:text-white/30">Hace 2h</span>
                        </div>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={10} className={`${s <= 4 ? "fill-orange-400 text-orange-400" : "fill-gray-200 dark:fill-white/10 text-gray-200 dark:text-white/10"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed pl-1 border-l-2 border-gray-100 dark:border-white/10">
                      "Una experiencia increíble, las vistas 3D son lo mejor que he visto en una app de mapas. Definitivamente volveré pronto."
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie del Panel */}
            <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 shrink-0">
              <button className="w-full py-3.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-200 active:scale-[0.98] text-white dark:text-black rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-900/10 dark:shadow-white/5">
                Ver las 128 reseñas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalPin;

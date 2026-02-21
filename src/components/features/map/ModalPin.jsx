import React, { useState, useEffect } from 'react';
import { Navigation, X, Clock, ChevronUp, ArrowRight, ArrowLeft, Star, Globe, Info, TrendingUp } from 'lucide-react';

// Componente Visor Luma
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

// Componente Modal Principal con Panel Lateral
const ModalPin = ({ selectedLocation, onClose, onCalculateRoute, routeInfo, isRouting }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [sidePanelTab, setSidePanelTab] = useState('info'); // 'info' o 'reviews'
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');

  // Resetear estado cuando cambia la ubicación seleccionada
  useEffect(() => {
    setIsExpanded(false);
    setShowSidePanel(false);
    setSidePanelTab('info');
    setUserRating(0);
    setUserComment('');
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
      {/* MODAL PRINCIPAL */}
      <div
        className="w-[340px] pointer-events-auto z-[100] animate-in zoom-in-95 fade-in duration-300 origin-bottom flex"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white/80 backdrop-blur-2xl dark:bg-[#121214]/85 dark:backdrop-blur-2xl rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border-transparent overflow-y-auto scrollbar-hide ring-1 ring-black/5 transition-all duration-300 flex flex-col w-full max-h-[550px]">

          {/* Visor Luma / Imagen */}
          <div className="relative w-full h-48 bg-gray-100 dark:bg-[#1c1c1e] group shrink-0">
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

            <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <div className="w-2 h-2 rounded-full border-2 border-black/80 dark:border-white/80 border-t-transparent animate-spin"></div>
              <span className="text-[10px] font-black tracking-widest text-black/80 dark:text-white/80">3D LIVE</span>
            </div>
          </div>

          {/* Contenido Modal Principal */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-[22px] font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase mb-1">
                  {selectedLocation.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                    {selectedLocation.categoria || 'Explorar'}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-8 h-8 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>

            {isExpanded && (
              <div className="mb-4 animate-in slide-in-from-top-2 fade-in duration-300">
                <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mb-4">
                  {selectedLocation.descripcion || 'Descubre los secretos de esta ubicación única con tecnología 3D inmersiva.'}
                </p>
                <div className="flex gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Abierto
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-auto pt-4">
              {routeInfo ? (
                <div className="basis-2/3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-3 flex items-center justify-between border border-blue-100/50 dark:border-blue-500/10">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Clock size={16} strokeWidth={3} />
                    <span className="font-black text-sm">{routeInfo.duration} min</span>
                  </div>
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{routeInfo.distance} KM</span>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onCalculateRoute(); }}
                  disabled={isRouting}
                  className="basis-2/3 bg-[#007AFF] hover:bg-blue-600 active:scale-[0.98] transition-all text-white font-black text-[14px] py-4 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  {isRouting ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Navigation size={18} strokeWidth={3} className="opacity-40" />
                      <span>IR AL SITIO</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleExpandClick}
                className={`
                  basis-1/3 active:scale-[0.95] transition-all rounded-2xl flex items-center justify-center
                  ${showSidePanel
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-2xl'
                    : isExpanded
                      ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200'
                      : 'bg-slate-100 dark:bg-white/5 text-blue-500 hover:bg-slate-200'}
                `}
              >
                {showSidePanel ? <ArrowLeft size={22} strokeWidth={3} /> : isExpanded ? <ArrowRight size={22} strokeWidth={3} /> : <ChevronUp size={22} strokeWidth={3} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL LATERAL */}
      {showSidePanel && (
        <div
          className="absolute left-full top-0 h-full w-[340px] ml-3 pointer-events-auto z-[90] animate-in slide-in-from-left-8 fade-in duration-400 flex"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white/95 backdrop-blur-3xl dark:bg-[#121214]/95 rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-white/20 dark:border-white/5 overflow-hidden flex flex-col w-full h-full ring-1 ring-black/5">

            {/* Sub-Navegación del Panel Lateral */}
            <div className="px-6 pt-7 pb-3 shrink-0 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">
                  {sidePanelTab === 'info' ? 'Dashboard' : 'Reseñas'}
                </h3>
                <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-100 dark:border-orange-500/10">
                  <Star size={12} className="fill-orange-400 text-orange-400" />
                  <span className="text-[10px] font-black text-orange-600 dark:text-orange-400">4.8</span>
                </div>
              </div>

              <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5">
                <button
                  onClick={() => setSidePanelTab('info')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sidePanelTab === 'info' ? 'bg-white dark:bg-white/10 text-blue-500 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
                >
                  <Info size={14} strokeWidth={3} />
                  Info
                </button>
                <button
                  onClick={() => setSidePanelTab('reviews')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sidePanelTab === 'reviews' ? 'bg-white dark:bg-white/10 text-orange-500 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
                >
                  <Star size={14} strokeWidth={3} />
                  Reseñas
                </button>
              </div>
            </div>

            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-6">
              {sidePanelTab === 'info' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Grid de Dashboards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-500/5 dark:to-transparent p-4 rounded-2xl border border-blue-100/50 dark:border-white/5 group hover:scale-[1.02] transition-all">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Clock size={16} strokeWidth={3} className="text-blue-600 dark:text-blue-400 group-hover:text-inherit" />
                      </div>
                      <span className="block text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Horarios</span>
                      <span className="block text-xs font-black text-slate-700 dark:text-white">10:00 - 22:00</span>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-500/5 dark:to-transparent p-4 rounded-2xl border border-emerald-100/50 dark:border-white/5 group hover:scale-[1.02] transition-all">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Globe size={16} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400 group-hover:text-inherit" />
                      </div>
                      <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Estado</span>
                      <span className="block text-xs font-black text-slate-700 dark:text-white flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Online
                      </span>
                    </div>

                    <div className="col-span-2 bg-slate-900 dark:bg-black/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={48} />
                      </div>
                      <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-1">
                          <span className="block text-[8px] font-black text-orange-400 uppercase tracking-widest">Popularidad</span>
                          <span className="block text-2xl font-black text-white tracking-tighter">85%</span>
                          <span className="block text-[10px] font-bold text-white/40">Más concurrido hoy</span>
                        </div>
                        <div className="flex gap-1 h-10 items-end">
                          {[20, 45, 30, 90, 75, 50, 40].map((h, i) => (
                            <div key={i} className={`w-2 rounded-t-sm transition-all duration-500 ${i === 3 ? 'bg-orange-500 h-10' : 'bg-white/10 h-6'}`} style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Resumen Profesional</h4>
                    <p className="text-[13px] text-slate-600 dark:text-zinc-400 font-medium leading-relaxed italic border-l-2 border-slate-900/10 dark:border-white/10 pl-5">
                      "Este espacio se destaca por su excelencia y su impacto cultural, siendo una visita obligada para quienes buscan el corazón de la ciudad."
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* FORMULARIO RESEÑA */}
                  <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Añadir Reseña</h4>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setUserRating(s)} className="transition-transform active:scale-90">
                            <Star size={18} className={s <= userRating ? "fill-orange-400 text-orange-400" : "text-gray-300 dark:text-white/10"} strokeWidth={3} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      placeholder="Escribe tu comentario aquí..."
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-xs font-semibold placeholder:text-gray-400 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none h-24"
                    />
                    <button
                      className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${userRating > 0 ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xl hover:scale-[1.02]' : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'}`}
                      disabled={userRating === 0}
                    >
                      PUBLICAR EXPERIENCIA
                    </button>
                  </div>

                  {/* Feed de Reseñas */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Comunidad</h4>
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">M{i}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <span className="text-[11px] font-black text-slate-800 dark:text-white">Viajero Anon {i}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase">2h</span>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={8} className={`${s <= 4 ? "fill-orange-400 text-orange-400" : "text-gray-200"}`} />)}
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed">"Increíble descubrimiento en el mapa 3D. El nivel de detalle es impresionante."</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Acción */}
            <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5 shrink-0">
              <button className="w-full py-4 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 active:scale-[0.98] text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-200 dark:border-white/10 shadow-sm">
                LEER TODAS LAS RESEÑAS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalPin;

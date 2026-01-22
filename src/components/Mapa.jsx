import React, { useRef, useState, useEffect } from 'react';
import {
  Map,
  MapMarker,
  MapControls,
  ControlGroup,
  ControlButton,
  MarkerContent,
  MarkerLabel,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from './MapLibre';
import { Info, MessageSquare } from 'lucide-react';

export default function Mapa({ onToggleChat, chatState }) {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isMarkerVisible, setIsMarkerVisible] = useState(true);

  // Solicitar ubicación automáticamente al cargar
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(coords);

          // Centrar suavemente el mapa en la ubicación del usuario
          if (mapRef.current) {
            mapRef.current.easeTo({
              center: [coords.longitude, coords.latitude],
              duration: 1500
            });
          }
        },
        (error) => {
          console.warn('No se pudo obtener la ubicación:', error.message);
        }
      );
    }
  }, []);

  // Verificar visibilidad del marcador (ocultar completamente si está detrás del globo)
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const checkVisibility = () => {
      const map = mapRef.current;

      try {
        // Proyectar coordenadas a píxeles de pantalla
        const point = map.project([userLocation.longitude, userLocation.latitude]);
        const canvas = map.getCanvas();

        // Verificar si está dentro del canvas visible
        const inViewport = point.x >= 0 && point.x <= canvas.width &&
          point.y >= 0 && point.y <= canvas.height;

        // Para proyección globe, verificar si está en el hemisferio visible
        const center = map.getCenter();
        const lng1 = userLocation.longitude;
        const lng2 = center.lng;

        // Calcular diferencia de longitud (rango -180 a 180)
        let deltaLng = Math.abs(lng1 - lng2);
        if (deltaLng > 180) deltaLng = 360 - deltaLng;

        // Si la diferencia es mayor a 90°, está en el hemisferio opuesto
        const inFrontHemisphere = deltaLng <= 90;

        setIsMarkerVisible(inViewport && inFrontHemisphere);
      } catch (error) {
        // Si hay error en la proyección, asumir no visible
        setIsMarkerVisible(false);
      }
    };

    const map = mapRef.current;
    map.on('move', checkVisibility);
    map.on('zoom', checkVisibility);
    map.on('rotate', checkVisibility);
    map.on('pitch', checkVisibility);

    checkVisibility();

    return () => {
      map.off('move', checkVisibility);
      map.off('zoom', checkVisibility);
      map.off('rotate', checkVisibility);
      map.off('pitch', checkVisibility);
    };
  }, [userLocation]);

  return (
    <div className="relative w-full h-full rounded-none overflow-hidden border-none bg-black">
      <Map
        ref={mapRef}
        projection={{ type: 'globe' }}
        theme="dark"
        center={[0, 20]}
        zoom={1.5}
        attributionControl={false}
      >
        <MapControls
          position="bottom-right"
          showZoom
          showCompass
          showLocate
          onLocate={(coords) => setUserLocation(coords)}
          chatState={chatState}
        >
          <ControlGroup>
            <ControlButton onClick={onToggleChat} label="Abrir Chat">
              <MessageSquare className="size-4" />
            </ControlButton>
          </ControlGroup>
        </MapControls>

        {/* Atribución Discreta */}
        <div className="absolute bottom-1 left-1 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 rounded-full bg-black/20 text-white/30 hover:bg-black/40 hover:text-white/80 transition-all backdrop-blur-sm">
                <Info className="w-3 h-3" />
                <span className="sr-only">Map credits</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-[10px] bg-black/80 text-white/70 border-none backdrop-blur-md">
              <p>© CARTO, © OpenStreetMap contributors</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Marcador de Ubicación del Usuario - Estilo Apple Maps */}
        {userLocation && isMarkerVisible && (
          <MapMarker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
          >
            <MarkerContent>
              <div className="relative flex items-center justify-center w-5 h-5 bg-[#C7C7C7] rounded-full shadow-lg ring-1 ring-black/10">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <div className="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-20"></div>
              </div>
            </MarkerContent>
            <MarkerLabel className="text-xs font-bold text-blue-500 bg-white px-2 py-1 rounded shadow-md mt-1">
              Tu Ubicación
            </MarkerLabel>
          </MapMarker>
        )}

        {/* TODO: Aquí se renderizarán los marcadores de lugares desde el backend */}
      </Map>
    </div>
  );
}

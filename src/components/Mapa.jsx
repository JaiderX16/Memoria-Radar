import React, { useRef, useState, useEffect } from "react";
import {
  Map,
  MapMarker,
  MapControls,
  ControlGroup,
  ControlButton,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "./MapLibre";
import { Info, MessageSquare } from "lucide-react";

const LOCATIONS = [
  { name: "North America", lat: 40, lng: -100, color: "#3b82f6" },
  { name: "South America", lat: -15, lng: -60, color: "#ef4444" },
  { name: "Europe", lat: 50, lng: 10, color: "#10b981" },
  { name: "Asia", lat: 34, lng: 100, color: "#f59e0b" },
  { name: "Africa", lat: 0, lng: 20, color: "#8b5cf6" },
  { name: "Australia", lat: -25, lng: 135, color: "#ec4899" },
];

export default function Mapa({ onToggleChat, chatState }) {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  // Limpiar ruta al desmontar o cambiar
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        const map = mapRef.current;
        if (map.getLayer('route')) map.removeLayer('route');
        if (map.getSource('route')) map.removeSource('route');
      }
    };
  }, []);

  // --- LÓGICA DE ROTACIÓN AUTOMÁTICA ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let animationFrameId;
    let userInteracting = false;
    let rotationStarted = false;

    const rotate = () => {
      if (!userInteracting && !isRouting && rotationStarted) {
        const center = map.getCenter();
        center.lng += 0.03; // Velocidad aumentada 50%
        map.setCenter(center);
        animationFrameId = requestAnimationFrame(rotate);
      }
    };

    const handleInteraction = () => {
      if (!userInteracting) {
        userInteracting = true;
        rotationStarted = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      }
    };

    const startRotation = () => {
      rotationStarted = true;
      rotate();
    };

    // Detener rotación al interactuar
    map.on('mousedown', handleInteraction);
    map.on('touchstart', handleInteraction);
    map.on('wheel', handleInteraction);
    map.on('dragstart', handleInteraction);
    map.on('zoomstart', handleInteraction);

    // Iniciar rotación cuando el mapa esté listo con un delay
    const timeoutId = setTimeout(startRotation, 500);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      map.off('mousedown', handleInteraction);
      map.off('touchstart', handleInteraction);
      map.off('wheel', handleInteraction);
      map.off('dragstart', handleInteraction);
      map.off('zoomstart', handleInteraction);
    };
  }, [isRouting]);


  const handleMarkerClick = (loc) => {
    setSelectedLocation(loc);
    setRouteInfo(null);

    // Limpiar ruta anterior si existe
    if (mapRef.current) {
      const map = mapRef.current;
      if (map.getLayer('route')) map.removeLayer('route');
      if (map.getSource('route')) map.removeSource('route');
    }

    // Fly to location
    mapRef.current?.flyTo({
      center: [loc.lng, loc.lat],
      zoom: 6,
      duration: 1500,
    });
  };

  const handleCloseModal = () => {
    setSelectedLocation(null);
    setRouteInfo(null);
    if (mapRef.current) {
      const map = mapRef.current;
      if (map.getLayer('route')) map.removeLayer('route');
      if (map.getSource('route')) map.removeSource('route');
    }
  };

  const calculateRoute = async () => {
    if (!userLocation || !selectedLocation) {
      alert("Necesitamos tu ubicación para calcular la ruta. Por favor usa el botón de localizar.");
      return;
    }

    setIsRouting(true);
    try {
      const start = `${userLocation.longitude},${userLocation.latitude}`;
      const end = `${selectedLocation.lng},${selectedLocation.lat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;

      console.log("🚗 Calculando ruta:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const durationMins = Math.round(route.duration / 60);
        const distanceKm = (route.distance / 1000).toFixed(1);

        setRouteInfo({ duration: durationMins, distance: distanceKm });

        // Dibujar ruta en el mapa
        const map = mapRef.current;
        if (map) {
          if (map.getLayer('route')) map.removeLayer('route');
          if (map.getSource('route')) map.removeSource('route');

          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          });

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#a855f7',
              'line-width': 6,
              'line-opacity': 0.8
            }
          });

          // Ajustar vista para mostrar toda la ruta
          const coordinates = route.geometry.coordinates;
          const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
          }, new mapRef.current.maplibre.LngLatBounds(coordinates[0], coordinates[0]));

          map.fitBounds(bounds, {
            padding: 50
          });
        }
      } else {
        console.warn("⚠️ No se encontró ruta:", data);
        alert("No se pudo encontrar una ruta válida entre estos puntos.");
      }
    } catch (error) {
      console.error("❌ Error calculando ruta:", error);
      alert(`Error al conectar con el servicio de rutas: ${error.message}`);
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="relative w-full h-full rounded-none overflow-hidden border-none bg-black">
      <Map
        ref={mapRef}
        projection={{ type: "globe" }}
        theme="dark"
        center={[-90, 40]}
        zoom={1.5}
        attributionControl={false}
        dragPan={true}
        scrollZoom={true}
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

        {/* Custom Discreet Attribution */}
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

        {userLocation && (
          <MapMarker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
          >
            <MarkerContent>
              <div className="relative flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-xl ring-1 ring-black/10 z-[999]">
                <div className="w-4 h-4 bg-blue-500 rounded-full" />
                <div className="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-20"></div>
              </div>
            </MarkerContent>
            <MarkerLabel className="text-xs font-bold text-blue-500 bg-white px-2 py-1 rounded shadow-md mt-1">
              Tu Ubicación
            </MarkerLabel>
          </MapMarker>
        )}

        {LOCATIONS.map((loc) => (
          <MapMarker
            key={loc.name}
            latitude={loc.lat}
            longitude={loc.lng}
            onClick={() => handleMarkerClick(loc)}
          >
            <MarkerContent>
              <div className="relative flex items-center justify-center w-4 h-4 cursor-pointer hover:scale-110 transition-transform">
                <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-50 animate-ping" />
                <div className="relative w-2.5 h-2.5 bg-blue-400 border-2 border-white rounded-full shadow-sm" />
              </div>
            </MarkerContent>
            <MarkerLabel className="text-xs font-bold tracking-wider text-white/90 drop-shadow-md">
              {loc.name.toUpperCase()}
            </MarkerLabel>

            {/* Popup Modal que sigue al marcador */}
            {selectedLocation?.name === loc.name && (
              <MarkerPopup
                offset={[0, -24]}
                anchor="bottom"
                className="min-w-[340px] p-0 border-none bg-transparent shadow-none"
              >
                <LugarModal
                  selectedLocation={selectedLocation}
                  routeInfo={routeInfo}
                  isRouting={isRouting}
                  onClose={handleCloseModal}
                  onCalculateRoute={calculateRoute}
                />
              </MarkerPopup>
            )}
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}

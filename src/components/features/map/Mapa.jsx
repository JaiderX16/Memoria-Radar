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
import { Info, MessageSquare, MapPin, Plus, X } from 'lucide-react';
import FormularioLugar from '@/components/features/places/FormularioLugar';
import ModalPin from './ModalPin';

export default function Mapa({ lugares, eventos = [], onLugarClick, onEventClick, isAddingMode, onMapClick, selectedLugar, selectedEvento, onToggleChat, chatState, mapTheme, starrySky }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isMarkerVisible, setIsMarkerVisible] = useState(true);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [newPoints, setNewPoints] = useState([]);
  const [tempPoint, setTempPoint] = useState(null);
  const [showPointForm, setShowPointForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [routeData, setRouteData] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

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

  // Efecto para mover el fondo estrellado
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !starrySky || !containerRef.current) return;

    const updateBackground = () => {
      const center = map.getCenter();
      const { lng, lat } = center;
      // Factor de movimiento: ajusta para más o menos sensibilidad
      const x = -lng * 10;
      const y = -lat * 10;

      containerRef.current.style.backgroundPosition = `${x}px ${y}px`;
    };

    map.on('move', updateBackground);
    // Inicializar posición
    updateBackground();

    return () => {
      map.off('move', updateBackground);
    };
  }, [starrySky, mapRef.current]); // Re-ejecutar si se activa/desactiva o cambia el mapa

  // Manejar clicks en el mapa cuando está en modo agregar
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (isAddingPoint) {
        const { lng, lat } = e.lngLat;
        setTempPoint({ longitud: lng, latitud: lat });
        setShowPointForm(true);
      }
    };

    map.on('click', handleMapClick);

    // Cambiar cursor cuando está en modo agregar
    if (isAddingPoint) {
      map.getCanvas().style.cursor = 'crosshair';
    } else {
      map.getCanvas().style.cursor = '';
    }

    return () => {
      map.off('click', handleMapClick);
      map.getCanvas().style.cursor = '';
    };
  }, [isAddingPoint]);

  // Función para activar/desactivar modo agregar
  const toggleAddingMode = () => {
    setIsAddingPoint(!isAddingPoint);
    setTempPoint(null);
    setShowPointForm(false);
  };

  // Función para guardar el nuevo punto desde FormularioLugar
  const handleSavePoint = (nuevoLugar) => {
    setNewPoints([...newPoints, nuevoLugar]);
    setTempPoint(null);
    setShowPointForm(false);
    setIsAddingPoint(false);
  };

  // Función para cancelar agregar punto
  const handleCancelPoint = () => {
    setTempPoint(null);
    setShowPointForm(false);
  };

  // Función para manejar click en marcador
  const handleMarkerClick = (point) => {
    setSelectedLocation(point);

    // Calcular posición del modal basada en las coordenadas del marcador
    if (mapRef.current) {
      const map = mapRef.current;
      const lng = point.longitud || point.lng;
      const lat = point.latitud || point.lat;

      if (lng === undefined || lat === undefined) {
        console.error('Invalid coordinates for point:', point);
        return;
      }

      const coords = map.project([lng, lat]);
      setModalPosition({ x: coords.x, y: coords.y });

      // Animación suave y fluida usando flyTo
      map.flyTo({
        center: [lng, lat],
        padding: { top: 300, bottom: 0, left: 0, right: 0 },
        zoom: 17, // Asegurar un buen nivel de zoom
        speed: 1.2, // Velocidad de vuelo (más alto = más rápido)
        curve: 1.42, // Curvatura de la trayectoria (1 = sin zoom out)
        easing: (t) => t,
        essential: true
      });
    }
  };

  // Sincronizar selección externa (ej. desde sidebar) con el estado interno del mapa
  useEffect(() => {
    if (selectedLugar && selectedLugar !== selectedLocation) {
      handleMarkerClick(selectedLugar);
    }
  }, [selectedLugar]);

  useEffect(() => {
    if (selectedEvento && selectedEvento !== selectedLocation) {
      handleMarkerClick(selectedEvento);
    }
  }, [selectedEvento]);

  // Función para cerrar el modal de pin
  const handleCloseModal = () => {
    setSelectedLocation(null);
    setRouteData(null);
  };

  // Función para calcular ruta usando OSRM
  const handleCalculateRoute = async () => {
    if (!userLocation || !selectedLocation) {
      alert('No se puede calcular la ruta. Asegúrate de que tu ubicación esté disponible.');
      return;
    }

    setIsRouting(true);

    try {
      const startLng = userLocation.longitude;
      const startLat = userLocation.latitude;
      const endLng = selectedLocation.longitud || selectedLocation.lng;
      const endLat = selectedLocation.latitud || selectedLocation.lat;

      // Usar OSRM para calcular la ruta
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData({
          geometry: route.geometry,
          distance: (route.distance / 1000).toFixed(2), // km
          duration: Math.round(route.duration / 60) // minutos
        });
      } else {
        throw new Error('No se pudo calcular la ruta');
      }
    } catch (error) {
      console.error('Error calculando ruta:', error);
      alert('Error al calcular la ruta. Por favor intenta de nuevo.');
    } finally {
      setIsRouting(false);
    }
  };

  // Actualizar posición del modal cuando el mapa se mueve (optimizado con RAF)
  useEffect(() => {
    if (!selectedLocation || !mapRef.current) return;

    const map = mapRef.current;
    let rafId = null;
    let isUpdatePending = false;

    const updateModalPosition = () => {
      const lng = selectedLocation.longitud || selectedLocation.lng;
      const lat = selectedLocation.latitud || selectedLocation.lat;
      const coords = map.project([lng, lat]);
      setModalPosition({ x: coords.x, y: coords.y });
      isUpdatePending = false;
    };

    const scheduleUpdate = () => {
      if (!isUpdatePending) {
        isUpdatePending = true;
        rafId = requestAnimationFrame(updateModalPosition);
      }
    };

    // Usar eventos optimizados
    map.on('move', scheduleUpdate);
    map.on('zoom', scheduleUpdate);

    // Posicionar inicialmente
    updateModalPosition();

    return () => {
      map.off('move', scheduleUpdate);
      map.off('zoom', scheduleUpdate);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [selectedLocation]);

  // Efecto para dibujar la ruta en el mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeData) return;

    // Esperar a que el mapa esté completamente cargado
    const addRoute = () => {
      // Eliminar ruta anterior si existe
      if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }

      // Agregar nueva ruta
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: routeData.geometry
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
          'line-color': '#3b82f6',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    };

    if (map.isStyleLoaded()) {
      addRoute();
    } else {
      map.on('load', addRoute);
    }

    return () => {
      if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }
    };
  }, [routeData]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full rounded-none overflow-hidden border-none transition-colors duration-500 ${!starrySky ? 'bg-gray-100 dark:bg-black' : ''}`}
      style={starrySky ? {
        backgroundColor: '#000',
        backgroundImage: 'radial-gradient(circle at center, #111 0%, #000 100%), url("https://www.transparenttextures.com/patterns/stardust.png")',
        backgroundBlendMode: 'screen',
        transition: 'background-color 0.5s ease' // Solo animar color, posición es en tiempo real
      } : {}}
    >
      <Map
        ref={mapRef}
        projection={{ type: 'globe' }}
        mapTheme={mapTheme}
        starrySky={starrySky}
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
            <ControlButton
              onClick={onToggleChat}
              label={chatState === 'closed' ? 'Abrir Chat' : 'Cerrar Chat'}
            >
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

        {/* Marcadores de puntos de interés agregados por el usuario */}
        {newPoints.map((point) => (
          <MapMarker
            key={point.id}
            latitude={point.latitud}
            longitude={point.longitud}
            onClick={() => handleMarkerClick(point)}
          >
            <MarkerContent>
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="absolute w-full h-full bg-green-500 rounded-full opacity-20 animate-pulse"></div>
                <MapPin className="w-6 h-6 text-green-600 drop-shadow-lg" fill="currentColor" />
              </div>
            </MarkerContent>
            <MarkerLabel className="text-xs font-semibold text-green-600 bg-white px-2 py-1 rounded shadow-md mt-1">
              {point.nombre}
            </MarkerLabel>
          </MapMarker>
        ))}

        {/* Marcador temporal mientras se agrega un punto */}
        {tempPoint && (
          <MapMarker
            latitude={tempPoint.latitud}
            longitude={tempPoint.longitud}
          >
            <MarkerContent>
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="absolute w-full h-full bg-yellow-500 rounded-full opacity-30 animate-ping"></div>
                <MapPin className="w-6 h-6 text-yellow-500 drop-shadow-lg" fill="currentColor" />
              </div>
            </MarkerContent>
          </MapMarker>
        )}

        {/* Marcadores de lugares desde el backend/mock */}
        {lugares.map((lugar) => (
          <MapMarker
            key={lugar.id}
            latitude={lugar.latitud}
            longitude={lugar.longitud}
            onClick={(e) => {
              e.stopPropagation();
              handleMarkerClick(lugar);
            }}
          >
            <MarkerContent>
              <div className="relative group cursor-pointer transition-transform hover:scale-110">
                <div
                  className="absolute w-full h-full rounded-full opacity-20 animate-pulse"
                  style={{ backgroundColor: lugar.color || '#3b82f6' }}
                ></div>
                <div className="relative flex items-center justify-center w-10 h-10">
                  <MapPin
                    size={32}
                    className="drop-shadow-lg"
                    fill={lugar.color || '#3b82f6'}
                    color="#ffffff"
                    strokeWidth={1.5}
                  />
                </div>
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-black/80 text-black dark:text-white text-xs font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {lugar.nombre}
                </div>
              </div>
            </MarkerContent>
          </MapMarker>
        ))}

        {/* Marcadores de EVENTOS */}
        {eventos.map((evento) => (
          <MapMarker
            key={evento.id}
            latitude={evento.lat}
            longitude={evento.lng}
            onClick={(e) => {
              e.stopPropagation();
              handleMarkerClick(evento);
              if (onEventClick) onEventClick(evento);
            }}
          >
            <MarkerContent>
              <div className="relative group cursor-pointer transition-transform hover:scale-110">
                {/* Estrella pulsante para eventos */}
                <div className="absolute w-full h-full rounded-full bg-yellow-400 opacity-30 animate-ping"></div>
                <div className="relative flex items-center justify-center w-10 h-10">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-white text-[10px] font-black">★</span>
                  </div>
                </div>
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {evento.title}
                </div>
              </div>
            </MarkerContent>
          </MapMarker>
        ))}

      </Map>

      {/* Botón flotante para agregar puntos de interés */}
      <div className="absolute top-4 right-4 z-20">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleAddingMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${isAddingPoint
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
              {isAddingPoint ? (
                <>
                  <X className="w-5 h-5" />
                  <span className="font-semibold">Cancelar</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">Agregar Punto</span>
                </>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-black/80 text-white/90 border-none backdrop-blur-md">
            <p>{isAddingPoint ? 'Cancelar agregar punto' : 'Agregar punto de interés al mapa'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Formulario profesional para agregar detalles del punto */}
      <FormularioLugar
        isOpen={showPointForm && tempPoint !== null}
        onClose={handleCancelPoint}
        onSubmit={handleSavePoint}
        initialCoords={tempPoint ? { lat: tempPoint.latitud, lng: tempPoint.longitud } : null}
      />

      {/* Indicador de modo agregar activo */}
      {isAddingPoint && !showPointForm && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
            <p className="text-sm font-semibold">📍 Haz clic en el mapa para agregar un punto</p>
          </div>
        </div>
      )}

      {/* Modal de detalles del pin */}
      {selectedLocation && (
        <div
          className="absolute z-30 top-0 left-0 pointer-events-none"
          style={{
            transform: `translate3d(${modalPosition.x}px, ${modalPosition.y}px, 0) translateX(-50%) translateY(-100%) translateY(-25px)`,
            willChange: 'transform'
          }}
        >
          <div className="pointer-events-auto">
            <ModalPin
              selectedLocation={{
                ...selectedLocation,
                name: selectedLocation.nombre || selectedLocation.title,
                categoria: selectedLocation.categoria || selectedLocation.date || 'Evento',
                lat: selectedLocation.latitud || selectedLocation.lat,
                lng: selectedLocation.longitud || selectedLocation.lng,
                image: selectedLocation.image || selectedLocation.imagen
              }}
              onClose={handleCloseModal}
              onCalculateRoute={handleCalculateRoute}
              routeInfo={routeData ? { distance: routeData.distance, duration: routeData.duration } : null}
              isRouting={isRouting}
            />
          </div>
        </div>
      )}
    </div>
  );
}

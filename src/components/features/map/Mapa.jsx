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
import { Info, MessageSquare, MapPin, Plus, X, Search, Globe } from 'lucide-react';
import FormularioLugar from '@/components/features/formulario/FormularioLugar';
import ModalPin from './ModalPin';
import SearchModal from '@/components/features/search/SearchModal';
import Profile from '@/components/features/profile/Profile';
import { LiquidActionButton } from '@/components/LiquidGlass';
import stardustPattern from '@/assets/stardust.png';

export default function Mapa({
  lugares,
  eventos = [],
  onLugarClick,
  onEventClick,
  isAddingMode,
  onMapClick,
  selectedLugar,
  selectedEvento,
  onToggleChat,
  chatState,
  mapTheme,
  starrySky,
  user,
  setUser,
  showTools,
  setShowTools,
  setMapTheme,
  setStarrySky,
  darkMode,
  toggleDarkMode,
  domCanvas,
  pageRef
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const starryBgRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isMarkerVisible, setIsMarkerVisible] = useState(true);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [isExtractingMode, setIsExtractingMode] = useState(false);
  const [newPoints, setNewPoints] = useState([]);
  const [tempPoint, setTempPoint] = useState(null);
  const [showPointForm, setShowPointForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [routeData, setRouteData] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false); // Nuevo estado de carga
  const abortControllerRef = useRef(null);

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

  // Toggle buscador con ⌘+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    if (!map || !starrySky || !starryBgRef.current) return;

    const updateBackground = () => {
      const center = map.getCenter();
      const { lng, lat } = center;
      // Factor de movimiento: ajusta para más o menos sensibilidad
      const x = -lng * 10;
      const y = -lat * 10;

      if (starryBgRef.current) {
        starryBgRef.current.style.backgroundPosition = `${x}px ${y}px`;
      }
    };

    map.on('move', updateBackground);
    // Inicializar posición
    updateBackground();

    return () => {
      map.off('move', updateBackground);
    };
  }, [starrySky, mapRef.current]); // Re-ejecutar si se activa/desactiva o cambia el mapa

  // Manejar clicks en el mapa cuando está en modo agregar o modo extracción
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = async (e) => {
      const { lng, lat } = e.lngLat;

      if (isAddingPoint) {
        // Efecto visual inmediato de carga
        setTempPoint({
          longitud: lng,
          latitud: lat,
          nombre: 'Cargando datos...',
          continente_nombre: '',
          pais_nombre: '',
          region_nombre: '',
          ciudad_nombre: '',
          direccion_completa: '',
          direccion: ''
        });
        setShowPointForm(true);

        try {
          // Reverse Geocoding usando Nominatim (OpenStreetMap)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: {
              'Accept-Language': 'es',
              'User-Agent': 'MemoriaRadar/1.0 (contact@memoriaradar.com)'
            }
          });
          const data = await response.json();

          if (data) {
            const addr = data.address || {};

            // 4 Puntos Clave: Continente, País, Región, Ciudad
            // Nominatim no siempre da continente, intentamos inferir o usar el que dé
            const continente = addr.continent || (['pe', 'co', 'ar', 'cl', 'mx', 'us', 'br'].includes(addr.country_code) ? 'América' : '');
            const pais = addr.country || '';
            const region = addr.state || addr.region || addr.province || '';
            // Ciudad: priorizar city, luego town, luego village. Ignorar suburb/district para este campo específico.
            const ciudad = addr.city || addr.town || addr.village || addr.municipality || '';

            const road = addr.road || '';
            const houseNumber = addr.house_number || '';
            const displayName = data.display_name || '';

            setTempPoint({
              longitud: lng,
              latitud: lat,
              nombre: data.name || road || ciudad || 'Nuevo Lugar',
              direccion_completa: displayName,
              direccion: road + (houseNumber ? ` ${houseNumber}` : ''),
              continente_nombre: continente,
              pais_nombre: pais,
              region_nombre: region,
              ciudad_nombre: ciudad,
              // Mantener compatibilidad si se usa en otros lados
              tipo: addr.amenity || addr.shop || addr.tourism || addr.historic || null
            });
          }
        } catch (error) {
          console.error('Error in reverse geocoding:', error);
          setTempPoint({ longitud: lng, latitud: lat, nombre: '' });
        }
      } else if (isExtractingMode && !isExtracting) {
        // Bloqueo de concurrencia y limpieza de previa
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsExtracting(true);

        const fetchParams = {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'MemoriaRadar/2.0 (Fast-Extractor)'
          },
          signal: controller.signal
        };

        try {
          const { lat, lng } = e.lngLat;

          // ESTRATEGIA: Obtener el nivel mas detallado PRIMERO y usar sus metadatos
          // para rellenar los huecos inmediatamente. Paralelizar solo lo necesario.
          const [data1, data2, data3, data4] = await Promise.all([
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=5&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=3&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null)
          ]);

          // Si falla todo, lanzar un error claro para el catch
          if (!data1 && !data2 && !data3 && !data4) {
            throw new Error('Sin conexión o API límite alcanzado');
          }

          // Consolidación inteligente de datos
          const main = data1 || data2 || data3 || data4;
          const addr = main.address || {};

          // Fallback en cascada para nombres
          const paisNombre = addr.country || data4?.address?.country || data3?.address?.country || 'N/A';
          const countryCode = (addr.country_code || data4?.address?.country_code || 'N/A').toUpperCase();
          const regionNombre = addr.state || addr.province || addr.region || data3?.address?.state || 'N/A';
          const ciudadNombre = addr.city || addr.town || addr.village || addr.municipality || data2?.address?.city || 'N/A';

          // IDs estables: Si no tenemos el exacto, heredamos del nivel superior disponible
          const countryID = data4?.osm_id || data3?.osm_id || 'N/A';
          const regionID = data3?.osm_id || data2?.osm_id || data4?.osm_id || 'N/A';
          const cityID = data2?.osm_id || data1?.osm_id || 'N/A';

          const continentMap = {
            'PE': 'América del Sur', 'CO': 'América del Sur', 'AR': 'América del Sur', 'CL': 'América del Sur',
            'MX': 'América del Norte', 'US': 'América del Norte', 'CA': 'América del Norte', 'ES': 'Europa'
          };
          const continente = addr.continent || data4?.address?.continent || continentMap[countryCode] || 'América';

          const info = `
IDENTIFICADORES JERÁRQUICOS (Extracción Rápida):
----------------------------------------------
CONTINENTE: ${continente}
   -> ID sugerido: ${countryCode === 'PE' ? 1 : countryCode}

PAÍS: ${paisNombre}
   -> ID (ISO): ${countryCode}
   -> OSM ID: ${countryID}

REGIÓN/ESTADO: ${regionNombre}
   -> OSM ID: ${regionID}

CIUDAD/MUNICIPIO: ${ciudadNombre}
   -> OSM ID: ${cityID}

DETALLES:
---------
DIRECCIÓN: ${main.display_name || 'Ubicación aproximada'}
OBJETO: ${main.osm_id} (${main.type})
          `;

          alert(info);
          setIsExtractingMode(false);
        } catch (error) {
          if (error.name === 'AbortError') return;
          console.error('Fast extraction error:', error);
          alert(`Error: ${error.message}. Por favor, aguarda un segundo e intenta de nuevo.`);
        } finally {
          setIsExtracting(false);
          abortControllerRef.current = null;
        }
      }
    };

    map.on('click', handleMapClick);

    // Cambiar cursor cuando está en modo agregar o extracción
    if (isAddingPoint || (isExtractingMode && !isExtracting)) {
      map.getCanvas().style.cursor = 'crosshair';
    } else if (isExtracting) {
      map.getCanvas().style.cursor = 'wait';
    } else {
      map.getCanvas().style.cursor = '';
    }

    return () => {
      map.off('click', handleMapClick);
      map.getCanvas().style.cursor = '';
    };
  }, [isAddingPoint, isExtractingMode]);

  // Función para activar/desactivar modo agregar
  const toggleAddingMode = () => {
    setIsAddingPoint(!isAddingPoint);
    setIsExtractingMode(false); // Asegurar que el otro modo esté apagado
    setTempPoint(null);
    setShowPointForm(false);
  };

  // Función para activar modo extracción (Pruebas)
  const toggleExtractingMode = () => {
    setIsExtractingMode(!isExtractingMode);
    setIsAddingPoint(false); // Asegurar que el otro modo esté apagado
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

  const handleSelectSpot = (spot) => {
    // Identificar si es lugar o evento para llamar al handler correcto
    // Los eventos suelen tener 'date' o 'title' en lugar de 'nombre'
    const isEvento = spot.date || spot.title;

    if (isEvento) {
      if (onEventClick) onEventClick(spot);
    } else {
      if (onLugarClick) onLugarClick(spot);
    }

    // El useEffect que escucha a selectedLugar/selectedEvento se encargará
    // de llamar a handleMarkerClick y hacer el flyTo automáticamente.
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
      className={`relative w-full h-full rounded-none overflow-hidden border-none transition-colors duration-500 ${!starrySky ? 'bg-gray-100 dark:bg-black' : 'bg-black'}`}
    >
      {starrySky && (
        <div
          ref={starryBgRef}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url("${stardustPattern}")`,
            backgroundRepeat: 'repeat',
            opacity: 1, // Al máximo para que resalten más
            filter: 'contrast(500%) brightness(100%) grayscale(100%)', // Mayor contraste y brillo al máximo para estrellas blancas super brillantes
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">
        <Map
          ref={mapRef}
          projection={{ type: 'globe' }}
          mapTheme={mapTheme}
          starrySky={starrySky}
          center={[-75.21, -12.06805]}
          zoom={14.5}
          attributionControl={false}
        >
          <MapControls
            position="bottom-right"
            showCompass
            showLocate
            onLocate={(coords) => setUserLocation(coords)}
            chatState={chatState}
            domCanvas={domCanvas}
            pageRef={pageRef}
            isDarkMode={darkMode}
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

          {/* Marcadores de lugares desde el backend */}
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
      </div>

      {/* Herramientas Flotantes */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-3 items-center ignore-capture">
        {/* Botón Perfil / Usuario */}
        <Profile
          user={user}
          setUser={setUser}
          showTools={showTools}
          setShowTools={setShowTools}
          mapTheme={mapTheme}
          setMapTheme={setMapTheme}
          starrySky={starrySky}
          setStarrySky={setStarrySky}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          minimal={true}
        />

        {/* Botón Buscar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <LiquidActionButton
              onClick={() => setIsSearchOpen(true)}
              domCanvas={domCanvas}
              pageRef={pageRef}
              isDarkMode={darkMode}
              className="w-14 h-14"
            >
              <Search size={20} strokeWidth={2.5} />
            </LiquidActionButton>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-black/80 text-white/90 border-none backdrop-blur-md">
            <p>Buscar lugares (Ctrl+K)</p>
          </TooltipContent>
        </Tooltip>

        {/* Botón de Extracción de Datos (PRUEBAS) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <LiquidActionButton
              onClick={toggleExtractingMode}
              domCanvas={domCanvas}
              pageRef={pageRef}
              isDarkMode={darkMode}
              className={`w-14 h-14 ${isExtractingMode ? 'ring-2 ring-blue-500' : ''}`}
            >
              <Globe
                size={20}
                className={isExtracting ? 'animate-spin' : ''}
                strokeWidth={2.5}
              />
            </LiquidActionButton>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-black/80 text-white/90 border-none backdrop-blur-md">
            <p>{isExtractingMode ? 'Cancelar Extracción' : 'Pruebas: Extraer Datos'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Botón flotante para agregar puntos de interés */}
        <Tooltip>
          <TooltipTrigger asChild>
            <LiquidActionButton
              onClick={toggleAddingMode}
              domCanvas={domCanvas}
              pageRef={pageRef}
              isDarkMode={darkMode}
              className={`w-14 h-14 ${isAddingPoint ? 'ring-2 ring-red-500' : ''}`}
            >
              {isAddingPoint ? (
                <X size={20} strokeWidth={2.5} className="text-red-500" />
              ) : (
                <Plus size={20} strokeWidth={2.5} className="text-green-600 dark:text-green-400" />
              )}
            </LiquidActionButton>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-black/80 text-white/90 border-none backdrop-blur-md">
            <p>{isAddingPoint ? 'Cancelar' : 'Agregar Punto'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Modal de Búsqueda Inmersivo */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSpot={handleSelectSpot}
        spots={[...lugares, ...eventos]}
      />

      {/* Formulario profesional para agregar detalles del punto */}
      <FormularioLugar
        isOpen={showPointForm && tempPoint !== null}
        onClose={handleCancelPoint}
        onSubmit={handleSavePoint}
        initialCoords={tempPoint ? {
          lat: tempPoint.latitud,
          lng: tempPoint.longitud,
          nombre: tempPoint.nombre,
          direccion_completa: tempPoint.direccion_completa,
          direccion: tempPoint.direccion,
          continente_nombre: tempPoint.continente_nombre,
          pais_nombre: tempPoint.pais_nombre,
          region_nombre: tempPoint.region_nombre,
          ciudad_nombre: tempPoint.ciudad_nombre
        } : null}
      />

      {/* Indicador de modo extracción activo */}
      {isExtractingMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl animate-pulse border border-white/20 flex items-center gap-3">
            <Globe className="w-5 h-5" />
            <p className="text-sm font-bold uppercase tracking-wider">Modo Extracción: Haz clic en el mapa</p>
          </div>
        </div>
      )}

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

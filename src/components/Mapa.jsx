import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Panorama360 from './Panorama360';
import { colores } from '../data/categorias';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Función para crear iconos personalizados con colores
const createCustomIcon = (color = 'blue', categoria = 'otros') => {
  const colorHex = colores.find(c => c.id === color)?.hex || '#3B82F6';
  
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36">
        <path fill="${colorHex}" d="M12 0C5.373 0 0 5.373 0 12c0 7.5 12 24 12 24s12-16.5 12-24C24 5.373 18.627 0 12 0zm0 17a5 5 0 110-10 5 5 0 010 10z"/>
      </svg>
    `)}`,
    iconRetinaUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36">
        <path fill="${colorHex}" d="M12 0C5.373 0 0 5.373 0 12c0 7.5 12 24 12 24s12-16.5 12-24C24 5.373 18.627 0 12 0zm0 17a5 5 0 110-10 5 5 0 010 10z"/>
      </svg>
    `)}`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Componente para manejar eventos del mapa cuando está en modo agregar
const MapClickHandler = ({ onMapClick, isAddingMode, setMousePosition }) => {
  useMapEvents({
    click: (e) => {
      if (isAddingMode && onMapClick) {
        onMapClick(e.latlng);
      }
    },
    mousemove: (e) => {
      if (isAddingMode && setMousePosition) {
        setMousePosition(e.latlng);
      }
    },
    mouseout: () => {
      if (isAddingMode && setMousePosition) {
        setMousePosition(null);
      }
    }
  });
  return null;
};

// Ajusta vista a la ruta cuando se calculan coordenadas
const FitToRoute = ({ coords }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coords && coords.length > 1) {
      map.fitBounds(coords, { padding: [50, 50], animate: true });
    }
  }, [coords, map]);
  
  return null;
};

// Centrar mapa en ubicación del usuario cuando se obtiene
const FlyToUser = ({ pos }) => {
  const map = useMap();
  useEffect(() => {
    if (pos) {
      map.flyTo([pos.lat, pos.lng], 15, { duration: 1 });
    }
  }, [pos, map]);
  return null;
};

// Componente para manejar la geolocalización del usuario
const UserLocationMarker = ({ position, onLocationFound }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position && map) {
      map.setView([position.lat, position.lng], 16, {
        animate: true,
        duration: 1
      });
      onLocationFound && onLocationFound(position);
    }
  }, [position, map, onLocationFound]);

  if (!position) return null;

  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12.5" cy="12.5" r="8" fill="#3b82f6" fill-opacity="0.8" stroke="#2563eb" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="3" fill="white"/>
      <path d="M12.5 41C12.5 41 0 24 0 12.5C0 5.596 5.596 0 12.5 0C19.404 0 25 5.596 25 12.5C25 24 12.5 41 12.5 41Z" fill="#3b82f6" fill-opacity="0.2"/>
    </svg>`,
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -41]
  });

  return (
    <Marker position={[position.lat, position.lng]} icon={userIcon}>
      <Popup>
        <div className="text-center">
          <h3 className="font-semibold text-blue-600 mb-1">Tu ubicación</h3>
          <p className="text-sm text-gray-600">
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};
// Child component for each marker to manage its own expanded state
const LugarMarker = ({ lugar, getDirectionsTo, userLocation, routing }) => {
  const [expanded, setExpanded] = useState(false);
  const map = useMap();

  const centerForState = (isExpanded) => {
    if (!map) return;
    const offsetY = isExpanded ? -140 : -90; // desplaza un poco hacia arriba para centrar el popup
    map.setView([lugar.latitud, lugar.longitud], map.getZoom(), { animate: true, duration: 0.5 });
    setTimeout(() => {
      try {
        map.panBy([0, offsetY], { animate: true });
      } catch {}
    }, 520);
  };

  const icon = createCustomIcon(lugar.color, lugar.categoria);

  return (
    <Marker position={[lugar.latitud, lugar.longitud]} icon={icon}>
      <Popup className="custom-popup" maxWidth={320} minWidth={260} autoPan={true}>
        <div className="text-center w-full max-w-[300px] sm:max-w-[320px]">
          <h3 className="font-semibold text-black mb-2 text-base">{lugar.nombre}</h3>

          <div className="w-full h-44 rounded-md overflow-hidden">
            <Panorama360
              panoramaUrl={lugar.imagen}
              className="w-full h-full"
              viewerOptions={{
                navbar: false,
                mousemove: true,
                touchmoveTwoFingers: false,
                canvasBackground: '#000000'
              }}
              onError={(e) => console.error('Error loading panorama:', e)}
            />
          </div>

          <button
            type="button"
            aria-label={expanded ? 'Ocultar información' : 'Mostrar más información'}
            onClick={() => {
              const next = !expanded;
              setExpanded(next);
              centerForState(next);
            }}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 text-xs hover:bg-gray-50 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
            <span>{expanded ? 'Ocultar' : 'Más información'}</span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-64 mt-4' : 'max-h-0'}`}>
            {lugar.descripcion && (
              <p className="text-sm text-gray-700 leading-snug text-left">{lugar.descripcion}</p>
            )}
            <div className="text-xs text-gray-500 mt-2 text-left">
              Ubicación: {Number(lugar.latitud).toFixed(5)}, {Number(lugar.longitud).toFixed(5)}
            </div>
            <button
              onClick={() => getDirectionsTo(lugar)}
              className="inline-flex items-center rounded-md bg-white text-black border border-gray-300 px-2.5 py-1.5 mt-4 text-xs font-medium hover:bg-gray-100"
            >
              Cómo llegar
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const Mapa = ({ lugares, onLugarClick, selectedLugar, onMapClick, isAddingMode }) => {
  // Log para verificar lugares recibidos
  console.log('🗺️ [MAPA] Lugares recibidos:', lugares?.length || 0);
  if (lugares?.length > 0) {
    console.log('🗺️ [MAPA] Nombres de lugares:', lugares.map(l => l.nombre));
  }
  const mapRef = useRef();
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Center map on selected lugar
  useEffect(() => {
    if (selectedLugar && mapRef.current) {
      const map = mapRef.current;
      map.setView([selectedLugar.latitud, selectedLugar.longitud], 15, {
        animate: true,
        duration: 1
      });
    }
  }, [selectedLugar]);

  // Huancayo, Peru center coordinates
  const huancayoCenter = [-12.0656, -75.2103];
  const [mousePosition, setMousePosition] = useState(null);
  const [routeToLugar, setRouteToLugar] = useState(null);

  // Estados para rutas OSRM
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routing, setRouting] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [pendingTo, setPendingTo] = useState(null);

  // Función para obtener direcciones hasta un lugar
  const getDirectionsTo = (lugar) => {
    if (!userLocation) {
      setPendingTo({ lat: lugar.latitud, lng: lugar.longitud });
      getUserLocation();
      return;
    }

    // Usar OSRM para calcular ruta por carretera
    routeTo({ lat: lugar.latitud, lng: lugar.longitud });
  };

  // Si se solicitó una ruta sin ubicación, esperar a obtenerla
  useEffect(() => {
    if (pendingTo && userLocation) {
      routeTo({ lat: pendingTo.lat, lng: pendingTo.lng });
      setPendingTo(null);
    }
  }, [pendingTo, userLocation]);

  // Función para calcular la distancia entre dos puntos (fórmula de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en km
  };

  // Solicita ruta a OSRM y dibuja polyline
  const routeTo = async (to) => {
    if (!userLocation) {
      console.log('No hay ubicación del usuario');
      return;
    }
    
    console.log('Calculando ruta desde:', userLocation, 'hasta:', to);
    setRouting(true);
    setRouteError(null);
    
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&alternatives=false&steps=false`;
      console.log('URL de OSRM:', url);
      
      const res = await fetch(url);
      console.log('Respuesta de OSRM:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error en respuesta OSRM:', errorText);
        throw new Error(`Error ${res.status}: No se pudo calcular la ruta`);
      }
      
      const data = await res.json();
      console.log('Datos de ruta:', data);
      
      const route = data?.routes?.[0];
      
      if (!route) {
        throw new Error("Ruta no encontrada");
      }
      
      // Convertir coordenadas de [lng, lat] a [lat, lng] para Leaflet
      const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
      
      setRouteCoords(coords);
      setRouteInfo({ 
        distanceKm: Math.round((route.distance / 1000) * 10) / 10, 
        durationMin: Math.round(route.duration / 60) 
      });
      
      console.log('Ruta calculada exitosamente');
      
    } catch (e) {
      console.error('Error calculando ruta:', e);
      setRouteError(e.message || "Error calculando la ruta");
      setRouteCoords([]);
      setRouteInfo(null);
    } finally {
      setRouting(false);
      console.log('Estado routing finalizado');
    }
  };

  // Limpiar la ruta actual (coords, info y errores)
  const clearRoute = () => {
    setRouteCoords([]);
    setRouteInfo(null);
    setRouteError(null);
  };

  // Función para obtener la ubicación del usuario
  const getUserLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('La geolocalización no está disponible en tu navegador');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
      },
      (error) => {
        let errorMessage = 'Error al obtener tu ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'La información de ubicación no está disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'La solicitud de ubicación ha expirado.';
            break;
        }
        setLocationError(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Create a temporary icon for adding mode
  const tempIcon = L.divIcon({
    className: 'custom-marker-temp',
    html: `<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.73 0 12.795c0 2.34.635 4.635 1.838 6.637L12.5 41l10.662-21.568c1.203-2.002 1.838-4.297 1.838-6.637C25 5.73 19.404 0 12.5 0z" fill="#3b82f6" fill-opacity="0.7" stroke="#1e40af" stroke-width="1"/>
      <circle cx="12.5" cy="12.5" r="3.5" fill="white"/>
    </svg>`,
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -41]
  });

  return (
    <div className="h-full w-full relative">
      {/* Botón de ubicación */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={getUserLocation}
          disabled={isLocating}
          className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 transition-all duration-200 hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed"
          title="Obtener mi ubicación"
        >
          {isLocating ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="text-sm">Buscando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">Mi ubicación</span>
            </>
          )}
        </button>
        
        {/* Botón para limpiar ruta */}
        {(routeToLugar || routeCoords.length > 0) && (
          <button
            onClick={clearRoute}
            className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 transition-all duration-200 hover:shadow-xl"
            title="Limpiar ruta"
          >
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm">Limpiar ruta</span>
          </button>
        )}
      </div>
      <MapContainer
          center={huancayoCenter}
          zoom={13}
          className={`h-full w-full z-10 ${isAddingMode ? 'adding-mode' : ''}`}
          ref={mapRef}
          zoomControl={false}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        {/* Ajustar vista a la ruta cuando se calculan coordenadas */}
        <FitToRoute coords={routeCoords} />
        
        {/* Centrar mapa en ubicación del usuario cuando se obtiene */}
        <FlyToUser pos={userLocation} />
        
        <MapClickHandler onMapClick={onMapClick} isAddingMode={isAddingMode} setMousePosition={setMousePosition} />
        
        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <UserLocationMarker 
            position={userLocation} 
            onLocationFound={(pos) => console.log('Ubicación encontrada:', pos)}
          />
        )}
        {isAddingMode && (
          <>
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-[1000] pointer-events-none">
              <p className="text-sm">Haz clic en el mapa para seleccionar una ubicación</p>
            </div>
            {mousePosition && (
              <Marker position={[mousePosition.lat, mousePosition.lng]} icon={tempIcon} />
            )}
          </>
        )}
        
        {lugares.map((lugar) => (
          <LugarMarker key={lugar.id} lugar={lugar} getDirectionsTo={getDirectionsTo} userLocation={userLocation} routing={routing} />
        ))}
        
        {/* Línea de ruta y marcadores de inicio/fin */}
        {routeCoords.length > 0 && (
          <>
            {/* Línea de la ruta real de OSRM */}
            <Polyline 
              positions={routeCoords} 
              color="#1d4ed8" 
              weight={5} 
              opacity={0.8}
            />
            
            {/* Marcador de inicio (ubicación del usuario) */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-blue-600 mb-1">Inicio</h3>
                    <p className="text-sm text-gray-600">Tu ubicación actual</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}
        
        {/* Panel flotante con información de ruta */}
        {(routing || routeInfo || routeError || locationError) && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2">
            <div className="pointer-events-auto flex items-center gap-3 rounded-md bg-white px-3 py-2 text-sm shadow-lg border border-gray-200">
              {routing && (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Calculando ruta...</span>
                </>
              )}
              {!routing && routeInfo && (
                <>
                  <span className="font-medium">Distancia: {routeInfo.distanceKm} km</span>
                  <span className="text-gray-500">Tiempo: ~{routeInfo.durationMin} min</span>
                  <button 
                    onClick={clearRoute} 
                    className="ml-2 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
                  >
                    Limpiar
                  </button>
                </>
              )}
              {!routing && routeError && (
                <span className="text-red-600">{routeError}</span>
              )}
              {locationError && (
                <span className="text-red-600">{locationError}</span>
              )}
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default Mapa;
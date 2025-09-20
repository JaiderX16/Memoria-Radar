import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents, useMap } from 'react-leaflet';
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

<<<<<<< HEAD
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

=======
>>>>>>> 0ddffdc9253a1958fcee5d16249423538b8e2584
// Child component for each marker to manage its own expanded state
const LugarMarker = ({ lugar }) => {
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
                canvasBackground: '#000000',
                autorotateSpeed: '1rpm'
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
            <a
              href={`https://www.google.com/maps?q=${lugar.latitud},${lugar.longitud}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-blue-600 text-sm mt-2 hover:underline text-left"
            >
              Abrir en Google Maps
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const Mapa = ({ lugares, selectedLugar, onMapClick, isAddingMode }) => {
  const mapRef = useRef();
<<<<<<< HEAD
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
=======
>>>>>>> 0ddffdc9253a1958fcee5d16249423538b8e2584

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

<<<<<<< HEAD
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

=======
>>>>>>> 0ddffdc9253a1958fcee5d16249423538b8e2584
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
<<<<<<< HEAD
      {/* Botón de ubicación */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={getUserLocation}
          disabled={isLocating}
          className={`bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 transition-all duration-200 ${
            isLocating ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-xl'
          }`}
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
        
        {/* Mensaje de error */}
        {locationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg shadow-lg text-sm">
            {locationError}
          </div>
        )}
      </div>

=======
>>>>>>> 0ddffdc9253a1958fcee5d16249423538b8e2584
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
        
        <MapClickHandler onMapClick={onMapClick} isAddingMode={isAddingMode} setMousePosition={setMousePosition} />
        
<<<<<<< HEAD
        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <UserLocationMarker 
            position={userLocation} 
            onLocationFound={(pos) => console.log('Ubicación encontrada:', pos)}
          />
        )}
        
=======
>>>>>>> 0ddffdc9253a1958fcee5d16249423538b8e2584
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
          <LugarMarker key={lugar.id} lugar={lugar} />
        ))}
      </MapContainer>
    </div>
  );
};

export default Mapa;
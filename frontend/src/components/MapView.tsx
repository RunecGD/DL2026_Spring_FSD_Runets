import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlaceWithDistance } from '../types';

// Исправление иконок Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Синяя иконка для текущего местоположения
const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Красная иконка для достопримечательностей
const placeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapViewProps {
  userLocation: { lat: number; lng: number } | null;
  places: PlaceWithDistance[];
  radiusKm: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPlace?: PlaceWithDistance | null;
}

// Компонент для центрирования карты
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

// Компонент для обработки кликов по карте
function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
}

// Компонент для перелёта к выбранному месту
function FlyToPlace({ place }: { place: PlaceWithDistance | null | undefined }) {
  const map = useMap();
  const prevPlace = useRef<PlaceWithDistance | null>(null);

  useEffect(() => {
    if (place && place !== prevPlace.current) {
      map.flyTo([place.lat, place.lng], 16, { duration: 1 });
      prevPlace.current = place;
    }
  }, [place, map]);

  return null;
}

// Компонент для подстройки зума под радиус
function FitRadius({ center, radiusKm, hasPlaces }: { center: [number, number] | null; radiusKm: number; hasPlaces: boolean }) {
  const map = useMap();
  const prevRadius = useRef<number>(radiusKm);
  const prevHasPlaces = useRef<boolean>(hasPlaces);

  useEffect(() => {
    if (center && hasPlaces && (!prevHasPlaces.current || prevRadius.current !== radiusKm)) {
      const radiusM = radiusKm * 1000;
      const bounds = L.latLng(center[0], center[1]).toBounds(radiusM * 2);
      map.fitBounds(bounds, { padding: [50, 50] });
      prevRadius.current = radiusKm;
      prevHasPlaces.current = hasPlaces;
    }
  }, [center, radiusKm, hasPlaces, map]);

  return null;
}

export default function MapView({ userLocation, places, radiusKm, onMapClick, selectedPlace }: MapViewProps) {
  const defaultCenter: [number, number] = [55.7558, 37.6173]; // Москва
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="w-full h-full"
      style={{ minHeight: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController center={userLocation ? [userLocation.lat, userLocation.lng] : null} />
      <MapClickHandler onClick={onMapClick} />
      <FlyToPlace place={selectedPlace} />
      <FitRadius 
        center={userLocation ? [userLocation.lat, userLocation.lng] : null} 
        radiusKm={radiusKm} 
        hasPlaces={places.length > 0}
      />

      {/* Маркер текущего местоположения */}
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>📍 Ваше местоположение</strong>
                <br />
                <span className="text-xs text-gray-500">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Круг радиуса поиска */}
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '5, 5',
            }}
          />
        </>
      )}

      {/* Маркеры достопримечательностей */}
      {places.map((place, index) => (
        <Marker
          key={place.id || `place-${index}`}
          position={[place.lat, place.lng]}
          icon={placeIcon}
        >
          <Popup>
            <div className="min-w-[150px]">
              <strong className="text-lg">{place.name}</strong>
              {place.description && (
                <p className="text-sm text-gray-600 mt-1">{place.description}</p>
              )}
              {place.category && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                  {place.category}
                </span>
              )}
              {place.distance !== undefined && (
                <p className="text-sm text-gray-500 mt-1">
                  📏 {place.distance.toFixed(2)} км
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

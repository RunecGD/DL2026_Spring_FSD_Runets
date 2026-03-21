import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { PlaceWithDistance } from '../types';

import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:22px;height:22px;
    background:#2563eb;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 10px rgba(37,99,235,0.7);
    cursor:pointer;
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const placeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const selectedPlaceIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: iconShadow,
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
});

const visitedPlaceIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export interface MapViewProps {
  userLocation: { lat: number; lng: number } | null;
  places: PlaceWithDistance[];
  radiusKm: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPlace?: PlaceWithDistance | null;
  onPlaceSelect?: (place: PlaceWithDistance) => void;
  onRouteRequest?: (place: PlaceWithDistance) => void;
  routeTarget?: { lat: number; lng: number } | null;
  isLoggedIn: boolean;
  visitedIds: Set<number | string>;
  onMarkVisited?: (place: PlaceWithDistance) => void;
  onShowAuth?: () => void;
}

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  const prevCenter = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (
        center &&
        (!prevCenter.current ||
            prevCenter.current[0] !== center[0] ||
            prevCenter.current[1] !== center[1])
    ) {
      map.setView(center, map.getZoom());
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

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

function FitRadius({
                     center,
                     radiusKm,
                     hasPlaces,
                   }: {
  center: [number, number] | null;
  radiusKm: number;
  hasPlaces: boolean;
}) {
  const map = useMap();
  const prevRadius = useRef<number>(radiusKm);
  const prevHasPlaces = useRef<boolean>(false);

  useEffect(() => {
    if (
        center &&
        hasPlaces &&
        (!prevHasPlaces.current || prevRadius.current !== radiusKm)
    ) {
      const bounds = L.latLng(center[0], center[1]).toBounds(radiusKm * 1000 * 2);
      map.fitBounds(bounds, { padding: [50, 50] });
      prevRadius.current = radiusKm;
      prevHasPlaces.current = hasPlaces;
    }
    if (!hasPlaces) prevHasPlaces.current = false;
  }, [center, radiusKm, hasPlaces, map]);

  return null;
}

function RoutingControl({
                          from,
                          to,
                        }: {
  from: L.LatLng;
  to: L.LatLng;
}) {
  const map = useMap();
  const routingRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (routingRef.current) {
      try { map.removeControl(routingRef.current); } catch { /* ignore */ }
      routingRef.current = null;
    }

    import('leaflet-routing-machine').then((LRM) => {
      const LRMDefault = (LRM as any).default ?? LRM;

      const control = LRMDefault.control({
        waypoints: [from, to],
        router: LRMDefault.osrmv1({
          // Демо-сервер OSRM поддерживает ТОЛЬКО профиль 'driving'.
          // 'foot' и 'cycling' — платные / недоступны на public demo.
          // Если нужен пеший маршрут — разверните свой OSRM или используйте GraphHopper API.
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving',
          suppressDemoServerWarning: true,
        }),
        lineOptions: {
          styles: [{ color: '#2563eb', weight: 5, opacity: 0.9 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        show: false,
        collapsible: true,
        addWaypoints: false,
        routeWhileDragging: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: () => null,
      });

      control.on('routingerror', (e: any) => {
        console.error('❌ Ошибка маршрута:', e.error?.message ?? e);
      });

      control.addTo(map);
      routingRef.current = control;
    });

    return () => {
      if (routingRef.current) {
        try { map.removeControl(routingRef.current); } catch { /* ignore */ }
        routingRef.current = null;
      }
    };
  }, [from.lat, from.lng, to.lat, to.lng]);

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Кастомный попап над маркером
// ─────────────────────────────────────────────────────────────────────────────
interface PlacePopupProps {
  place: PlaceWithDistance;
  mapRef: React.RefObject<L.Map | null>;
  onClose: () => void;
  onRouteRequest: (place: PlaceWithDistance) => void;
  userLocation: { lat: number; lng: number } | null;
  isLoggedIn: boolean;
  isVisited: boolean;
  onMarkVisited: (place: PlaceWithDistance) => void;
  onShowAuth: () => void;
}

function PlacePopupOverlay({
                             place, mapRef, onClose, onRouteRequest, userLocation,
                             isLoggedIn, isVisited, onMarkVisited, onShowAuth,
                           }: PlacePopupProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  // Ref на DOM-элемент popup — используем его чтобы запретить Leaflet
  // обрабатывать клики внутри попапа (disableClickPropagation).
  const popupDomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updatePos = () => {
      if (!mapRef.current) return;
      const point = mapRef.current.latLngToContainerPoint([place.lat, place.lng]);
      setPos({ x: point.x, y: point.y });
    };

    updatePos();
    const map = mapRef.current;
    if (!map) return;
    map.on('move zoom moveend zoomend', updatePos);
    return () => { map.off('move zoom moveend zoomend', updatePos); };
  }, [place, mapRef]);

  // Вешаем L.DomEvent.disableClickPropagation на DOM-узел попапа.
  // Это останавливает всплытие события click/mousedown/dblclick до Leaflet,
  // поэтому карта не реагирует на нажатия внутри попапа.
  useEffect(() => {
    const el = popupDomRef.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, [pos]); // перевешиваем после первого рендера с позицией

  if (!pos) return null;

  return (
      <div
          ref={popupDomRef}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, calc(-100% - 52px))',
            zIndex: 1000,
            pointerEvents: 'auto',
            minWidth: '220px',
            maxWidth: '260px',
          }}
          // Двойная страховка: стопаем все mouse-события на уровне React,
          // чтобы они не дошли до обработчика карты.
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 flex items-start justify-between">
            <div className="text-white font-semibold text-sm leading-tight pr-2 flex-1">
              {place.name}
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="text-white/80 hover:text-white text-xl leading-none flex-shrink-0 w-5 h-5 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Info */}
          <div className="px-3 py-2 space-y-1">
            {(place.category || place.type) && (
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {place.category || place.type}
            </span>
            )}
            {place.distance !== undefined && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>📏</span>
                  <span>{place.distance.toFixed(2)} км от вас</span>
                </div>
            )}
            {isVisited && (
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <span>✅</span> Посещено
                </div>
            )}
          </div>

          {/* Buttons */}
          <div className="px-3 pb-3 space-y-2">
            {/* Маршрут */}
            {userLocation && (
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRouteRequest(place);
                      onClose();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  🗺️ Построить маршрут
                </button>
            )}

            {/* Посещено */}
            {isLoggedIn ? (
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkVisited(place);
                    }}
                    className={`w-full text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isVisited
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {isVisited ? '✅ Посещено' : '☑️ Отметить посещённым'}
                </button>
            ) : (
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowAuth();
                      onClose();
                    }}
                    className="w-full bg-gray-100 text-gray-400 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-200 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  🔒 Войдите, чтобы отметить
                </button>
            )}
          </div>
        </div>

        {/* Стрелка вниз */}
        <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '9px solid white',
              margin: '0 auto',
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.12))',
            }}
        />
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner map component
// ─────────────────────────────────────────────────────────────────────────────
function InnerMap({
                    userLocation,
                    places,
                    radiusKm,
                    onMapClick,
                    selectedPlace,
                    onPlaceSelect,
                    onRouteRequest,
                    routeTarget,
                    isLoggedIn,
                    visitedIds,
                    onMarkVisited,
                    onShowAuth,
                  }: MapViewProps) {
  const map = useMap();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [activePopupPlace, setActivePopupPlace] = useState<PlaceWithDistance | null>(null);

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  // Клик по карте — только меняем местоположение пользователя, закрываем попап.
  // Этот обработчик НЕ сработает если клик был внутри попапа —
  // благодаря L.DomEvent.disableClickPropagation выше.
  useMapEvents({
    click: (e) => {
      setActivePopupPlace(null);
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  // Открывать попап при выборе места из сайдбара
  useEffect(() => {
    if (selectedPlace) {
      setActivePopupPlace(selectedPlace);
    }
  }, [selectedPlace]);

  const handleMarkerClick = (place: PlaceWithDistance) => {
    setActivePopupPlace(prev =>
        prev?.id === place.id && prev?.name === place.name ? null : place
    );
    onPlaceSelect?.(place);
  };

  const handleRouteRequest = (place: PlaceWithDistance) => {
    setActivePopupPlace(null);
    onRouteRequest?.(place);
  };

  // Рендерим маркеры
  useEffect(() => {
    markersRef.current.forEach((m) => m.removeFrom(map));
    markersRef.current.clear();

    // Маркер пользователя
    if (userLocation) {
      const m = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      m.bindTooltip('Вы здесь', { permanent: false, direction: 'top', offset: [0, -12] });
      markersRef.current.set('user', m);
    }

    // Маркеры мест
    places.forEach((place, idx) => {
      const key = place.id ? `place-${place.id}` : `place-idx-${idx}`;
      const isSelected = selectedPlace?.id === place.id && selectedPlace?.name === place.name;
      const isVisited = place.id !== undefined && visitedIds.has(place.id);

      let icon = placeIcon;
      if (isSelected) icon = selectedPlaceIcon;
      else if (isVisited) icon = visitedPlaceIcon;

      const m = L.marker([place.lat, place.lng], { icon }).addTo(map);

      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        handleMarkerClick(place);
      });

      markersRef.current.set(key, m);
    });

    return () => {
      markersRef.current.forEach((m) => m.removeFrom(map));
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, places, selectedPlace, visitedIds]);

  return (
      <>
        <MapController center={userLocation ? [userLocation.lat, userLocation.lng] : null} />
        <FlyToPlace place={selectedPlace} />
        <FitRadius
            center={userLocation ? [userLocation.lat, userLocation.lng] : null}
            radiusKm={radiusKm}
            hasPlaces={places.length > 0}
        />

        {userLocation && (
            <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.07,
                  weight: 2,
                  dashArray: '6, 6',
                }}
            />
        )}

        {userLocation && routeTarget && (
            <RoutingControl
                from={L.latLng(userLocation.lat, userLocation.lng)}
                to={L.latLng(routeTarget.lat, routeTarget.lng)}
            />
        )}

        {activePopupPlace && mapRef.current && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 999, pointerEvents: 'none' }}>
              <PlacePopupOverlay
                  place={activePopupPlace}
                  mapRef={mapRef as React.RefObject<L.Map>}
                  onClose={() => setActivePopupPlace(null)}
                  onRouteRequest={handleRouteRequest}
                  userLocation={userLocation}
                  isLoggedIn={isLoggedIn}
                  isVisited={activePopupPlace.id !== undefined && visitedIds.has(activePopupPlace.id!)}
                  onMarkVisited={(p) => onMarkVisited?.(p)}
                  onShowAuth={() => onShowAuth?.()}
              />
            </div>
        )}
      </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MapView — корневой компонент
// ─────────────────────────────────────────────────────────────────────────────
export default function MapView(props: MapViewProps) {
  const defaultCenter: [number, number] = [55.7558, 37.6173];
  const center: [number, number] = props.userLocation
      ? [props.userLocation.lat, props.userLocation.lng]
      : defaultCenter;

  return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <MapContainer
            center={center}
            zoom={13}
            className="w-full h-full"
            style={{ minHeight: '100%' }}
        >
          <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <InnerMap {...props} />
        </MapContainer>
      </div>
  );
}

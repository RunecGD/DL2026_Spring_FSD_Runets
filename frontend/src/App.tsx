import React, { useState, useCallback, useEffect } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import ProfilePage from './components/ProfilePage';
import { fetchNearbyPlaces, fetchCategories, fetchProfile, markPlaceVisited, unmarkPlaceVisited, fetchVisitedPlaces } from './api/placesApi';
import { PlaceWithDistance, User } from './types';
import 'leaflet/dist/leaflet.css';

const App: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number>(5);
  const [places, setPlaces] = useState<PlaceWithDistance[]>([]);
  const [totalFound, setTotalFound] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithDistance | null>(null);
  const [routeTarget, setRouteTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Geolocation
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Categories
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);

  // Auth
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Visited
  const [visitedIds, setVisitedIds] = useState<Set<number | string>>(new Set());

  const isLoggedIn = !!token;

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Load profile + visited on token change
  useEffect(() => {
    if (token) {
      fetchProfile()
        .then((data) => {
          const u = data.user || data;
          setUser(u);
        })
        .catch(() => {
          // Token invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        });

      fetchVisitedPlaces()
        .then((data) => {
          const list = Array.isArray(data) ? data : (data.visited || data.places || []);
          const ids = new Set<number | string>();
          list.forEach((item: any) => {
            const pid = item.place_id || item.PlaceID || item.id;
            if (pid !== undefined) ids.add(pid);
          });
          setVisitedIds(ids);
        })
        .catch(() => setVisitedIds(new Set()));
    } else {
      setUser(null);
      setVisitedIds(new Set());
    }
  }, [token]);

  const handleLoginSuccess = useCallback((newToken: string) => {
    setToken(newToken);
    setShowAuth(false);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setVisitedIds(new Set());
    setShowProfile(false);
  }, []);

  const handleMarkVisited = useCallback(async (place: PlaceWithDistance) => {
    if (!isLoggedIn || place.id === undefined) return;

    const placeId = place.id;
    const isCurrentlyVisited = visitedIds.has(placeId);

    try {
      if (isCurrentlyVisited) {
        await unmarkPlaceVisited(placeId);
        setVisitedIds(prev => {
          const next = new Set(prev);
          next.delete(placeId);
          return next;
        });
      } else {
        await markPlaceVisited(placeId);
        setVisitedIds(prev => {
          const next = new Set(prev);
          next.add(placeId);
          return next;
        });
      }
    } catch (err: any) {
      console.error('❌ Ошибка отметки:', err);
    }
  }, [isLoggedIn, visitedIds]);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setLocation({ lat, lng });
    setGeoError(null);
  }, []);

  const handleManualLocation = useCallback((lat: number, lng: number) => {
    setLocation({ lat, lng });
    setGeoError(null);
  }, []);

  const requestGeo = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Браузер не поддерживает геолокацию');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
        setGeoError(null);
      },
      () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setGeoLoading(false);
            setGeoError(null);
          },
          (err2) => {
            setGeoLoading(false);
            if (err2.code === 1) {
              setGeoError('Доступ запрещён. Разрешите геолокацию в браузере');
            } else if (err2.code === 2) {
              setGeoError('Не удалось определить. Используйте ввод или клик по карте');
            } else {
              setGeoError('Превышено время ожидания. Попробуйте снова');
            }
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  // Normalize places from backend
  const normalizePlaces = (rawPlaces: any[]): PlaceWithDistance[] => {
    if (!rawPlaces || !Array.isArray(rawPlaces)) return [];
    const result: PlaceWithDistance[] = [];

    rawPlaces.forEach((item, index) => {
      let normalized: PlaceWithDistance | null = null;

      if (item.lat !== undefined || item.Lat !== undefined) {
        normalized = {
          id: item.id || item.ID || index,
          name: item.name || item.Name || 'Без названия',
          lat: Number(item.lat ?? item.Lat),
          lng: Number(item.lng ?? item.Lng),
          description: item.description || item.Description || '',
          category: item.category || item.Category || item.type || item.Type || '',
          address: item.address || item.Address || '',
          rating: item.rating || item.Rating,
          distance: Number(item.distance ?? item.Distance ?? item.distance_km ?? 0),
        };
      } else if (item.place || item.Place) {
        const p = item.place || item.Place;
        normalized = {
          id: p.id || p.ID || index,
          name: p.name || p.Name || 'Без названия',
          lat: Number(p.lat ?? p.Lat),
          lng: Number(p.lng ?? p.Lng),
          description: p.description || p.Description || '',
          category: p.category || p.Category || p.type || p.Type || '',
          address: p.address || p.Address || '',
          rating: p.rating || p.Rating,
          distance: Number(item.distance ?? item.Distance ?? 0),
        };
      }

      if (normalized && !isNaN(normalized.lat) && !isNaN(normalized.lng)) {
        result.push(normalized);
      }
    });

    return result;
  };

  const handleSearch = useCallback(async () => {
    if (!location) {
      setApiError('Сначала введите координаты или кликните на карту');
      return;
    }

    setLoading(true);
    setApiError(null);
    setPlaces([]);
    setTotalFound(0);
    setRouteTarget(null);
    setSelectedPlace(null);

    try {
      const response = await fetchNearbyPlaces(location, radius, selectedCategory);
      const normalized = normalizePlaces(response.nearby_places);
      setPlaces(normalized);
      setTotalFound(response.total_found ?? normalized.length);
      if (normalized.length === 0) {
        setApiError('В указанном радиусе ничего не найдено. Попробуйте увеличить радиус.');
      }
    } catch (err: any) {
      console.error('❌ Ошибка API:', err);
      setApiError(`Ошибка подключения к серверу: ${err.message || 'Проверьте VITE_API_URL'}`);
    } finally {
      setLoading(false);
    }
  }, [location, radius, selectedCategory]);

  const handleRouteRequest = useCallback((place: PlaceWithDistance) => {
    if (!location) return;
    setSelectedPlace(place);
    setRouteTarget({ lat: place.lat, lng: place.lng });
  }, [location]);

  const handleClearRoute = useCallback(() => {
    setRouteTarget(null);
    setSelectedPlace(null);
  }, []);

  const handlePlaceSelect = useCallback((place: PlaceWithDistance) => {
    setSelectedPlace(place);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 relative">
      {/* Map */}
      <MapView
        userLocation={location}
        places={places}
        radiusKm={radius}
        onMapClick={handleMapClick}
        selectedPlace={selectedPlace}
        onPlaceSelect={handlePlaceSelect}
        onRouteRequest={handleRouteRequest}
        routeTarget={routeTarget}
        isLoggedIn={isLoggedIn}
        visitedIds={visitedIds}
        onMarkVisited={handleMarkVisited}
        onShowAuth={() => setShowAuth(true)}
      />

      {/* Sidebar */}
      <Sidebar
        radius={radius}
        setRadius={setRadius}
        places={places}
        totalFound={totalFound}
        loading={loading}
        onSearch={handleSearch}
        error={apiError}
        userLocation={location}
        onManualLocation={handleManualLocation}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onPlaceSelect={handlePlaceSelect}
        onRouteRequest={handleRouteRequest}
        selectedPlace={selectedPlace}
        routeTarget={routeTarget}
        onClearRoute={handleClearRoute}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoriesLoading={categoriesLoading}
        onRequestGeo={requestGeo}
        geoLoading={geoLoading}
        geoError={geoError}
        isLoggedIn={isLoggedIn}
        username={user?.username || ''}
        onShowAuth={() => setShowAuth(true)}
        onShowProfile={() => setShowProfile(true)}
        visitedIds={visitedIds}
        onMarkVisited={handleMarkVisited}
      />

      {/* Location hint */}
      {!location && (
        <div className="absolute top-4 left-4 z-[1000] bg-white border border-orange-300 text-gray-700 px-4 py-3 rounded-xl shadow-lg max-w-xs">
          <p className="font-semibold text-orange-600">📍 Местоположение не задано</p>
          <p className="text-sm mt-1 text-gray-500">
            Введите координаты в панели справа или кликните по карте
          </p>
        </div>
      )}

      {/* Location indicator */}
      {location && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow text-sm z-[1000] flex items-center gap-2">
          <span>📍</span>
          <span className="text-gray-600 font-mono text-xs">
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </span>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Profile Page */}
      {showProfile && (
        <ProfilePage
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;

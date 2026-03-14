import React, { useState, useCallback, useEffect } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { useGeolocation } from './hooks/useGeolocation';
import { fetchNearbyPlaces } from './api/placesApi';
import { PlaceWithDistance } from './types';
import 'leaflet/dist/leaflet.css';

const App: React.FC = () => {
  const { 
    location, 
    error: locationError, 
    loading: locationLoading,
    method: locationMethod,
    requestLocation,
    setManualLocation,
  } = useGeolocation();
  
  const [radius, setRadius] = useState<number>(5);
  const [places, setPlaces] = useState<PlaceWithDistance[]>([]);
  const [totalFound, setTotalFound] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithDistance | null>(null);

  // Запрашиваем геолокацию при загрузке
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Обработчик клика по карте
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setManualLocation(lat, lng);
  }, [setManualLocation]);

  // Нормализация данных от бэкенда
  const normalizePlaces = (rawPlaces: any[]): PlaceWithDistance[] => {
    if (!rawPlaces || !Array.isArray(rawPlaces)) return [];

    return rawPlaces.map((item: any, index: number) => {
      // Вариант 1: Place embedded (поля на верхнем уровне)
      // { "id": 1, "name": "...", "lat": 55.7, "lng": 37.6, "distance": 1.2 }
      if (item.lat !== undefined && item.lng !== undefined) {
        return {
          id: item.id || item.ID || index,
          name: item.name || item.Name || 'Без названия',
          lat: Number(item.lat || item.Lat),
          lng: Number(item.lng || item.Lng),
          description: item.description || item.Description || '',
          category: item.category || item.Category || '',
          distance: Number(item.distance || item.Distance || item.distance_km || 0),
        };
      }

      // Вариант 2: Place как вложенный объект
      // { "place": { "id": 1, "name": "...", "lat": 55.7, "lng": 37.6 }, "distance": 1.2 }
      if (item.place || item.Place) {
        const place = item.place || item.Place;
        return {
          id: place.id || place.ID || index,
          name: place.name || place.Name || 'Без названия',
          lat: Number(place.lat || place.Lat),
          lng: Number(place.lng || place.Lng),
          description: place.description || place.Description || '',
          category: place.category || place.Category || '',
          distance: Number(item.distance || item.Distance || item.distance_km || 0),
        };
      }

      // Вариант 3: Latitude/Longitude вместо lat/lng
      if (item.latitude !== undefined && item.longitude !== undefined) {
        return {
          id: item.id || index,
          name: item.name || 'Без названия',
          lat: Number(item.latitude),
          lng: Number(item.longitude),
          description: item.description || '',
          category: item.category || '',
          distance: Number(item.distance || 0),
        };
      }

      console.warn('Неизвестный формат place:', item);
      return null;
    }).filter(Boolean) as PlaceWithDistance[];
  };

  const handleSearch = useCallback(async () => {
    if (!location) {
      setApiError('Сначала определите местоположение: кликните на карту или введите координаты');
      return;
    }

    setLoading(true);
    setApiError(null);
    setPlaces([]);
    setTotalFound(0);

    try {
      console.log('🔍 Отправляю запрос:', { location, radius });
      const response = await fetchNearbyPlaces(location, radius);
      console.log('✅ Ответ от API:', response);

      const normalized = normalizePlaces(response.nearby_places);
      console.log('📍 Нормализованные места:', normalized);

      setPlaces(normalized);
      setTotalFound(response.total_found || normalized.length);

      if (normalized.length === 0) {
        setApiError('В указанном радиусе достопримечательности не найдены');
      }
    } catch (error: any) {
      console.error('❌ Ошибка при получении данных:', error);
      
      const errorMsg = error?.response 
        ? `Ошибка сервера: ${error.response.status} ${error.response.statusText}`
        : error?.code === 'ERR_NETWORK'
          ? 'Сервер недоступен. Проверьте что бэкенд запущен и URL в .env правильный'
          : `Ошибка: ${error?.message || 'Неизвестная ошибка'}`;
      
      setApiError(errorMsg + ' (Показаны демо-данные)');
      
      // Демо-данные для тестирования без API
      const demoPlaces: PlaceWithDistance[] = [
        {
          id: 1,
          name: 'Демо: Достопримечательность 1',
          lat: location.lat + 0.01,
          lng: location.lng + 0.005,
          description: 'Тестовая точка (API недоступен)',
          category: 'Демо',
          distance: 1.2,
        },
        {
          id: 2,
          name: 'Демо: Достопримечательность 2',
          lat: location.lat - 0.008,
          lng: location.lng + 0.012,
          description: 'Тестовая точка (API недоступен)',
          category: 'Демо',
          distance: 2.1,
        },
        {
          id: 3,
          name: 'Демо: Достопримечательность 3',
          lat: location.lat + 0.005,
          lng: location.lng - 0.01,
          description: 'Тестовая точка (API недоступен)',
          category: 'Демо',
          distance: 1.5,
        },
        {
          id: 4,
          name: 'Демо: Достопримечательность 4',
          lat: location.lat - 0.003,
          lng: location.lng - 0.008,
          description: 'Тестовая точка (API недоступен)',
          category: 'Демо',
          distance: 0.9,
        },
      ];
      setPlaces(demoPlaces);
      setTotalFound(demoPlaces.length);
    } finally {
      setLoading(false);
    }
  }, [location, radius]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 relative">
      {/* Map - Full Screen */}
      <MapView 
        userLocation={location} 
        places={places} 
        radiusKm={radius}
        onMapClick={handleMapClick}
        selectedPlace={selectedPlace}
      />

      {/* Sidebar - Right Panel (Collapsible) */}
      <Sidebar
        radius={radius}
        setRadius={setRadius}
        places={places}
        totalFound={totalFound}
        loading={loading || locationLoading}
        onSearch={handleSearch}
        locationError={locationError || apiError}
        userLocation={location}
        locationMethod={locationMethod}
        onRetryLocation={requestLocation}
        onManualLocation={setManualLocation}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onPlaceSelect={setSelectedPlace}
      />

      {/* Подсказка если нет местоположения */}
      {!location && !locationLoading && (
        <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg max-w-sm z-[1000]">
          <p className="font-medium">📍 Местоположение не определено</p>
          <p className="text-sm mt-1">Кликните на карту, чтобы выбрать точку вручную</p>
        </div>
      )}

      {/* Индикатор способа определения местоположения */}
      {location && locationMethod && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm z-[1000]">
          {locationMethod === 'gps' && '🛰️ GPS'}
          {locationMethod === 'ip' && '🌐 По IP (приблизительно)'}
          {locationMethod === 'manual' && '👆 Выбрано на карте'}
          <span className="text-gray-400 ml-2 text-xs">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
};

export default App;

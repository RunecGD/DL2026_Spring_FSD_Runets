import React, { useState } from 'react';
import { PlaceWithDistance } from '../types';

interface SidebarProps {
  radius: number;
  setRadius: (radius: number) => void;
  places: PlaceWithDistance[];
  totalFound: number;
  loading: boolean;
  onSearch: () => void;
  locationError: string | null;
  userLocation: { lat: number; lng: number } | null;
  locationMethod: 'gps' | 'ip' | 'manual' | null;
  onRetryLocation: () => void;
  onManualLocation: (lat: number, lng: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  onPlaceSelect?: (place: PlaceWithDistance) => void;
}

const radiusOptions = [1, 2, 5, 10, 15, 20, 30, 50, 100];

const Sidebar: React.FC<SidebarProps> = ({
  radius,
  setRadius,
  places,
  totalFound,
  loading,
  onSearch,
  locationError,
  userLocation,
  locationMethod,
  onRetryLocation,
  onManualLocation,
  isOpen,
  onToggle,
  onPlaceSelect,
}) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onManualLocation(lat, lng);
      setShowManualInput(false);
    }
  };

  const getMethodLabel = () => {
    switch (locationMethod) {
      case 'gps': return '🛰️ GPS';
      case 'ip': return '🌐 По IP';
      case 'manual': return '👆 Вручную';
      default: return '';
    }
  };

  return (
    <>
      {/* Toggle Button - всегда видна */}
      <button
        onClick={onToggle}
        className={`fixed top-4 z-[1001] bg-white shadow-lg p-3 hover:bg-gray-100 transition-all duration-300 ease-in-out ${
          isOpen ? 'right-[320px] rounded-l-lg' : 'right-0 rounded-l-lg'
        }`}
        title={isOpen ? 'Скрыть панель' : 'Показать панель'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
          </svg>
        )}
      </button>

      {/* Sidebar Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg flex flex-col overflow-hidden transition-transform duration-300 ease-in-out z-[1000] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Достопримечательности
          </h1>
          <p className="text-blue-100 text-sm mt-1">Найдите интересные места рядом</p>
        </div>

        {/* Location Status */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {userLocation ? 'Местоположение определено' : 'Ожидание...'}
              </span>
            </div>
            {locationMethod && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {getMethodLabel()}
              </span>
            )}
          </div>
          
          {userLocation && (
            <p className="text-xs text-gray-500 mb-2">
              📍 {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </p>
          )}
          
          {locationError && (
            <p className="text-xs text-red-500 mb-2">{locationError}</p>
          )}

          {/* Кнопки управления местоположением */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={onRetryLocation}
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded transition-colors"
            >
              🔄 Определить
            </button>
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded transition-colors"
            >
              ✏️ Вручную
            </button>
          </div>

          {/* Ручной ввод координат */}
          {showManualInput && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Введите координаты:</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Широта (lat)"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="flex-1 text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Долгота (lng)"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="flex-1 text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleManualSubmit}
                className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
              >
                Применить
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                💡 Или просто кликните на карту
              </p>
            </div>
          )}
        </div>

        {/* Radius Selection */}
        <div className="p-4 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Радиус поиска (км)
          </label>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {radiusOptions.map((r) => (
              <option key={r} value={r}>
                {r} км
              </option>
            ))}
          </select>

          <button
            onClick={onSearch}
            disabled={loading || !userLocation}
            className="w-full mt-3 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Поиск...
              </>
            ) : (
              <>
                🔍 Найти места
              </>
            )}
          </button>

          {!userLocation && (
            <p className="text-xs text-orange-500 mt-2 text-center">
              ⚠️ Сначала определите местоположение или кликните на карту
            </p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {totalFound > 0 && (
            <div className="p-3 bg-green-50 text-green-700 text-sm border-b">
              Найдено мест: <strong>{totalFound}</strong>
            </div>
          )}

          {places.length === 0 && !loading && (
            <div className="p-6 text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="font-medium">Нажмите «Найти места»</p>
              <p className="text-xs mt-1">чтобы увидеть достопримечательности</p>
            </div>
          )}

          {places.map((place, index) => (
            <div
              key={place.id || index}
              className="p-4 border-b hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => onPlaceSelect?.(place)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm truncate">{place.name}</h3>
                  {place.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{place.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {place.category && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {place.category}
                      </span>
                    )}
                    {place.distance !== undefined && (
                      <span className="text-xs text-gray-400">
                        📏 {place.distance.toFixed(2)} км
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

import React, { useState } from 'react';

interface Props {
  onLocationSet: (lat: number, lng: number) => void;
  currentLocation: { lat: number; lng: number } | null;
  onRequestGeo: () => void;
  geoLoading: boolean;
  geoError: string | null;
}

const LocationPanel: React.FC<Props> = ({
  onLocationSet,
  currentLocation,
  onRequestGeo,
  geoLoading,
  geoError,
}) => {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [inputError, setInputError] = useState('');
  const [mode, setMode] = useState<'main' | 'manual'>('main');

  const handleSubmit = () => {
    setInputError('');
    const parsedLat = parseFloat(lat.replace(',', '.'));
    const parsedLng = parseFloat(lng.replace(',', '.'));

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setInputError('Введите числовые значения');
      return;
    }
    if (parsedLat < -90 || parsedLat > 90) {
      setInputError('Широта: от -90 до 90');
      return;
    }
    if (parsedLng < -180 || parsedLng > 180) {
      setInputError('Долгота: от -180 до 180');
      return;
    }

    onLocationSet(parsedLat, parsedLng);
    setMode('main');
    setLat('');
    setLng('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  // Показываем текущее местоположение
  if (currentLocation && mode === 'main') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📍</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-700">Ваше местоположение</p>
            <p className="text-xs text-green-600 font-mono truncate">
              {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-1.5">
          {/* Определить через браузер */}
          <button
            onClick={onRequestGeo}
            disabled={geoLoading}
            title="Определить через браузер"
            className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 text-blue-700 disabled:text-gray-400 px-2 py-1.5 rounded-lg transition-colors font-medium"
          >
            {geoLoading ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Ищем...</span>
              </>
            ) : (
              <>
                <span>🌐</span>
                <span>Определить</span>
              </>
            )}
          </button>

          {/* Ввод вручную */}
          <button
            onClick={() => setMode('manual')}
            title="Ввести координаты вручную"
            className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1.5 rounded-lg transition-colors font-medium"
          >
            <span>✏️</span>
            <span>Изменить</span>
          </button>
        </div>

        {geoError && (
          <p className="text-xs text-red-500 mt-1.5 leading-tight">{geoError}</p>
        )}

        <p className="text-xs text-green-500 mt-1.5 flex items-center gap-1">
          <span>👆</span>
          <span>Или кликните на карту</span>
        </p>
      </div>
    );
  }

  // Режим ручного ввода
  if (mode === 'manual') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-blue-800">✏️ Ввод координат</p>
          {currentLocation && (
            <button
              onClick={() => setMode('main')}
              className="text-blue-400 hover:text-blue-600 text-lg leading-none"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-blue-600 font-medium">Широта (lat)</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="55.75580"
              className="w-full mt-0.5 border border-blue-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-blue-600 font-medium">Долгота (lng)</label>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="37.61730"
              className="w-full mt-0.5 border border-blue-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            />
          </div>

          {inputError && (
            <p className="text-xs text-red-500">{inputError}</p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            ✅ Подтвердить
          </button>

          <p className="text-xs text-blue-500 text-center">
            Найти координаты:{' '}
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-700"
            >
              Google Maps
            </a>
            {' '}→ правый клик
          </p>
        </div>
      </div>
    );
  }

  // Нет местоположения — главный экран
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-2">
      <p className="text-sm font-semibold text-orange-700 mb-2">📍 Выберите местоположение</p>

      <div className="space-y-2">
        {/* Определить через браузер */}
        <button
          onClick={onRequestGeo}
          disabled={geoLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          {geoLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Определяем...
            </>
          ) : (
            <>🌐 Определить автоматически</>
          )}
        </button>

        {geoError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-xs text-red-600">{geoError}</p>
          </div>
        )}

        {/* Ввод вручную */}
        <button
          onClick={() => setMode('manual')}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          ✏️ Ввести координаты
        </button>

        <p className="text-xs text-orange-500 text-center">
          👆 Или кликните на любое место на карте
        </p>
      </div>
    </div>
  );
};

export default LocationPanel;

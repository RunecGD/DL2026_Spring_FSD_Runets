import React from 'react';
import { PlaceWithDistance } from '../types';
import LocationPanel from './LocationPanel';

interface SidebarProps {
  radius: number;
  setRadius: (radius: number) => void;
  places: PlaceWithDistance[];
  totalFound: number;
  loading: boolean;
  onSearch: () => void;
  error: string | null;
  userLocation: { lat: number; lng: number } | null;
  onManualLocation: (lat: number, lng: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  onPlaceSelect?: (place: PlaceWithDistance) => void;
  onRouteRequest?: (place: PlaceWithDistance) => void;
  selectedPlace?: PlaceWithDistance | null;
  routeTarget?: { lat: number; lng: number } | null;
  onClearRoute?: () => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categoriesLoading: boolean;
  onRequestGeo: () => void;
  geoLoading: boolean;
  geoError: string | null;
  // Auth
  isLoggedIn: boolean;
  username: string;
  onShowAuth: () => void;
  onShowProfile: () => void;
  visitedIds: Set<number | string>;
  onMarkVisited?: (place: PlaceWithDistance) => void;
}

const radiusOptions = [1, 2, 5, 10, 15, 20, 30, 50, 100];

const Sidebar: React.FC<SidebarProps> = ({
  radius,
  setRadius,
  places,
  totalFound,
  loading,
  onSearch,
  error,
  userLocation,
  onManualLocation,
  isOpen,
  onToggle,
  onPlaceSelect,
  onRouteRequest,
  selectedPlace,
  routeTarget,
  onClearRoute,
  categories,
  selectedCategory,
  onCategoryChange,
  categoriesLoading,
  onRequestGeo,
  geoLoading,
  geoError,
  isLoggedIn,
  username,
  onShowAuth,
  onShowProfile,
  visitedIds,
  onMarkVisited,
}) => {
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-[1001] bg-white shadow-lg p-2 hover:bg-gray-50 transition-all duration-300 ease-in-out border border-gray-200 rounded-l-xl ${
          isOpen ? 'right-[320px]' : 'right-0'
        }`}
        title={isOpen ? 'Скрыть панель' : 'Показать панель'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out z-[1000] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Места
            </h1>

            {/* Profile / Login button */}
            {isLoggedIn ? (
              <button
                onClick={onShowProfile}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
                  {username?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-xs max-w-[80px] truncate">{username}</span>
              </button>
            ) : (
              <button
                onClick={onShowAuth}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                🔑 Войти
              </button>
            )}
          </div>
          <p className="text-blue-100 text-xs mt-0.5">
            Найдите интересные места рядом
          </p>
        </div>

        {/* Scroll container */}
        <div className="flex-1 overflow-y-auto">

          {/* Location */}
          <div className="p-3 border-b bg-gray-50">
            <LocationPanel
              onLocationSet={onManualLocation}
              currentLocation={userLocation}
              onRequestGeo={onRequestGeo}
              geoLoading={geoLoading}
              geoError={geoError}
            />
          </div>

          {/* Radius */}
          <div className="p-4 border-b">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📏 Радиус поиска
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {radiusOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`text-sm py-2 rounded-lg border transition-colors font-medium ${
                    radius === r
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {r} км
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="p-4 border-b">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏷️ Категория
            </label>
            {categoriesLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Загрузка категорий...
              </div>
            ) : (
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-700"
              >
                <option value="all">Все категории</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          {/* Search button */}
          <div className="p-4 border-b">
            <button
              onClick={onSearch}
              disabled={loading || !userLocation}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Идёт поиск...
                </>
              ) : (
                <>🔍 Найти места</>
              )}
            </button>
            {!userLocation && (
              <p className="text-xs text-orange-500 mt-2 text-center">
                ⚠️ Выберите местоположение выше
              </p>
            )}
            {error && userLocation && (
              <p className="text-xs text-red-500 mt-2 text-center bg-red-50 p-2 rounded-lg">{error}</p>
            )}
          </div>

          {/* Active route banner */}
          {routeTarget && selectedPlace && (
            <div className="p-3 border-b bg-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-blue-500 text-lg">🗺️</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-blue-700">Маршрут активен</p>
                  <p className="text-xs text-blue-600 truncate">→ {selectedPlace.name}</p>
                </div>
              </div>
              <button
                onClick={onClearRoute}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50 flex-shrink-0 ml-2"
              >
                ✕ Убрать
              </button>
            </div>
          )}

          {/* Places list */}
          <div>
            {totalFound > 0 && (
              <div className="px-4 py-2.5 bg-green-50 text-green-700 text-xs border-b flex items-center gap-1">
                <span>✅</span>
                <span>
                  Найдено: <strong>{totalFound}</strong>
                  {selectedCategory !== 'all' && (
                    <span className="ml-1 text-green-600">в «{selectedCategory}»</span>
                  )}
                </span>
              </div>
            )}

            {places.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="font-medium text-sm">Нажмите «Найти места»</p>
                <p className="text-xs mt-1">чтобы увидеть достопримечательности</p>
              </div>
            )}

            {places.map((place, index) => {
              const isSelected =
                selectedPlace?.id === place.id && selectedPlace?.name === place.name;
              const hasRoute = isSelected && !!routeTarget;
              const isVisited = place.id !== undefined && visitedIds.has(place.id);

              return (
                <div
                  key={place.id ? `sidebar-place-${place.id}` : `sidebar-idx-${index}`}
                  className={`p-3 border-b transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Top row: номер + название + бейджи */}
                  <div
                    className="flex items-start gap-2 cursor-pointer"
                    onClick={() => onPlaceSelect?.(place)}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                      isVisited
                        ? 'bg-green-500 text-white'
                        : isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-red-100 text-red-600'
                    }`}>
                      {isVisited ? '✓' : index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {(place.category || place.type) && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {place.category || place.type}
                          </span>
                        )}
                        {place.distance !== undefined && (
                          <span className="text-xs text-gray-400">
                            📏 {place.distance.toFixed(2)} км
                          </span>
                        )}
                        {isVisited && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            ✅ Посещено
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: кнопки действий */}
                  <div className="flex gap-2 mt-2.5 ml-9">
                    {/* Кнопка маршрута */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRouteRequest?.(place);
                      }}
                      title={hasRoute ? 'Маршрут активен' : 'Построить маршрут'}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-2 rounded-lg transition-colors ${
                        hasRoute
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      {hasRoute ? 'Маршрут' : 'Маршрут'}
                    </button>

                    {/* Кнопка посещения */}
                    {isLoggedIn ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkVisited?.(place);
                        }}
                        title={isVisited ? 'Снять отметку' : 'Отметить как посещённое'}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-2 rounded-lg transition-colors ${
                          isVisited
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                        }`}
                      >
                        <span>{isVisited ? '✅' : '☑️'}</span>
                        <span>{isVisited ? 'Посещено' : 'Отметить'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowAuth();
                        }}
                        title="Войдите чтобы отметить посещение"
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-500 border border-gray-200 transition-colors"
                      >
                        <span>🔒</span>
                        <span>Посещено</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { fetchProfile, fetchVisitedPlaces, fetchAllPlaces } from '../api/placesApi';

interface VisitedItem {
  id: number;
  place_id: number;
  place?: any;
  visited_at: string;
  name?: string;
  // поля встроенного place
  [key: string]: any;
}

interface Props {
  onClose: () => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<Props> = ({ onClose, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [visited, setVisited] = useState<VisitedItem[]>([]);
  const [totalPlaces, setTotalPlaces] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileData, visitedData, allPlacesData] = await Promise.all([
        fetchProfile(),
        fetchVisitedPlaces().catch(() => []),
        fetchAllPlaces().catch(() => []),
      ]);

      // Профиль
      const u = profileData.user || profileData;
      setUser(u);

      // Посещённые
      const v = Array.isArray(visitedData) ? visitedData : (visitedData.visited || visitedData.places || []);
      setVisited(v);

      // Всего мест
      const all = Array.isArray(allPlacesData) ? allPlacesData : (allPlacesData.places || []);
      setTotalPlaces(all.length);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const percentage = totalPlaces > 0
    ? Math.round((visited.length / totalPlaces) * 100)
    : 0;

  const getPlaceName = (item: VisitedItem): string => {
    if (item.place?.name) return item.place.name;
    if (item.place?.Name) return item.place.Name;
    if (item.name) return item.name;
    if (item.Name) return item.Name;
    return `Место #${item.place_id || item.id}`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white text-lg font-bold">👤 Профиль</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                ⚠️ {error}
              </div>
              <button onClick={loadData} className="mt-3 w-full bg-blue-100 text-blue-700 py-2 rounded-lg text-sm hover:bg-blue-200">
                🔄 Повторить
              </button>
            </div>
          ) : (
            <>
              {/* User info */}
              {user && (
                <div className="p-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{user.username}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Зарегистрирован: {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">📊 Прогресс посещений</span>
                  <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Посещено: <strong className="text-gray-700">{visited.length}</strong></span>
                  <span>Всего мест: <strong className="text-gray-700">{totalPlaces}</strong></span>
                </div>
              </div>

              {/* Visited places list */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  ✅ Посещённые места ({visited.length})
                </h4>

                {visited.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-sm">Вы ещё не посетили ни одного места</p>
                    <p className="text-xs mt-1">Нажмите ✅ на карте чтобы отметить посещение</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {visited.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5"
                      >
                        <span className="text-green-500 text-lg">✅</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {getPlaceName(item)}
                          </p>
                          {item.visited_at && (
                            <p className="text-xs text-gray-400">
                              {formatDate(item.visited_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex-shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            ← Назад
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            🚪 Выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

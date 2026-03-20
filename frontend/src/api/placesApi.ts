import axios from 'axios';
import { UserLocation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Хелпер для auth header
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Получить все места поблизости
export const fetchNearbyPlaces = async (
  location: UserLocation,
  radiusKm: number,
  category?: string,
  limit: number = 100
) => {
  const params: Record<string, any> = {
    lat: location.lat,
    lng: location.lng,
    radius: radiusKm,
    limit,
  };

  if (category && category !== 'all') {
    params.type = category;
  }

  console.log(`📡 GET ${API_BASE_URL}/api/places/nearby`, params);

  const response = await axios.get(`${API_BASE_URL}/api/places/nearby`, {
    params,
    timeout: 10000,
  });

  console.log('📨 Ответ от API:', response.data);
  return response.data;
};

// Получить все категории/типы
export const fetchCategories = async (): Promise<string[]> => {
  try {
    console.log(`📡 GET ${API_BASE_URL}/places/type`);
    const response = await axios.get(`${API_BASE_URL}/places/type`, {
      timeout: 5000,
    });
    console.log('📨 Категории:', response.data);

    const data = response.data;

    if (Array.isArray(data) && typeof data[0] === 'string') return data;
    if (Array.isArray(data) && typeof data[0] === 'object') {
      return data.map((item: any) => item.name || item.type || item.category || '').filter(Boolean);
    }
    if (data.types) return data.types;
    if (data.categories) return data.categories;

    return [];
  } catch (error) {
    console.error('❌ Ошибка загрузки категорий:', error);
    return [];
  }
};

// ========== AUTH ==========

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/login`, {
    email,
    password,
  }, { timeout: 10000 });
  return response.data;
};

export const registerUser = async (username: string, email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/register`, {
    username,
    email,
    password,
  }, { timeout: 10000 });
  return response.data;
};

export const fetchProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/profile`, {
    headers: authHeaders(),
    timeout: 10000,
  });
  return response.data;
};

// ========== VISITED PLACES ==========

export const markPlaceVisited = async (placeId: number | string) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/places/${placeId}/visit`,
    {},
    {
      headers: authHeaders(),
      timeout: 10000,
    }
  );
  return response.data;
};

export const unmarkPlaceVisited = async (placeId: number | string) => {
  const response = await axios.delete(
    `${API_BASE_URL}/api/places/${placeId}/visit`,
    {
      headers: authHeaders(),
      timeout: 10000,
    }
  );
  return response.data;
};

export const fetchVisitedPlaces = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/places/visited`, {
    headers: authHeaders(),
    timeout: 10000,
  });
  return response.data;
};

export const fetchAllPlaces = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/places`, {
    timeout: 10000,
  });
  return response.data;
};

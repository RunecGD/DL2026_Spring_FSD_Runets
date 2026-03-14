import axios from 'axios';
import { UserLocation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const fetchNearbyPlaces = async (
  location: UserLocation,
  radiusKm: number,
  limit: number = 50
) => {
  console.log(`📡 GET ${API_BASE_URL}/api/places/nearby?lat=${location.lat}&lng=${location.lng}&radius=${radiusKm}&limit=${limit}`);

  const response = await axios.get(`${API_BASE_URL}/api/places/nearby`, {
    params: {
      lat: location.lat,
      lng: location.lng,
      radius: radiusKm,
      limit: limit,
    },
    timeout: 10000,
  });

  console.log('📨 Ответ:', response.data);
  return response.data;
};

// Базовая структура Place из твоей БД
export interface Place {
  id?: string | number;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  category?: string;
}

// PlaceWithDistance - как возвращает твой бэкенд
// Если Place embedded в Go, все поля Place будут на верхнем уровне
export interface PlaceWithDistance extends Place {
  distance: number; // расстояние в км (из твоей функции)
}

export interface LocationResponse {
  your_location: {
    lat: number;
    lng: number;
  };
  radius_km: number;
  total_found: number;
  nearby_places: PlaceWithDistance[];
}

export interface UserLocation {
  lat: number;
  lng: number;
}

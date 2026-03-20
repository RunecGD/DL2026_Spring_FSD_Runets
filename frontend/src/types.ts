export interface Place {
  id?: string | number;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  category?: string;
  type?: string;
  address?: string;
  rating?: number;
}

export interface PlaceWithDistance extends Place {
  distance: number;
}

export interface Category {
  id?: string | number;
  name: string;
  type?: string;
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

export interface RouteInfo {
  coordinates: [number, number][];
  distanceM: number;
  durationS: number;
  isStraightLine?: boolean;
}

// Auth
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

export interface VisitedPlace {
  id: number;
  user_id: number;
  place_id: number;
  place?: Place;
  visited_at: string;
}

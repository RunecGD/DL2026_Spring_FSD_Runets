import { useState, useCallback } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface GeolocationState {
  location: Location | null;
  loading: boolean;
  error: string | null;
  method: 'gps' | 'network' | 'manual' | null;
  accuracy: number | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    method: null,
    accuracy: null,
  });

  const setManualLocation = useCallback((lat: number, lng: number) => {
    setState({
      location: { lat, lng },
      loading: false,
      error: null,
      method: 'manual',
      accuracy: null,
    });
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Браузер не поддерживает геолокацию',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const method = accuracy && accuracy < 100 ? 'gps' : 'network';
        setState({
          location: { lat: latitude, lng: longitude },
          loading: false,
          error: null,
          method,
          accuracy: accuracy ?? null,
        });
      },
      (err) => {
        let msg = '';
        switch (err.code) {
          case 1: msg = 'Доступ к геолокации запрещён'; break;
          case 2: msg = 'Не удалось определить местоположение'; break;
          case 3: msg = 'Превышено время ожидания'; break;
          default: msg = 'Ошибка геолокации';
        }
        setState(prev => ({ ...prev, loading: false, error: msg }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const requestHighAccuracy = useCallback(() => {
    if (!navigator.geolocation) return;
    setState(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setState({
          location: { lat: latitude, lng: longitude },
          loading: false,
          error: null,
          method: 'gps',
          accuracy: accuracy ?? null,
        });
      },
      (err) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: `GPS недоступен: ${err.message}`,
        }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  return {
    ...state,
    requestLocation,
    requestHighAccuracy,
    setManualLocation,
  };
}

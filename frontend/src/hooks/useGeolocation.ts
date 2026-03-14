import { useState, useCallback } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface GeolocationState {
  location: Location | null;
  loading: boolean;
  error: string | null;
  method: 'gps' | 'ip' | 'manual' | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    method: null,
  });

  // Определение по GPS браузера
  const requestGPSLocation = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Геолокация не поддерживается браузером',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
          method: 'gps',
        });
      },
      (error) => {
        let errorMessage = 'Не удалось определить местоположение';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Доступ к геолокации запрещён';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Информация о местоположении недоступна';
            break;
          case error.TIMEOUT:
            errorMessage = 'Таймаут запроса геолокации';
            break;
        }
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Определение по IP (fallback)
  const requestIPLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Используем бесплатный API для определения по IP
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error('Не удалось определить по IP');
      }

      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        setState({
          location: {
            lat: data.latitude,
            lng: data.longitude,
          },
          loading: false,
          error: null,
          method: 'ip',
        });
      } else {
        throw new Error('IP API не вернул координаты');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Не удалось определить местоположение по IP',
      }));
    }
  }, []);

  // Установка координат вручную
  const setManualLocation = useCallback((lat: number, lng: number) => {
    setState({
      location: { lat, lng },
      loading: false,
      error: null,
      method: 'manual',
    });
  }, []);

  // Автоматическое определение (сначала GPS, потом IP)
  const requestLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Сначала пробуем GPS
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
          method: 'gps',
        });
        return;
      } catch {
        // GPS не сработал, пробуем IP
        console.log('GPS не доступен, пробуем IP...');
      }
    }

    // Fallback на IP
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        setState({
          location: {
            lat: data.latitude,
            lng: data.longitude,
          },
          loading: false,
          error: null,
          method: 'ip',
        });
      } else {
        throw new Error('Нет координат');
      }
    } catch {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Не удалось определить местоположение. Кликните на карту или введите координаты вручную.',
      }));
    }
  }, []);

  return {
    ...state,
    requestLocation,
    requestGPSLocation,
    requestIPLocation,
    setManualLocation,
  };
}

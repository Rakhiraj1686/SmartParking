import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const LOCATION_KEY = 'smartpark_location';

export const QUICK_CITIES = (import.meta.env.VITE_QUICK_CITIES || '')
  .split(',')
  .map((city) => city.trim())
  .filter(Boolean);

const LocationContext = createContext(null);

function readSavedLocation() {
  try {
    return localStorage.getItem(LOCATION_KEY) || '';
  } catch {
    return '';
  }
}

export function LocationProvider({ children }) {
  const [label, setLabel] = useState(readSavedLocation);
  const [status, setStatus] = useState(() => (readSavedLocation() ? 'manual' : 'idle'));

  const setManualLocation = useCallback((city) => {
    const nextLabel = city.trim();
    if (!nextLabel) return;

    setLabel(nextLabel);
    setStatus('manual');
    try {
      localStorage.setItem(LOCATION_KEY, nextLabel);
    } catch {
      // Location still works for the current session when storage is unavailable.
    }
  }, []);

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('fallback');
      return;
    }

    setStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      () => {
        setLabel('Current location');
        setStatus('success');
      },
      () => {
        setStatus('fallback');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    if (!label) detect();
  }, [detect, label]);

  const value = {
    status,
    label,
    isFallback: status === 'fallback' || status === 'idle',
    detect,
    setManualLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useUserLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useUserLocation must be used within a LocationProvider');
  return context;
}

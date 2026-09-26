import { useState } from 'react';
import { createPortal } from 'react-dom';
import { LocateFixed, MapPin, X } from 'lucide-react';
import { useUserLocation, QUICK_CITIES } from '../context/LocationContext';

export default function LocationPicker({ onClose }) {
  const { status, detect, setManualLocation } = useUserLocation();
  const [customCity, setCustomCity] = useState('');

  const handlePick = (city) => {
    setManualLocation(city);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customCity.trim()) return;
    handlePick(customCity);
  };

  return createPortal(
    (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
      <div className="relative rise-in flex max-h-[min(92dvh,38rem)] w-full flex-col overflow-y-auto rounded-t-3xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-sm sm:rounded-3xl sm:p-6 sm:pb-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-full bg-mist flex items-center justify-center text-ink-soft hover:text-ink"
        >
          <X size={16} />
        </button>

        <p className="text-xs text-ink-soft mb-1">Location</p>
        <h3 className="font-display text-lg font-semibold mb-4">Set your location</h3>

        <button
          onClick={detect}
          disabled={status === 'detecting'}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-medium text-ink hover:bg-mist transition-colors disabled:opacity-60 mb-4"
        >
          <LocateFixed size={16} className="text-brand" />
          {status === 'detecting' ? 'Detecting…' : 'Use my current location'}
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-line" />
          <span className="text-[11px] text-ink-soft">or choose manually</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handlePick(city)}
              className="min-h-9 rounded-xl px-3 py-1.5 text-xs font-medium bg-mist text-ink-soft hover:bg-selected-soft hover:text-selected transition-colors sm:min-h-0 sm:rounded-full"
            >
              {city}
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              inputMode="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="Type a city, e.g. Nagpur"
              className="input pl-8 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!customCity.trim()}
            className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition-colors disabled:opacity-40 sm:w-auto"
          >
            Use
          </button>
        </form>
      </div>
    </div>
    ),
    document.body
  );
}

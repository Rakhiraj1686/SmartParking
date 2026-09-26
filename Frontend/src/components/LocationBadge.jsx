import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useUserLocation } from '../context/LocationContext';
import LocationPicker from './LocationPicker';

export default function LocationBadge({ variant = 'full' }) {
  const { status, label, isFallback } = useUserLocation();
  const [pickerOpen, setPickerOpen] = useState(false);

  let text;
  if (status === 'detecting') text = 'Detecting your location…';
  else if (status === 'success' || status === 'manual') text = label;
  else text = 'Select your location';

  const isBusy = status === 'detecting';

  return (
    <>
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        disabled={isBusy}
        title={isFallback ? 'Could not detect your location — tap to set it manually' : 'Tap to change your location'}
        className={`flex items-center gap-1.5 text-ink-soft hover:text-ink transition-colors disabled:cursor-default ${
          variant === 'full' ? 'text-sm' : 'text-xs min-w-0'
        }`}
      >
        <MapPin size={variant === 'full' ? 15 : 13} className={`shrink-0 ${isBusy ? 'text-ink-soft animate-pulse' : 'text-brand'}`} />
        <span className={variant === 'full' ? '' : 'truncate max-w-36'}>{text}</span>
      </button>

      {pickerOpen && <LocationPicker onClose={() => setPickerOpen(false)} />}
    </>
  );
}

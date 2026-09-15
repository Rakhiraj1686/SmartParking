import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, X, IndianRupee, Clock3 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useParking } from '../context/ParkingContext';
import { estimatePrice } from '../services/parkingService';

export default function BookingModal({ slot, onClose, onBooked }) {
  const { parkingArea, bookSlot } = useParking();
  const [submitting, setSubmitting] = useState(false);

  if (!slot) return null;

  const handleQuickBook = async () => {
    setSubmitting(true);
    const now = new Date();
    const start = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endDate = new Date(now.getTime() + 60 * 60 * 1000);
    const end = endDate.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

    const result = await bookSlot({
      slotId: slot.id,
      date: now.toISOString().slice(0, 10),
      startTime: start,
      endTime: end,
      vehicleType: 'Car',
      vehicleNumber: 'MP09 AB 4521',
    });
    setSubmitting(false);
    if (result.success) {
      onBooked?.(result.booking);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <div className="relative rise-in w-full sm:max-w-sm bg-surface rounded-t-3xl sm:rounded-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-full bg-mist flex items-center justify-center text-ink-soft hover:text-ink"
        >
          <X size={16} />
        </button>

        <p className="text-xs text-ink-soft mb-1">Slot details</p>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-display text-2xl font-semibold">{slot.id}</h3>
          <StatusBadge status={slot.status} />
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2.5 text-sm">
            <MapPin size={16} className="text-brand shrink-0" />
            <span className="text-ink-soft">{parkingArea.name} · {slot.floor}, Zone {slot.zone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <IndianRupee size={16} className="text-brand shrink-0" />
            <span className="text-ink-soft">₹{slot.price} / hour</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Clock3 size={16} className="text-brand shrink-0" />
            <span className="text-ink-soft">Estimated ₹{estimatePrice(slot.price, '10:00 AM', '11:00 AM')} for a 1 hour stay</span>
          </div>
        </div>

        {slot.status === 'available' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-mist transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleQuickBook}
                disabled={submitting}
                className="rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {submitting ? 'Booking…' : 'Book Now'}
              </button>
            </div>
            <p className="text-center text-[11px] text-ink-soft mt-3">
              Need to set a specific date or time instead?{' '}
              <Link to={`/book?slot=${slot.id}`} className="text-brand font-medium underline underline-offset-2">
                Use full booking form
              </Link>
            </p>
          </>
        )}

        {slot.status === 'reserved' && (
          <div className="rounded-xl bg-reserved-soft text-reserved text-sm font-medium text-center py-3">
            Reserved until {slot.reservedUntil}
          </div>
        )}

        {slot.status === 'occupied' && (
          <div className="rounded-xl bg-occupied-soft text-occupied text-sm font-medium text-center py-3">
            Currently occupied
          </div>
        )}
      </div>
    </div>
  );
}

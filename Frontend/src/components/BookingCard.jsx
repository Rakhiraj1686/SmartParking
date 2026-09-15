import { Calendar, Car, Clock3, MapPin } from 'lucide-react';
import { formatDateLong, currency } from '../utils/format';

const STATUS_STYLE = {
  upcoming: 'bg-selected-soft text-selected',
  completed: 'bg-available-soft text-available',
  cancelled: 'bg-occupied-soft text-occupied',
};

export default function BookingCard({ booking, onViewDetails, onCancel }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-ink-soft mb-0.5">{booking.id}</p>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-brand" />
            <span className="font-display font-semibold font-mono-slot">{booking.slotId}</span>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[booking.status] ?? STATUS_STYLE.upcoming}`}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm text-ink-soft mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{formatDateLong(booking.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 size={14} />
          <span>{booking.startTime} – {booking.endTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <Car size={14} />
          <span>{booking.vehicleType} · {booking.vehicleNumber}</span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-ink">
          {currency(booking.amount)}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails?.(booking)}
          className="flex-1 rounded-xl border border-line py-2 text-sm font-medium text-ink hover:bg-mist transition-colors"
        >
          View Details
        </button>
        {booking.status === 'upcoming' && (
          <button
            onClick={() => onCancel?.(booking)}
            className="flex-1 rounded-xl border border-occupied/30 bg-occupied-soft py-2 text-sm font-medium text-occupied hover:bg-occupied/10 transition-colors"
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}

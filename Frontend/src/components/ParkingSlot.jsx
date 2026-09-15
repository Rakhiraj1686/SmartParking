import { Car } from 'lucide-react';
import { STATUS_META } from '../utils/format';

const STYLES = {
  available: 'bg-available-soft border-available/40 text-available hover:border-available',
  occupied: 'bg-occupied-soft border-occupied/30 text-occupied cursor-not-allowed opacity-90',
  reserved: 'bg-reserved-soft border-reserved/30 text-reserved cursor-not-allowed opacity-90',
  selected: 'bg-selected text-white border-selected shadow-md shadow-selected/30',
};

export default function ParkingSlot({ slot, isSelected, onSelect, compact = false }) {
  const visualStatus = isSelected ? 'selected' : slot.status;
  const meta = STATUS_META[visualStatus];
  const interactive = slot.status !== 'occupied';

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => interactive && onSelect?.(slot)}
      aria-label={`Slot ${slot.id}, ${meta.label}`}
      className={`group relative flex flex-col items-center justify-center rounded-xl border-2 font-mono-slot transition-all duration-150
        ${compact ? 'h-14' : 'h-16 sm:h-20'}
        ${STYLES[visualStatus]}
        ${interactive ? 'active:scale-95' : ''}`}
    >
      {slot.status === 'occupied' && !isSelected && (
        <Car size={compact ? 14 : 16} className="mb-0.5 opacity-70" strokeWidth={2} />
      )}
      <span className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>{slot.id}</span>
      {!compact && (
        <span className="text-[10px] font-sans opacity-80 mt-0.5">
          {isSelected ? 'Selected' : meta.label}
        </span>
      )}
    </button>
  );
}

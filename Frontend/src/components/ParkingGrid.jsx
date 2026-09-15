import ParkingSlot from './ParkingSlot';
import EmptyState from './EmptyState';
import { Search } from 'lucide-react';

export default function ParkingGrid({ slots, selectedSlotId, onSelectSlot, columns = 4 }) {
  if (slots.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No slots match your filters"
        description="Try clearing the search or choosing a different status filter."
      />
    );
  }

  const gridColsClass = {
    4: 'grid-cols-4',
    6: 'grid-cols-6',
  }[columns] ?? 'grid-cols-4';

  return (
    <div className={`grid ${gridColsClass} gap-2 sm:gap-3`}>
      {slots.map((slot) => (
        <ParkingSlot
          key={slot.id}
          slot={slot}
          isSelected={slot.id === selectedSlotId}
          onSelect={onSelectSlot}
        />
      ))}
    </div>
  );
}

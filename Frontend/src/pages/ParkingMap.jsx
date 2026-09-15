import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import ParkingSlot from '../components/ParkingSlot';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import BookingModal from '../components/BookingModal';
import { useParking } from '../context/ParkingContext';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'occupied', label: 'Occupied' },
  { key: 'reserved', label: 'Reserved' },
];

const LEGEND = [
  { color: 'bg-available', label: 'Available' },
  { color: 'bg-occupied', label: 'Occupied' },
  { color: 'bg-reserved', label: 'Reserved' },
  { color: 'bg-selected', label: 'Selected' },
];

export default function ParkingMap() {
  const { slots, loading } = useParking();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeSlot, setActiveSlot] = useState(null);

  const zones = useMemo(() => {
    const filtered = slots.filter((s) => {
      const matchesQuery = s.id.toLowerCase().includes(query.trim().toLowerCase());
      const matchesFilter = filter === 'all' || s.status === filter;
      return matchesQuery && matchesFilter;
    });
    const byZone = {};
    filtered.forEach((s) => {
      byZone[s.zone] = byZone[s.zone] || [];
      byZone[s.zone].push(s);
    });
    return byZone;
  }, [slots, query, filter]);

  const statusLine = (slot) => {
    if (slot.status === 'available') return 'Tap to book this slot';
    if (slot.status === 'occupied') return 'Currently occupied';
    if (slot.status === 'reserved') return `Reserved until ${slot.reservedUntil}`;
    return '';
  };

  if (loading) return <LoadingState />;

  const hasResults = Object.keys(zones).length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold mb-1">Parking Map</h1>
        <p className="text-sm text-ink-soft">Tap any available slot to see details and book it instantly.</p>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search slot, e.g. P12"
            className="w-full rounded-xl border border-line bg-surface pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                filter === f.key
                  ? 'bg-brand text-white border-brand'
                  : 'bg-surface text-ink-soft border-line hover:border-brand/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {!hasResults && (
        <EmptyState
          icon={Search}
          title="No slots match your filters"
          description="Try a different slot number or clear the status filter."
        />
      )}

      {Object.entries(zones).map(([zone, zoneSlots]) => (
        <div key={zone}>
          <p className="text-xs font-medium text-ink-soft mb-2">Zone {zone}</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
            {zoneSlots.map((slot) => (
              <ParkingSlot
                key={slot.id}
                slot={slot}
                isSelected={activeSlot?.id === slot.id}
                onSelect={setActiveSlot}
              />
            ))}
          </div>
        </div>
      ))}

      {activeSlot && (
        <div className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft md:hidden">
          <span className="font-medium text-ink font-mono-slot">{activeSlot.id}</span> — {statusLine(activeSlot)}
        </div>
      )}

      {activeSlot && (
        <BookingModal slot={activeSlot} onClose={() => setActiveSlot(null)} />
      )}
    </div>
  );
}

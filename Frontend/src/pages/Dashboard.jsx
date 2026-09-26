import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleParking, Gauge, LocateFixed, Sparkles, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import ParkingGrid from '../components/ParkingGrid';
import BookingModal from '../components/BookingModal';
import LoadingState from '../components/LoadingState';
import LocationPicker from '../components/LocationPicker';
import { useParking } from '../context/ParkingContext';
import { useUserLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { slots, loading } = useParking();
  const { status, label, isFallback } = useUserLocation();
  const [activeSlot, setActiveSlot] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const stats = useMemo(() => {
    const total = slots.length;
    const available = slots.filter((s) => s.status === 'available').length;
    const occupied = slots.filter((s) => s.status === 'occupied').length;
    const reserved = slots.filter((s) => s.status === 'reserved').length;
    const occupancyPct = total ? Math.round(((occupied + reserved) / total) * 100) : 0;
    return { total, available, occupied, reserved, occupancyPct };
  }, [slots]);

  const bestSlot = useMemo(
    () => slots.find((s) => s.status === 'available' && s.zone === 'A') ?? slots.find((s) => s.status === 'available'),
    [slots]
  );

  const now = new Date();
  const timeLabel = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateLabel = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Welcome + live clock */}
      <section className="rounded-2xl bg-brand-deep text-white p-5 sm:p-6 circuit-grid relative overflow-hidden">
        <p className="text-white/60 text-xs mb-1">{dateLabel} · {timeLabel}</p>
        <h1 className="font-display text-xl sm:text-2xl font-semibold mb-1">Welcome back, {firstName}</h1>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 text-white/70 text-sm hover:text-white transition-colors"
        >
          {status === 'detecting' ? (
            <LocateFixed size={14} className="animate-pulse" />
          ) : (
            <span>📍</span>
          )}
          <span>
            {status === 'detecting'
              ? 'Detecting your location…'
              : isFallback
                ? '📍 Select your location'
                : `Your Location: ${label}`}
          </span>
        </button>

        <div className="mt-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
              <span>Live occupancy</span>
              <span>{stats.occupancyPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-available transition-all duration-500"
                style={{ width: `${stats.occupancyPct}%` }}
              />
            </div>
          </div>
          <Link
            to="/parking"
            className="shrink-0 rounded-xl bg-white text-brand-deep text-sm font-semibold px-4 py-2.5 hover:bg-white/90 transition-colors"
          >
            Book Parking
          </Link>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Slots" value={stats.total} icon={CircleParking} />
        <StatCard label="Available" value={stats.available} tone="available" icon={Sparkles} />
        <StatCard label="Occupied" value={stats.occupied} tone="occupied" icon={Gauge} />
        <StatCard label="Reserved" value={stats.reserved} tone="reserved" icon={TrendingUp} />
      </section>

      {/* Best available recommendation */}
      {bestSlot && (
        <section className="rounded-2xl border border-brand/25 bg-available-soft p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-available font-medium mb-0.5">Best available slot</p>
            <p className="font-display text-lg font-semibold font-mono-slot text-ink">{bestSlot.id}</p>
            <p className="text-xs text-ink-soft">Zone {bestSlot.zone} · ₹{bestSlot.price}/hr · closest to entrance</p>
          </div>
          <button
            onClick={() => setActiveSlot(bestSlot)}
            className="shrink-0 rounded-xl bg-available text-white text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
          >
            Reserve
          </button>
        </section>
      )}

      {/* Parking overview grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold">Parking Overview</h2>
          <Link to="/parking" className="text-xs text-brand font-medium">View full map</Link>
        </div>
        <ParkingGrid slots={slots.slice(0, 16)} onSelectSlot={setActiveSlot} columns={4} />
      </section>

      {activeSlot && (
        <BookingModal slot={activeSlot} onClose={() => setActiveSlot(null)} />
      )}

      {pickerOpen && <LocationPicker onClose={() => setPickerOpen(false)} />}
    </div>
  );
}

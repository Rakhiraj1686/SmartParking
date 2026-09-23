import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';

export default function AdminSlots() {
  const { slots, loading, refreshSlots, addSlot, editSlot, removeSlot } = useAdmin();
  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [newPrice, setNewPrice] = useState(40);

  useEffect(() => {
    refreshSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSlotNumber.trim()) return;
    const result = await addSlot({ slotNumber: newSlotNumber.trim().toUpperCase(), pricePerHour: Number(newPrice) });
    if (result.success) setNewSlotNumber('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Parking Slots</h1>
        <p className="text-sm text-ink-soft mt-0.5">
          Logical slot records used for bookings today. These are <strong>not</strong> individually sensor-verified —
          real occupancy still comes from the Arduino's total count (see Parking Monitor). Sensor status here reads
          "none" until real per-slot hardware is installed.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface p-4">
        <label className="text-xs font-medium text-ink-soft">
          Slot number
          <input
            value={newSlotNumber}
            onChange={(e) => setNewSlotNumber(e.target.value)}
            placeholder="P05"
            className="input mt-1 w-28"
          />
        </label>
        <label className="text-xs font-medium text-ink-soft">
          Price / hour (₹)
          <input
            type="number"
            min={0}
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="input mt-1 w-28"
          />
        </label>
        <button type="submit" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold">
          <Plus size={16} /> Add slot
        </button>
      </form>

      {loading ? (
        <LoadingState label="Loading slots…" />
      ) : slots.length === 0 ? (
        <EmptyState title="No slots configured" description="Add a logical parking slot above." />
      ) : (
        <div className="rounded-2xl border border-line bg-surface overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs text-ink-soft border-b border-line">
                <th className="px-4 py-3 font-medium">Slot</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Sensor</th>
                <th className="px-4 py-3 font-medium">Price / hr</th>
                <th className="px-4 py-3 font-medium">Last updated</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s._id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono-slot font-semibold">{s.slotNumber}</td>
                  <td className="px-4 py-3 capitalize">{s.status}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {s.sensorStatus === 'none' ? 'none (aggregate-only hardware)' : s.sensorStatus}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      defaultValue={s.pricePerHour}
                      onBlur={(e) => {
                        const value = Number(e.target.value);
                        if (value !== s.pricePerHour) editSlot(s._id, { pricePerHour: value });
                      }}
                      className="input w-24 py-1.5 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-ink-soft text-xs">
                    {s.lastUpdated ? new Date(s.lastUpdated).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => window.confirm(`Delete slot ${s.slotNumber}?`) && removeSlot(s._id)}
                      className="text-occupied"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

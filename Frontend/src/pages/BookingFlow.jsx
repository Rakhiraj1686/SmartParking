import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, QrCode } from 'lucide-react';
import BookingSummary from '../components/BookingSummary';
import { useParking } from '../context/ParkingContext';
import { estimatePrice } from '../services/parkingService';
import { formatDateLong } from '../utils/format';

const VEHICLE_TYPES = ['Car', 'Bike', 'SUV', 'EV'];
const TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

export default function BookingFlow() {
  const { slots, parkingArea, bookSlot, cancelBooking } = useParking();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselected = searchParams.get('slot');

  const availableSlots = useMemo(() => slots.filter((s) => s.status === 'available'), [slots]);

  const [form, setForm] = useState({
    slotId: preselected && availableSlots.some((s) => s.id === preselected) ? preselected : '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    vehicleType: 'Car',
    vehicleNumber: '',
  });
  const [confirmed, setConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedSlot = availableSlots.find((s) => s.id === form.slotId) ?? slots.find((s) => s.id === form.slotId);
  const amount = selectedSlot ? estimatePrice(selectedSlot.price, form.startTime, form.endTime) : 0;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSubmit = form.slotId && form.date && form.startTime && form.endTime && form.vehicleNumber.trim().length > 3;

  const handleConfirm = async () => {
    if (!canSubmit) {
      setError('Please fill in every field, including your vehicle number.');
      return;
    }
    setError('');
    setSubmitting(true);
    const result = await bookSlot(form);
    setSubmitting(false);
    if (result.success) {
      setConfirmed(result.booking);
    } else {
      setError(result.message);
    }
  };

  const handleCancelConfirmed = async () => {
    await cancelBooking(confirmed.id);
    navigate('/bookings');
  };

  if (confirmed) {
    return (
      <div className="max-w-sm mx-auto space-y-5 rise-in">
        <div className="text-center pt-4">
          <div className="h-14 w-14 rounded-full bg-available-soft text-available flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="font-display text-xl font-semibold">Booking confirmed</h1>
          <p className="text-sm text-ink-soft mt-1">Show this at the entrance gate or let the ESP32 gate scanner read the QR.</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex justify-center py-4">
            <div className="h-32 w-32 rounded-xl bg-mist flex items-center justify-center text-ink-soft">
              <QrCode size={72} strokeWidth={1.25} />
            </div>
          </div>
          <dl className="space-y-2.5 text-sm">
            {[
              ['Booking ID', confirmed.id],
              ['Slot', confirmed.slotId],
              ['Date', formatDateLong(confirmed.date)],
              ['Time', `${confirmed.startTime} – ${confirmed.endTime}`],
              ['Vehicle', confirmed.vehicleNumber],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <dt className="text-ink-soft">{label}</dt>
                <dd className="font-medium font-mono-slot">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/bookings')}
            className="rounded-xl border border-line py-3 text-sm font-medium text-ink hover:bg-mist transition-colors"
          >
            View My Bookings
          </button>
          <button
            onClick={handleCancelConfirmed}
            className="rounded-xl bg-occupied-soft text-occupied py-3 text-sm font-semibold hover:bg-occupied/10 transition-colors"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold mb-1">Pre-Book a Slot</h1>
        <p className="text-sm text-ink-soft">Reserve a parking slot ahead of time so it's ready when you arrive.</p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 space-y-4">
        <Field label="Parking location">
          <input
            disabled
            value={parkingArea.name}
            className="w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm text-ink-soft"
          />
        </Field>

        <Field label="Parking slot">
          <select
            value={form.slotId}
            onChange={update('slotId')}
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          >
            <option value="">Select an available slot</option>
            {availableSlots.map((s) => (
              <option key={s.id} value={s.id}>{s.id} · Zone {s.zone} · ₹{s.price}/hr</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={update('date')}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </Field>
          <Field label="Vehicle type">
            <select
              value={form.vehicleType}
              onChange={update('vehicleType')}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start time">
            <select
              value={form.startTime}
              onChange={update('startTime')}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="End time">
            <select
              value={form.endTime}
              onChange={update('endTime')}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Vehicle number">
          <input
            value={form.vehicleNumber}
            onChange={update('vehicleNumber')}
            placeholder="e.g. MP09 AB 4521"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </Field>

        {error && <p className="text-sm text-occupied">{error}</p>}
      </div>

      <BookingSummary
        slotId={form.slotId || '—'}
        location={parkingArea.name}
        date={form.date}
        startTime={form.startTime}
        endTime={form.endTime}
        vehicleType={form.vehicleType}
        vehicleNumber={form.vehicleNumber}
        amount={amount}
      />

      <button
        onClick={handleConfirm}
        disabled={submitting}
        className="w-full rounded-xl bg-brand text-white py-3.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {submitting ? 'Confirming…' : 'Confirm Booking'}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      {children}
    </label>
  );
}

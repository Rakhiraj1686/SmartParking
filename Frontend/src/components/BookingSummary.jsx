import { formatDateLong, currency } from '../utils/format';

export default function BookingSummary({
  slotId,
  location,
  date,
  startTime,
  endTime,
  vehicleType,
  vehicleNumber,
  amount,
}) {
  const rows = [
    ['Location', location],
    ['Slot', slotId],
    ['Date', date ? formatDateLong(date) : '—'],
    ['Time', startTime && endTime ? `${startTime} – ${endTime}` : '—'],
    ['Vehicle', vehicleType ? `${vehicleType}${vehicleNumber ? ' · ' + vehicleNumber : ''}` : '—'],
  ];

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="font-display font-semibold mb-4">Booking Summary</p>
      <dl className="space-y-2.5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="font-medium text-right">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
        <span className="text-ink-soft text-sm">Estimated Price</span>
        <span className="font-display text-xl font-semibold text-brand">{currency(amount ?? 0)}</span>
      </div>
    </div>
  );
}

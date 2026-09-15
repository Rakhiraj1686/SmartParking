export default function StatCard({ label, value, tone = 'default', icon: Icon, suffix }) {
  const toneMap = {
    default: { bg: 'bg-surface', text: 'text-ink', iconBg: 'bg-mist', iconText: 'text-brand' },
    available: { bg: 'bg-surface', text: 'text-available', iconBg: 'bg-available-soft', iconText: 'text-available' },
    occupied: { bg: 'bg-surface', text: 'text-occupied', iconBg: 'bg-occupied-soft', iconText: 'text-occupied' },
    reserved: { bg: 'bg-surface', text: 'text-reserved', iconBg: 'bg-reserved-soft', iconText: 'text-reserved' },
  };
  const t = toneMap[tone] ?? toneMap.default;

  return (
    <div className={`rounded-2xl border border-line ${t.bg} p-4 flex items-center justify-between gap-3`}>
      <div>
        <p className="text-xs text-ink-soft mb-1">{label}</p>
        <p className={`font-display text-2xl font-semibold ${t.text}`}>
          {value}
          {suffix && <span className="text-sm font-sans font-normal text-ink-soft ml-1">{suffix}</span>}
        </p>
      </div>
      {Icon && (
        <div className={`h-10 w-10 rounded-xl ${t.iconBg} ${t.iconText} flex items-center justify-center shrink-0`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}

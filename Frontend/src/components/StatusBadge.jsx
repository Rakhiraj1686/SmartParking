import { STATUS_META } from '../utils/format';

export default function StatusBadge({ status, size = 'md' }) {
  const meta = STATUS_META[status] ?? STATUS_META.available;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${meta.bg} ${meta.text} ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

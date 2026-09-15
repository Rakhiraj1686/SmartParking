export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl border border-dashed border-line bg-surface">
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-mist text-brand flex items-center justify-center mb-3">
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}
      <p className="font-display font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-ink-soft mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

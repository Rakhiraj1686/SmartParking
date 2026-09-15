export default function LoadingState({ label = 'Loading live slot data…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-ink-soft">
      <div className="flex items-end gap-1 h-6">
        <span className="w-1.5 bg-brand rounded-full animate-[pulse-dot_1s_ease-in-out_infinite] h-3" />
        <span className="w-1.5 bg-brand rounded-full animate-[pulse-dot_1s_ease-in-out_infinite] h-6 [animation-delay:0.15s]" />
        <span className="w-1.5 bg-brand rounded-full animate-[pulse-dot_1s_ease-in-out_infinite] h-4 [animation-delay:0.3s]" />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
}

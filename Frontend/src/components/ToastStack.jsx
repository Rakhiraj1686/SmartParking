import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const VARIANT = {
  success: { icon: CheckCircle2, cls: 'bg-brand-deep text-white' },
  error: { icon: XCircle, cls: 'bg-occupied text-white' },
  info: { icon: Info, cls: 'bg-ink text-white' },
};

export default function ToastStack() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm px-0 pointer-events-none">
      {toasts.map((t) => {
        const v = VARIANT[t.variant] ?? VARIANT.success;
        const Icon = v.icon;
        return (
          <div
            key={t.id}
            className={`toast-in pointer-events-auto flex items-start gap-2.5 rounded-xl px-4 py-3 shadow-lg shadow-black/10 ${v.cls}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm leading-snug flex-1">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="opacity-70 hover:opacity-100 shrink-0">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

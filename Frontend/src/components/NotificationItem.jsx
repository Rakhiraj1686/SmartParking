import { AlertTriangle, BellRing, CheckCircle2, Info } from 'lucide-react';

const ICON = {
  success: { icon: CheckCircle2, cls: 'bg-available-soft text-available' },
  reminder: { icon: BellRing, cls: 'bg-selected-soft text-selected' },
  info: { icon: Info, cls: 'bg-mist text-brand' },
  warning: { icon: AlertTriangle, cls: 'bg-reserved-soft text-reserved' },
};

export default function NotificationItem({ notification }) {
  const meta = ICON[notification.type] ?? ICON.info;
  const Icon = meta.icon;

  return (
    <div className={`flex items-start gap-3 rounded-2xl p-3.5 ${notification.read ? 'bg-surface' : 'bg-mist'}`}>
      <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${meta.cls}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notification.read ? 'text-ink-soft' : 'text-ink font-medium'}`}>
          {notification.message}
        </p>
        <p className="text-xs text-ink-soft mt-1">{notification.timestamp}</p>
      </div>
      {!notification.read && <span className="h-2 w-2 rounded-full bg-brand mt-1.5 shrink-0" />}
    </div>
  );
}

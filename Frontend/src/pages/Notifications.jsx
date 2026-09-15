import { useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useParking } from '../context/ParkingContext';

export default function Notifications() {
  const { notifications, loading, markAllRead } = useParking();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Mark as read once the user has actually viewed the page for a moment.
    const t = setTimeout(() => {
      if (unread > 0) markAllRead();
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingState label="Loading notifications…" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold mb-1">Notifications</h1>
          <p className="text-sm text-ink-soft">Slot alerts and booking updates from your parking area.</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-brand"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New alerts about your slots and bookings will show up here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}

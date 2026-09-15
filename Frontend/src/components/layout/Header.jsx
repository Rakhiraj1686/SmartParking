import { Link } from 'react-router-dom';
import { Bell, MapPin, ParkingSquare } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export default function Header() {
  const { parkingArea, notifications, profile } = useParking();
  const unread = notifications.filter((n) => !n.read).length;
  const initials = profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-line">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <Link to="/" className="flex items-center gap-2 md:hidden">
          <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
            <ParkingSquare size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold">SmartPark</span>
        </Link>

        <div className="hidden md:flex items-center gap-1.5 text-sm text-ink-soft">
          <MapPin size={15} className="text-brand" />
          <span>{parkingArea.name}</span>
        </div>

        <div className="flex items-center gap-1.5 md:hidden text-xs text-ink-soft min-w-0">
          <MapPin size={13} className="text-brand shrink-0" />
          <span className="truncate max-w-[9rem]">{parkingArea.address.split(',')[0]}</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className="relative h-9 w-9 rounded-full bg-mist flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-occupied text-white text-[10px] flex items-center justify-center font-semibold">
                {unread}
              </span>
            )}
          </Link>
          <Link
            to="/profile"
            className="h-9 w-9 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold font-display"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}

import { NavLink } from 'react-router-dom';
import { LayoutGrid, MapPinned, CalendarClock, History, User, ParkingSquare } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutGrid, end: true },
  { to: '/parking', label: 'Parking Map', icon: MapPinned },
  { to: '/bookings', label: 'My Bookings', icon: CalendarClock },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 bg-brand-deep text-white/90 min-h-screen">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="h-9 w-9 rounded-lg bg-brand flex items-center justify-center">
          <ParkingSquare size={20} className="text-white" />
        </div>
        <div>
          <p className="font-display font-semibold text-white leading-tight">SmartPark</p>
          <p className="text-[11px] text-white/50 leading-tight">IoT parking control</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <div className="rounded-xl bg-white/5 p-3.5 circuit-grid">
          <p className="text-[11px] text-white/50 leading-snug">
            Sensor gateway status
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="h-2 w-2 rounded-full bg-available pulse-dot" />
            <span className="text-xs text-white/80">36 slots reporting live</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

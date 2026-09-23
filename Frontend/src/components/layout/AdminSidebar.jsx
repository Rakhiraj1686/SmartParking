import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Radio,
  Users,
  CalendarClock,
  CarFront,
  IndianRupee,
  Cpu,
  Grid3x3,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutGrid, end: true },
  { to: '/admin/parking', label: 'Parking Monitor', icon: Radio },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarClock },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/sessions', label: 'Sessions', icon: CarFront },
  { to: '/admin/revenue', label: 'Revenue', icon: IndianRupee },
  { to: '/admin/iot', label: 'IoT Monitor', icon: Cpu },
  { to: '/admin/slots', label: 'Parking Slots', icon: Grid3x3 },
];

export default function AdminSidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 bg-ink text-white/90 min-h-screen">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="h-9 w-9 rounded-lg bg-brand flex items-center justify-center">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div>
          <p className="font-display font-semibold text-white leading-tight">SmartPark</p>
          <p className="text-[11px] text-white/50 leading-tight">Admin console</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
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

      <div className="px-3 pb-6 space-y-3">
        <div className="rounded-xl bg-white/5 p-3.5">
          <p className="text-[11px] text-white/50 leading-snug truncate">{user?.email}</p>
          <p className="text-xs text-white/80 mt-0.5">Signed in as admin</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}

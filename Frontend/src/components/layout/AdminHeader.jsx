import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, ShieldCheck, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', end: true },
  { to: '/admin/parking', label: 'Parking Monitor' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/sessions', label: 'Sessions' },
  { to: '/admin/revenue', label: 'Revenue' },
  { to: '/admin/iot', label: 'IoT Monitor' },
  { to: '/admin/slots', label: 'Parking Slots' },
];

export default function AdminHeader() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-line">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <Link to="/admin/dashboard" className="flex items-center gap-2 md:hidden">
          <div className="h-8 w-8 rounded-lg bg-ink flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold">Admin</span>
        </Link>

        <div className="hidden md:block text-sm text-ink-soft">Smart Parking — Admin console</div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden h-9 w-9 rounded-full bg-mist flex items-center justify-center text-ink-soft"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-line px-4 py-2 flex flex-col">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-2 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-brand bg-mist' : 'text-ink-soft'}`
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium text-occupied"
          >
            <LogOut size={16} /> Log out
          </button>
        </nav>
      )}
    </header>
  );
}

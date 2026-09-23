import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Lock, Mail, ParkingSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register, error } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    vehicleNumber: '',
    vehicleType: 'Car',
  });

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result =
      mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register(form);
    setSubmitting(false);
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-brand flex items-center justify-center mx-auto mb-3">
            <ParkingSquare size={22} className="text-white" />
          </div>
          <h1 className="font-display text-xl font-semibold">SmartPark</h1>
          <p className="text-sm text-ink-soft mt-1">
            {mode === 'login' ? 'Sign in to manage your parking' : 'Create an account to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-5 space-y-4">
          {mode === 'register' && (
            <Field label="Full name" icon={User}>
              <input required value={form.name} onChange={update('name')} className="input" placeholder="Arjun Mehta" />
            </Field>
          )}

          <Field label="Email" icon={Mail}>
            <input required type="email" value={form.email} onChange={update('email')} className="input" placeholder="you@example.com" />
          </Field>

          <Field label="Password" icon={Lock}>
            <input required type="password" minLength={6} value={form.password} onChange={update('password')} className="input" placeholder="••••••••" />
          </Field>

          {mode === 'register' && (
            <Field label="Vehicle number" icon={Car}>
              <input value={form.vehicleNumber} onChange={update('vehicleNumber')} className="input font-mono-slot" placeholder="MP09 AB 4521" />
            </Field>
          )}

          {error && <p className="text-sm text-occupied">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand text-white py-3 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-center text-sm text-ink-soft hover:text-ink transition-colors"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft mb-1.5">
        <Icon size={13} /> {label}
      </span>
      {children}
    </label>
  );
}

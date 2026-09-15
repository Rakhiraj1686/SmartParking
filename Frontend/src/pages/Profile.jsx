import { useState } from 'react';
import { Car, Mail, MapPinned, Phone, Save, User } from 'lucide-react';
import { useParking } from '../context/ParkingContext';

export default function Profile() {
  const { profile, pushToast } = useParking();
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    vehicleNumber: profile.vehicleNumber,
    vehicleType: profile.vehicleType,
    preferredZone: profile.preferences.preferredZone,
    autoExtend: profile.preferences.autoExtend,
    notifyBeforeExpiry: profile.preferences.notifyBeforeExpiry,
  });

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggle = (key) => () => setForm((f) => ({ ...f, [key]: !f[key] }));

  const initials = profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  const handleSave = (e) => {
    e.preventDefault();
    pushToast('Profile preferences saved.', 'success');
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-brand text-white flex items-center justify-center text-xl font-semibold font-display">
          {initials}
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold">{form.name}</h1>
          <p className="text-sm text-ink-soft">{form.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <section className="rounded-2xl border border-line bg-surface p-5 space-y-4">
          <p className="font-display font-semibold text-sm">Personal details</p>
          <Field label="Full name" icon={User}>
            <input value={form.name} onChange={update('name')} className="input" />
          </Field>
          <Field label="Email" icon={Mail}>
            <input type="email" value={form.email} onChange={update('email')} className="input" />
          </Field>
          <Field label="Phone" icon={Phone}>
            <input value={form.phone} onChange={update('phone')} className="input" />
          </Field>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 space-y-4">
          <p className="font-display font-semibold text-sm">Vehicle</p>
          <Field label="Vehicle number" icon={Car}>
            <input value={form.vehicleNumber} onChange={update('vehicleNumber')} className="input font-mono-slot" />
          </Field>
          <Field label="Vehicle type" icon={Car}>
            <select value={form.vehicleType} onChange={update('vehicleType')} className="input">
              {['Car', 'Bike', 'SUV', 'EV'].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 space-y-4">
          <p className="font-display font-semibold text-sm">Parking preferences</p>
          <Field label="Preferred zone" icon={MapPinned}>
            <select value={form.preferredZone} onChange={update('preferredZone')} className="input">
              {['A', 'B', 'C'].map((z) => <option key={z} value={z}>Zone {z}</option>)}
            </select>
          </Field>

          <label className="flex items-center justify-between py-1">
            <span className="text-sm">Notify me before a reservation expires</span>
            <input type="checkbox" checked={form.notifyBeforeExpiry} onChange={toggle('notifyBeforeExpiry')} className="h-4 w-4 accent-brand" />
          </label>
          <label className="flex items-center justify-between py-1">
            <span className="text-sm">Auto-extend booking when running late</span>
            <input type="checkbox" checked={form.autoExtend} onChange={toggle('autoExtend')} className="h-4 w-4 accent-brand" />
          </label>
        </section>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand text-white py-3.5 text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          <Save size={16} /> Save changes
        </button>
      </form>
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

import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';

export default function AdminUsers() {
  const { users, loading, refreshUsers, changeUserRole, removeUser } = useAdmin();
  const { user: currentAdmin } = useAuth();

  useEffect(() => {
    refreshUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingState label="Loading users…" />;

  const handleRoleChange = (id, role) => {
    if (role !== 'user' && role !== 'admin') return;
    changeUserRole(id, role);
  };

  const handleDelete = (id) => {
    if (id === currentAdmin._id) return; // guarded server-side too
    if (window.confirm('Delete this user? This cannot be undone.')) {
      removeUser(id);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">User Management</h1>
        <p className="text-sm text-ink-soft mt-0.5">{users.length} registered accounts.</p>
      </div>

      {users.length === 0 ? (
        <EmptyState title="No users yet" description="Registered accounts will appear here." />
      ) : (
        <div className="rounded-2xl border border-line bg-surface overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-ink-soft border-b border-line">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Registered</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.phone || '—'}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {u.vehicleNumber || '—'} {u.vehicleType ? `(${u.vehicleType})` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="text-xs rounded-lg border border-line px-2 py-1 bg-canvas"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-available-soft text-available">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(u._id)}
                      disabled={u._id === currentAdmin._id}
                      title={u._id === currentAdmin._id ? "You can't delete your own account" : 'Delete user'}
                      className="text-occupied disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

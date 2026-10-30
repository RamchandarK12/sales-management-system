import { useEffect, useState } from 'react';
import api from '../api/client';
import { UserPlus, KeyRound } from 'lucide-react';

export default function UsersPage() {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null); // 'add' | user object for reset
  const [form, setForm] = useState({ username: '', password: '', role: 'User' });
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const load = () => api.get('/auth/users').then(r => setList(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ username: '', password: '', role: 'User' });
    setModal('add');
    setMessage('');
  };

  const openReset = (user) => {
    setNewPassword('');
    setModal(user);
    setMessage('');
  };

  const saveUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/users', form);
      setModal(null);
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create user');
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/auth/users/${modal.id}/reset-password`, { new_password: newPassword });
      setMessage('Password reset successfully');
      setModal(null);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500">Create users and reset passwords</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
          <UserPlus size={18} /> Add User
        </button>
      </div>

      {message && <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">{message}</div>}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Username</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openReset(u)} className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm hover:bg-slate-50">
                    <KeyRound size={14} /> Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'add' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add User</h3>
            {message && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-3">{message}</div>}
            <form onSubmit={saveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="User">User (Sales + Products + Expenses)</option>
                  <option value="Admin">Admin (Full access)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal && modal !== 'add' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Reset Password for {modal.username}</h3>
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Password *</label>
                <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Reset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
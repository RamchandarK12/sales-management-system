import { useEffect, useState } from 'react';
import api from '../api/client';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

export default function SalesPersons() {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', joining_date: '', status: 'Active', monthly_target: 0 });

  const load = () => api.get('/salespersons').then(r => setList(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ name: '', phone: '', joining_date: new Date().toISOString().slice(0, 10), status: 'Active', monthly_target: 0 });
    setModal('add');
  };
  const openEdit = (p) => { setForm({ ...p, joining_date: p.joining_date || '' }); setModal(p); };

  const save = async (e) => {
    e.preventDefault();
    if (modal === 'add') await api.post('/salespersons', form);
    else await api.put(`/salespersons/${modal.id}`, form);
    setModal(null); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this sales person?')) return;
    await api.delete(`/salespersons/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sales Persons</h2>
          <p className="text-sm text-slate-500">Manage your sales team</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
          <UserPlus size={18} /> Add Person
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
              <th className="text-left px-4 py-3 font-medium">Target</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                <td className="px-4 py-3 text-slate-600">{p.phone || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{p.joining_date || '—'}</td>
                <td className="px-4 py-3 text-slate-600">₹{Number(p.monthly_target).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={16} /></button>
                  <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No sales persons yet</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">{modal === 'add' ? 'Add Sales Person' : 'Edit Sales Person'}</h3>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
                  <input type="date" value={form.joining_date || ''} onChange={e => setForm({...form, joining_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Target (₹)</label>
                <input type="number" value={form.monthly_target} onChange={e => setForm({...form, monthly_target: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
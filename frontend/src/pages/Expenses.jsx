import { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Trash2 } from 'lucide-react';

export default function Expenses() {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category_id: '', amount: '', expense_date: '', description: '', payment_mode: 'Cash' });

  const load = () => {
    api.get('/expenses').then(r => setList(r.data));
    api.get('/expenses/categories').then(r => setCategories(r.data));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ category_id: '', amount: '', expense_date: new Date().toISOString().slice(0,10), description: '', payment_mode: 'Cash' });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    await api.post('/expenses', form);
    setModal(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    load();
  };

  const total = list.reduce((s, e) => s + Number(e.amount), 0);

  const typeClass = (t) => {
    if (t === 'Vehicle') return 'bg-amber-100 text-amber-700';
    if (t === 'Business') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Expenses</h2>
          <p className="text-sm text-slate-500">Track all business and vehicle expenses</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="bg-primary-50 border border-primary-100 rounded-xl px-5 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-primary-800">Total (shown)</span>
        <span className="text-lg font-bold text-primary-900">₹{total.toLocaleString('en-IN')}</span>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-right px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Mode</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{e.expense_date}</td>
                <td className="px-4 py-3 font-medium">{e.category_name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeClass(e.category_type)}`}>{e.category_type}</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-rose-600">₹{Number(e.amount).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-slate-500">{e.payment_mode}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{e.description || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No expenses yet</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add Expense</h3>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount (₹) *</label>
                  <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Mode</label>
                <select value={form.payment_mode} onChange={e => setForm({...form, payment_mode: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
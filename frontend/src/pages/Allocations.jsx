import { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Trash2 } from 'lucide-react';

export default function Allocations() {
  const [list, setList] = useState([]);
  const [persons, setPersons] = useState([]);
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ sales_person_id: '', product_id: '', quantity: '', allocation_date: '', notes: '' });

  const load = () => {
    api.get('/allocations').then(r => setList(r.data));
    api.get('/salespersons?status=Active').then(r => setPersons(r.data));
    api.get('/products').then(r => setProducts(r.data));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ sales_person_id: '', product_id: '', quantity: '', allocation_date: new Date().toISOString().slice(0,10), notes: '' });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    await api.post('/allocations', form);
    setModal(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this allocation?')) return;
    await api.delete(`/allocations/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product Allocation</h2>
          <p className="text-sm text-slate-500">Record products given to sales persons</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
          <Plus size={18} /> New Allocation
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Sales Person</th>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-right px-4 py-3 font-medium">Quantity</th>
              <th className="text-left px-4 py-3 font-medium">Notes</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{a.allocation_date}</td>
                <td className="px-4 py-3 font-medium">{a.sales_person_name}</td>
                <td className="px-4 py-3">{a.product_name}</td>
                <td className="px-4 py-3 text-right font-medium">{a.quantity}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{a.notes || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No allocations yet</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">New Product Allocation</h3>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sales Person *</label>
                <select required value={form.sales_person_id} onChange={e => setForm({...form, sales_person_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select...</option>
                  {persons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product *</label>
                <select required value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input required type="number" step="0.01" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" value={form.allocation_date} onChange={e => setForm({...form, allocation_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
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
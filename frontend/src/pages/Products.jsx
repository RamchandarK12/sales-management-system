import { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Pencil, Package } from 'lucide-react';

export default function Products() {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', unit: 'pcs', description: '' });

  const load = () => api.get('/products?active=false').then(r => setList(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ name: '', price: '', unit: 'pcs', description: '', is_active: true });
    setModal('add');
  };
  const openEdit = (p) => { setForm({ ...p }); setModal(p); };

  const save = async (e) => {
    e.preventDefault();
    if (modal === 'add') await api.post('/products', form);
    else await api.put(`/products/${modal.id}`, form);
    setModal(null); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">Manage your product catalog</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(p => (
          <div key={p.id} className={`bg-white rounded-xl border p-5 ${!p.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Package size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{p.name}</h3>
                  <p className="text-sm text-slate-500">{p.unit}</p>
                </div>
              </div>
              <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={16} /></button>
            </div>
            <p className="mt-3 text-xl font-bold text-slate-900">₹{Number(p.price).toLocaleString('en-IN')}</p>
            {p.description && <p className="mt-1 text-sm text-slate-500 line-clamp-2">{p.description}</p>}
            <span className={`mt-3 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {p.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h3>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                  <input required type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="pcs, kg, box" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" rows={2} />
              </div>
              {modal !== 'add' && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} /> Active
                </label>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
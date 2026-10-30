import { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Trash2, Download } from 'lucide-react';
import { exportToCSV } from '../utils/export';

export default function Sales() {
  const [list, setList] = useState([]);
  const [persons, setPersons] = useState([]);
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    sales_person_id: '',
    product_id: '',
    quantity_sold: '',
    amount_received: '',
    sale_date: '',
    notes: ''
  });

  const load = () => {
    api.get('/sales').then(r => setList(r.data));
    api.get('/salespersons?status=Active').then(r => setPersons(r.data));
    api.get('/products').then(r => setProducts(r.data));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm({
      sales_person_id: '',
      product_id: '',
      quantity_sold: '',
      amount_received: '',
      sale_date: new Date().toISOString().slice(0, 10),
      notes: ''
    });
    setModal(true);
  };

  const onProductChange = (productId) => {
    const prod = products.find(p => p.id === Number(productId));
    setForm(f => ({
      ...f,
      product_id: productId,
      amount_received:
        prod && f.quantity_sold
          ? (prod.price * Number(f.quantity_sold)).toFixed(2)
          : f.amount_received
    }));
  };

  const onQtyChange = (qty) => {
    const prod = products.find(p => p.id === Number(form.product_id));
    setForm(f => ({
      ...f,
      quantity_sold: qty,
      amount_received:
        prod && qty
          ? (prod.price * Number(qty)).toFixed(2)
          : f.amount_received
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    await api.post('/sales', form);
    setModal(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this sale?')) return;
    await api.delete(`/sales/${id}`);
    load();
  };

  const handleExport = () => {
    exportToCSV(
      'sales',
      list.map(s => ({
        Date: s.sale_date,
        SalesPerson: s.sales_person_name,
        Product: s.product_name,
        Quantity: s.quantity_sold,
        Amount: s.amount_received
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sales Entry</h2>
          <p className="text-sm text-slate-500">Record daily / weekly sales</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
          >
            <Download size={18} />
            Export Excel
          </button>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus size={18} />
            Add Sale
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Sales Person</th>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-right px-4 py-3 font-medium">Qty</th>
              <th className="text-right px-4 py-3 font-medium">Amount</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{s.sale_date}</td>
                <td className="px-4 py-3 font-medium">{s.sales_person_name}</td>
                <td className="px-4 py-3">{s.product_name}</td>
                <td className="px-4 py-3 text-right">{s.quantity_sold}</td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                  ₹{Number(s.amount_received).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => remove(s.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No sales recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Record Sale</h3>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sales Person *</label>
                <select
                  required
                  value={form.sales_person_id}
                  onChange={e => setForm({ ...form, sales_person_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select...</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product *</label>
                <select
                  required
                  value={form.product_id}
                  onChange={e => onProductChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.quantity_sold}
                    onChange={e => onQtyChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount Received (₹) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.amount_received}
                    onChange={e => setForm({ ...form, amount_received: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sale Date</label>
                <input
                  type="date"
                  value={form.sale_date}
                  onChange={e => setForm({ ...form, sale_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
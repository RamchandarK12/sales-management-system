import { useEffect, useState } from 'react';
import api from '../api/client';
import { Fuel } from 'lucide-react';

export default function VehicleExpenses() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/reports/vehicle?month=${month}`).then(r => setData(r.data));
  }, [month]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Fuel size={22} className="text-amber-500" /> Vehicle Expenses
          </h2>
          <p className="text-sm text-slate-500">Petrol, diesel, maintenance and more</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex items-center justify-between">
        <span className="font-medium text-amber-800">Total Vehicle Expenses</span>
        <span className="text-2xl font-bold text-amber-900">₹{Number(data?.total || 0).toLocaleString('en-IN')}</span>
      </div>

      {data?.by_category?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.by_category.map(c => (
            <div key={c.category} className="bg-white rounded-xl border p-4">
              <p className="text-sm text-slate-500">{c.category}</p>
              <p className="text-xl font-bold text-slate-900 mt-1">₹{Number(c.amount).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-right px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Mode</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data?.details || []).map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{e.expense_date}</td>
                <td className="px-4 py-3 font-medium">{e.category_name}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{Number(e.amount).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-slate-500">{e.payment_mode}</td>
                <td className="px-4 py-3 text-slate-500">{e.description || '—'}</td>
              </tr>
            ))}
            {(data?.details || []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No vehicle expenses this month</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import api from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function Reports() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthly, setMonthly] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [tab, setTab] = useState('monthly');

  useEffect(() => {
    api.get(`/reports/monthly?month=${month}`).then(r => setMonthly(r.data));
    api.get(`/reports/performance?month=${month}`).then(r => setPerformance(r.data));
  }, [month]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reports & Analysis</h2>
          <p className="text-sm text-slate-500">Monthly insights and performance</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {['monthly', 'performance'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t === 'monthly' ? 'Monthly Report' : 'Sales Person Performance'}
          </button>
        ))}
      </div>

      {tab === 'monthly' && monthly && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border p-5">
              <p className="text-sm text-slate-500">Total Sales</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">₹{Number(monthly.total_sales).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <p className="text-sm text-slate-500">Total Expenses</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">₹{Number(monthly.total_expenses).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <p className="text-sm text-slate-500">Profit</p>
              <p className={`text-2xl font-bold mt-1 ${monthly.profit >= 0 ? 'text-primary-600' : 'text-orange-600'}`}>
                ₹{Number(monthly.profit).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold mb-4">Product-wise Sales</h3>
              {(monthly.product_wise_sales || []).length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthly.product_wise_sales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="product_name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')}`} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold mb-4">Expense Breakdown</h3>
              {(monthly.expense_breakdown || []).length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={monthly.expense_breakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={90}
                      label={({category, percent}) => `${category} (${(percent*100).toFixed(0)}%)`}>
                      {monthly.expense_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'performance' && performance && (
        <div className="space-y-4">
          {(performance.performance || []).map(p => (
            <div key={p.sales_person_id} className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    p.rank === 1 ? 'bg-amber-400' : p.rank === 2 ? 'bg-slate-400' : p.rank === 3 ? 'bg-amber-700' : 'bg-slate-300'
                  }`}>{p.rank}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500">
                      Target: ₹{Number(p.monthly_target).toLocaleString('en-IN')}
                      {p.target_achievement != null && ` | Achievement: ${p.target_achievement}%`}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-emerald-600">₹{Number(p.total_business).toLocaleString('en-IN')}</p>
              </div>
              {p.products.length > 0 && (
                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="text-slate-500 text-xs">
                      <th className="text-left py-1">Product</th>
                      <th className="text-right py-1">Allocated</th>
                      <th className="text-right py-1">Sold</th>
                      <th className="text-right py-1">Remaining</th>
                      <th className="text-right py-1">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.products.map(pr => (
                      <tr key={pr.product_id} className="border-t border-slate-50">
                        <td className="py-1.5">{pr.product_name}</td>
                        <td className="text-right py-1.5">{pr.allocated}</td>
                        <td className="text-right py-1.5">{pr.sold}</td>
                        <td className={`text-right py-1.5 ${pr.remaining < 0 ? 'text-rose-600' : ''}`}>{pr.remaining}</td>
                        <td className="text-right py-1.5 font-medium">₹{Number(pr.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
          {(performance.performance || []).length === 0 && (
            <p className="text-center text-slate-400 py-10">No performance data</p>
          )}
        </div>
      )}
    </div>
  );
}
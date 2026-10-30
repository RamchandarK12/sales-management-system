import { useEffect, useState } from 'react';
import api from '../api/client';
import { TrendingUp, TrendingDown, Wallet, Fuel, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{Number(value).toLocaleString('en-IN')}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}><Icon size={22} className="text-white" /></div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports/dashboard?month=${month}`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const chartData = data?.sales_by_person?.filter(p => p.total > 0) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Overview of your business performance</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={data?.total_sales || 0} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Total Expenses" value={data?.total_expenses || 0} icon={TrendingDown} color="bg-rose-500" />
        <StatCard title="Estimated Profit" value={data?.profit || 0} icon={Wallet} color={data?.profit >= 0 ? 'bg-primary-500' : 'bg-orange-500'} />
        <StatCard title="Vehicle Expenses" value={data?.vehicle_expenses || 0} icon={Fuel} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Users size={18} /> Sales by Person</h3>
          {chartData.length === 0 ? (
            <p className="text-slate-400 text-sm py-10 text-center">No sales data this month</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Sales']} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {(data?.sales_by_person || []).slice(0, 6).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-slate-300'
                }`}>{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="font-medium text-slate-800 truncate">{p.name}</p></div>
                <p className="font-semibold text-slate-900">₹{Number(p.total).toLocaleString('en-IN')}</p>
              </div>
            ))}
            {(data?.sales_by_person || []).length === 0 && <p className="text-slate-400 text-sm text-center py-6">No data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
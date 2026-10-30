import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, Truck, ShoppingCart,
  Receipt, BarChart3, LogOut, Menu, X, Fuel
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/Authcontext';

const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin'] },
  { to: '/salespersons', icon: Users, label: 'Sales Persons', roles: ['Admin'] },
  { to: '/products', icon: Package, label: 'Products', roles: ['Admin', 'User'] },
  { to: '/allocations', icon: Truck, label: 'Product Allocation', roles: ['Admin'] },
  { to: '/sales', icon: ShoppingCart, label: 'Sales Entry', roles: ['Admin', 'User'] },
  { to: '/expenses', icon: Receipt, label: 'Expenses', roles: ['Admin', 'User'] },
  { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['Admin'] },
  { to: '/vehicle', icon: Fuel, label: 'Vehicle Expenses', roles: ['Admin'] },
  { to: '/users', icon: Users, label: 'Users', roles: ['Admin'] },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'User';
  const navItems = allNavItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm">SM</div>
            <span className="font-semibold text-lg">SalesMgr</span>
          </div>
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="p-3 space-y-1 mt-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
              }>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium text-white">{user?.username}</div>
              <div className="text-xs text-slate-400">{role}</div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center">
            <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <h1 className="ml-2 lg:ml-0 text-lg font-semibold text-slate-800">Sales & Business Management</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50">
            <LogOut size={16} /> Logout
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
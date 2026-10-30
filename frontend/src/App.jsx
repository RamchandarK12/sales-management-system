import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/Authcontext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SalesPersons from './pages/SalesPersons';
import Products from './pages/Products';
import Allocations from './pages/Allocations';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import VehicleExpenses from './pages/VehicleExpenses';

// Optional pages - only import if files exist
let ForgotPassword = null;
let UsersPage = null;
try {
  // These will fail at build if file missing, so we import normally below
} catch (e) {}

import ForgotPasswordPage from './pages/ForgotPassword';
import UsersPageComponent from './pages/Users';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/sales" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<PrivateRoute roles={['Admin']}><Dashboard /></PrivateRoute>} />
            <Route path="salespersons" element={<PrivateRoute roles={['Admin']}><SalesPersons /></PrivateRoute>} />
            <Route path="products" element={<PrivateRoute roles={['Admin', 'User']}><Products /></PrivateRoute>} />
            <Route path="allocations" element={<PrivateRoute roles={['Admin']}><Allocations /></PrivateRoute>} />
            <Route path="sales" element={<PrivateRoute roles={['Admin', 'User']}><Sales /></PrivateRoute>} />
            <Route path="expenses" element={<PrivateRoute roles={['Admin', 'User']}><Expenses /></PrivateRoute>} />
            <Route path="reports" element={<PrivateRoute roles={['Admin']}><Reports /></PrivateRoute>} />
            <Route path="vehicle" element={<PrivateRoute roles={['Admin']}><VehicleExpenses /></PrivateRoute>} />
            <Route path="users" element={<PrivateRoute roles={['Admin']}><UsersPageComponent /></PrivateRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
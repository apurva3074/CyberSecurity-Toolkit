import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatbotWidget from './components/ChatbotWidget';
import useAuth from './hooks/useAuth';
import { supabase } from './lib/supabaseClient';

function DisabledAccount() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white/5 border border-red-500/20 rounded-2xl p-8 max-w-md text-center">
        <h2 className="text-xl font-bold text-red-400 mb-3">Account Disabled</h2>
        <p className="text-gray-400 text-sm mb-6">
          Your account has been disabled by an administrator. Contact support if you believe this is an error.
        </p>
        <button
          onClick={handleLogout}
          className="px-6 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition text-sm font-medium"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { user, role, isAdmin, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;

  const isDisabled = role === 'disabled';
  const homePath = isAdmin ? '/admin' : '/dashboard';

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? (isDisabled ? <DisabledAccount /> : <Navigate to={homePath} />) : <Auth />} />
        <Route path="/dashboard" element={user && !isAdmin && !isDisabled ? <Dashboard /> : <Navigate to={user ? (isDisabled ? '/login' : '/admin') : '/login'} />} />
        <Route path="/admin" element={user && isAdmin ? <AdminDashboard /> : <Navigate to={user ? '/dashboard' : '/login'} />} />
        <Route path="*" element={<Navigate to={user ? (isDisabled ? '/login' : homePath) : '/login'} />} />
      </Routes>
      {user && !isAdmin && !isDisabled && <ChatbotWidget />}
    </>
  );
}

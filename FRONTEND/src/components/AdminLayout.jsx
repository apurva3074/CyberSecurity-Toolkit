import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  HiOutlineViewGrid,
  HiOutlineShieldExclamation,
  HiOutlineUsers,
  HiOutlineDocumentSearch,
  HiOutlineLogout,
  HiOutlineMenuAlt2,
} from 'react-icons/hi';
import Zentrya from '../assets/Zentrya.svg';

const navItems = [
  { id: 'overview', label: 'Overview', icon: HiOutlineViewGrid },
  { id: 'takedowns', label: 'Takedowns', icon: HiOutlineShieldExclamation },
  { id: 'users', label: 'Users', icon: HiOutlineUsers },
  { id: 'scan-logs', label: 'Scan Logs', icon: HiOutlineDocumentSearch },
];

export default function AdminLayout({ currentPage, onNavigate, children, pendingCount = 0 }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminEmail(session?.user?.email || '');
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const initial = adminEmail ? adminEmail[0].toUpperCase() : 'A';

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#111119] border-r border-white/5 flex flex-col z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <img src={Zentrya} alt="Zentrya" className="w-10 h-10 flex-shrink-0" />
          {sidebarOpen && (
            <div className="animate-fadeIn">
              <h1 className="text-white font-bold text-lg leading-tight">Zentrya</h1>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">Admin Console</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            const showBadge = item.id === 'takedowns' && pendingCount > 0;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  active
                    ? 'bg-purple-600/20 text-purple-400 shadow-sm shadow-purple-500/10'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
                {showBadge && (
                  <span className={`bg-yellow-500 text-black text-[10px] font-bold rounded-full min-w-[20px] text-center ${
                    sidebarOpen ? 'px-1.5 py-0.5' : 'absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <HiOutlineMenuAlt2 className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} />
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
          >
            <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-semibold capitalize">
            {navItems.find((n) => n.id === currentPage)?.label || 'Overview'}
          </h2>
          <div className="flex items-center gap-3">
            {adminEmail && (
              <span className="text-gray-400 text-sm hidden sm:block">{adminEmail}</span>
            )}
            <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {initial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 md:p-8 animate-fadeIn">{children}</div>
      </main>
    </div>
  );
}
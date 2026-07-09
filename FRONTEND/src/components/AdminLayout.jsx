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
  HiOutlineCog,
  HiOutlineChatAlt2,
} from 'react-icons/hi';
import Zentrya from '../assets/Zentrya.svg';

const navItems = [
  { id: 'overview', label: 'Overview', icon: HiOutlineViewGrid, desc: 'Dashboard stats' },
  { id: 'takedowns', label: 'Takedowns', icon: HiOutlineShieldExclamation, desc: 'Manage requests' },
  { id: 'users', label: 'Users', icon: HiOutlineUsers, desc: 'User accounts' },
  { id: 'scan-logs', label: 'Scan Logs', icon: HiOutlineDocumentSearch, desc: 'Activity history' },
  { id: 'community', label: 'Community', icon: HiOutlineChatAlt2, desc: 'Questions & answers' },
];

export default function AdminLayout({ currentPage, onNavigate, children, pendingCount = 0 }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const navigate = useNavigate();

  // Close the mobile drawer whenever a nav item is chosen
  useEffect(() => {
    setMobileOpen(false);
  }, [currentPage]);

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
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#111119] border-r border-white/5 flex flex-col z-50 duration-300 w-64 transition-transform md:transition-[width] ${
          sidebarOpen ? 'md:w-64' : 'md:w-[72px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
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

        {/* Admin profile */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-white/5 animate-fadeIn">
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
              <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{adminEmail || 'Admin'}</p>
                <p className="text-gray-500 text-[10px]">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Section label */}
        {sidebarOpen && (
          <div className="px-5 pt-5 pb-2">
            <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-widest">Navigation</p>
          </div>
        )}

        {/* Nav Items */}
        <nav className={`flex-1 px-3 ${sidebarOpen ? 'py-1' : 'py-4'} space-y-1`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            const showBadge = item.id === 'takedowns' && pendingCount > 0;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                  sidebarOpen
                    ? `w-full gap-3 px-3 py-3 ${active ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/10 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`
                    : `w-11 h-11 justify-center mx-auto ${active ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {sidebarOpen ? (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-purple-600/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className="block leading-tight">{item.label}</span>
                      <span className={`text-[10px] ${active ? 'text-purple-400/60' : 'text-gray-600'}`}>{item.desc}</span>
                    </div>
                    {showBadge && (
                      <span className="bg-yellow-500 text-black text-[10px] font-bold rounded-full min-w-[20px] text-center px-1.5 py-0.5">
                        {pendingCount}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Icon className="w-5 h-5" />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-yellow-500 text-black text-[10px] font-bold rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition"
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
        className={`flex-1 min-w-0 transition-all duration-300 ml-0 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-[72px]'
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition flex-shrink-0"
              aria-label="Open menu"
            >
              <HiOutlineMenuAlt2 className="w-5 h-5" />
            </button>
            <h2 className="text-white text-lg sm:text-xl font-semibold capitalize truncate">
              {navItems.find((n) => n.id === currentPage)?.label || 'Overview'}
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {adminEmail && (
              <span className="text-gray-400 text-sm hidden sm:block">{adminEmail}</span>
            )}
            <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {initial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 sm:p-6 md:p-8 animate-fadeIn">{children}</div>
      </main>
    </div>
  );
}

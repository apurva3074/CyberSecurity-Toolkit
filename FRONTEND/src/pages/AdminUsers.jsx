import { useState, useEffect } from 'react';
import {
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineBan,
  HiOutlineCheck,
} from 'react-icons/hi';
import { supabase } from '../lib/supabaseClient';

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'bg-purple-500/20 text-purple-400', icon: HiOutlineShieldCheck },
  user: { label: 'User', color: 'bg-blue-500/20 text-blue-400', icon: HiOutlineUser },
  disabled: { label: 'Disabled', color: 'bg-red-500/20 text-red-400', icon: HiOutlineBan },
};

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId, newRole) => {
    const labels = { admin: 'admin', user: 'regular user', disabled: 'disabled' };
    if (!window.confirm(`Change this user's role to ${labels[newRole]}?`)) return;

    setActionLoading(userId);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      setMessage({ type: 'error', text: `Failed to update role: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: `Role updated to ${labels[newRole]}` });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setTimeout(() => setMessage(null), 4000);
    }
    setActionLoading(null);
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.id?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || u.role === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    total: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    user: users.filter((u) => u.role === 'user').length,
    disabled: users.filter((u) => u.role === 'disabled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-gray-400 text-sm">
          Manage user accounts and permissions
        </p>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition text-sm"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-500 text-xs font-medium">Total Users</p>
          <p className="text-2xl font-bold text-white mt-1">{counts.total}</p>
        </div>
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
          <p className="text-purple-500 text-xs font-medium">Admins</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{counts.admin}</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
          <p className="text-blue-500 text-xs font-medium">Users</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{counts.user}</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
          <p className="text-red-500 text-xs font-medium">Disabled</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{counts.disabled}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'admin', label: 'Admins' },
            { key: 'user', label: 'Users' },
            { key: 'disabled', label: 'Disabled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback message */}
      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading users...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <HiOutlineUsers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Email</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Role</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Joined</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-white text-sm">{user.email}</p>
                      <p className="text-gray-600 text-xs font-mono">{user.id?.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => updateRole(user.id, 'admin')}
                          disabled={actionLoading === user.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 text-xs font-medium hover:bg-purple-600/30 transition disabled:opacity-50"
                          title="Make Admin"
                        >
                          <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                          Make Admin
                        </button>
                      )}
                      {user.role !== 'user' && user.role !== 'disabled' && (
                        <button
                          onClick={() => updateRole(user.id, 'user')}
                          disabled={actionLoading === user.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-medium hover:bg-blue-600/30 transition disabled:opacity-50"
                          title="Make User"
                        >
                          <HiOutlineUser className="w-3.5 h-3.5" />
                          Make User
                        </button>
                      )}
                      {user.role !== 'disabled' && (
                        <button
                          onClick={() => updateRole(user.id, 'disabled')}
                          disabled={actionLoading === user.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-xs font-medium hover:bg-red-600/30 transition disabled:opacity-50"
                          title="Disable Account"
                        >
                          <HiOutlineBan className="w-3.5 h-3.5" />
                          Disable
                        </button>
                      )}
                      {user.role === 'disabled' && (
                        <button
                          onClick={() => updateRole(user.id, 'user')}
                          disabled={actionLoading === user.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 text-xs font-medium hover:bg-green-600/30 transition disabled:opacity-50"
                          title="Re-enable Account"
                        >
                          <HiOutlineCheck className="w-3.5 h-3.5" />
                          Enable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

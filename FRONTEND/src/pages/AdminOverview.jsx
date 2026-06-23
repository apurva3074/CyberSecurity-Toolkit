import { useState, useEffect } from 'react';
import {
  HiOutlineShieldExclamation,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineMail,
  HiOutlineUsers,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import { supabase } from '../lib/supabaseClient';
import { API_BASE_URL } from '../config';

function TimeAgo({ date }) {
  if (!date) return <span>—</span>;
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return <span>just now</span>;
  if (diff < 3600) return <span>{Math.floor(diff / 60)}m ago</span>;
  if (diff < 86400) return <span>{Math.floor(diff / 3600)}h ago</span>;
  return <span>{d.toLocaleDateString()}</span>;
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 bg-white/10 rounded" />
          <div className="h-7 w-12 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      <td className="px-6 py-3"><div className="h-4 w-8 bg-white/10 rounded animate-pulse" /></td>
      <td className="px-6 py-3"><div className="h-4 w-40 bg-white/10 rounded animate-pulse" /></td>
      <td className="px-6 py-3"><div className="h-5 w-16 bg-white/10 rounded-full animate-pulse" /></td>
      <td className="px-6 py-3"><div className="h-4 w-20 bg-white/10 rounded animate-pulse" /></td>
    </tr>
  );
}

export default function AdminOverview({ onNavigate }) {
  const [takedownStats, setTakedownStats] = useState({ total: 0, pending: 0, approved: 0, email_sent: 0, rejected: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/takedown/list/`);
      const data = await res.json();
      setTakedownStats({
        total: data.length,
        pending: data.filter((r) => r.status === 'pending').length,
        approved: data.filter((r) => r.status === 'approved').length,
        email_sent: data.filter((r) => r.status === 'email_sent').length,
        rejected: data.filter((r) => r.status === 'rejected').length,
      });
      setRecentRequests(data.slice(0, 5));
    } catch {
      // handled by empty state
    }

    try {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setUserCount(count || 0);
    } catch {
      // handled by default 0
    }
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Requests', value: takedownStats.total, icon: HiOutlineShieldExclamation, bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    { label: 'Pending Review', value: takedownStats.pending, icon: HiOutlineClock, bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
    { label: 'Approved', value: takedownStats.approved, icon: HiOutlineCheckCircle, bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
    { label: 'Emails Sent', value: takedownStats.email_sent, icon: HiOutlineMail, bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    { label: 'Rejected', value: takedownStats.rejected, icon: HiOutlineExclamationCircle, bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
    { label: 'Total Users', value: userCount, icon: HiOutlineUsers, bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  ];

  const STATUS_COLORS = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    email_sent: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`${card.bg} border ${card.border} rounded-xl p-5 flex items-start gap-4 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer`}
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => {
                    if (card.label === 'Total Users') onNavigate('users');
                    else onNavigate('takedowns');
                  }}
                >
                  <div className={`p-3 rounded-xl ${card.bg}`}>
                    <Icon className={`w-6 h-6 ${card.text}`} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{card.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${card.text}`}>{card.value}</p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <button
          onClick={() => onNavigate('takedowns')}
          className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <HiOutlineShieldExclamation className="w-6 h-6 text-purple-400" />
              <h3 className="text-white font-semibold text-lg">Manage Takedowns</h3>
            </div>
            <HiOutlineArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-gray-500 text-sm">
            Review pending requests, approve or reject, and send abuse emails.
          </p>
          {takedownStats.pending > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
              <HiOutlineClock className="w-3.5 h-3.5" />
              {takedownStats.pending} pending
            </div>
          )}
        </button>

        <button
          onClick={() => onNavigate('users')}
          className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <HiOutlineUsers className="w-6 h-6 text-indigo-400" />
              <h3 className="text-white font-semibold text-lg">Manage Users</h3>
            </div>
            <HiOutlineArrowRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-gray-500 text-sm">
            View registered users, change roles, and manage access.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <HiOutlineUsers className="w-3.5 h-3.5" />
            {userCount} users
          </div>
        </button>
      </div>

      {/* Recent Takedown Requests */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-semibold">Recent Takedown Requests</h3>
          <button
            onClick={() => onNavigate('takedowns')}
            className="text-purple-400 text-sm hover:text-purple-300 transition inline-flex items-center gap-1"
          >
            View all <HiOutlineArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <table className="w-full">
              <tbody>{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
            </table>
          ) : recentRequests.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              No takedown requests yet
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium">ID</th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium">URL</th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer" onClick={() => onNavigate('takedowns')}>
                    <td className="px-6 py-3 text-white font-mono text-sm">#{req.id}</td>
                    <td className="px-6 py-3 text-purple-300 text-sm max-w-xs truncate">{req.malicious_url}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[req.status] || ''}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">
                      <TimeAgo date={req.created_at} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
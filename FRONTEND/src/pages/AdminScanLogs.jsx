import { useState, useEffect } from 'react';
import {
  HiOutlineLink,
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/api/scans`;

const TYPE_CONFIG = {
  url: { label: 'URL Scan', icon: HiOutlineLink, color: 'bg-blue-500/20 text-blue-400' },
  email: { label: 'Email Scan', icon: HiOutlineMail, color: 'bg-purple-500/20 text-purple-400' },
  metadata: { label: 'Metadata', icon: HiOutlineShieldCheck, color: 'bg-indigo-500/20 text-indigo-400' },
  spam: { label: 'Spam Check', icon: HiOutlineExclamationCircle, color: 'bg-orange-500/20 text-orange-400' },
};

function TypeBadge({ type }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.url;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

export default function AdminScanLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [threatFilter, setThreatFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/list/`),
        fetch(`${API_URL}/stats/`),
      ]);
      const logsData = await logsRes.json();
      const statsData = await statsRes.json();
      setLogs(logsData);
      setStats(statsData);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesType = filter === 'all' || log.scan_type === filter;
    const matchesSearch = !search || log.input_value?.toLowerCase().includes(search.toLowerCase());
    const matchesThreat =
      threatFilter === 'all' ||
      (threatFilter === 'threats' && log.is_threat) ||
      (threatFilter === 'safe' && !log.is_threat);
    return matchesType && matchesSearch && matchesThreat;
  });

  const statCards = [
    { label: 'Total Scans', value: stats.total || 0, icon: HiOutlineShieldCheck, bg: 'bg-white/5', border: 'border-white/10', text: 'text-white' },
    { label: 'URL Scans', value: stats.url_scans || 0, icon: HiOutlineLink, bg: 'bg-blue-500/5', border: 'border-blue-500/10', text: 'text-blue-400' },
    { label: 'Email Scans', value: stats.email_scans || 0, icon: HiOutlineMail, bg: 'bg-purple-500/5', border: 'border-purple-500/10', text: 'text-purple-400' },
    { label: 'Metadata Fetches', value: stats.metadata_scans || 0, icon: HiOutlineShieldCheck, bg: 'bg-indigo-500/5', border: 'border-indigo-500/10', text: 'text-indigo-400' },
    { label: 'Spam Checks', value: stats.spam_scans || 0, icon: HiOutlineExclamationCircle, bg: 'bg-orange-500/5', border: 'border-orange-500/10', text: 'text-orange-400' },
    { label: 'Threats Found', value: stats.threats_found || 0, icon: HiOutlineExclamation, bg: 'bg-red-500/5', border: 'border-red-500/10', text: 'text-red-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-gray-400 text-sm">Monitor all scan activity across the platform</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition text-sm"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${card.text}`} />
                <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">{card.label}</p>
              </div>
              <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search scans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'All Types' },
            { key: 'url', label: 'URL' },
            { key: 'email', label: 'Email' },
            { key: 'metadata', label: 'Metadata' },
            { key: 'spam', label: 'Spam' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                filter === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="w-px bg-white/10" />
          {[
            { key: 'all', label: 'All' },
            { key: 'threats', label: 'Threats Only' },
            { key: 'safe', label: 'Safe Only' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setThreatFilter(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                threatFilter === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading scan logs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <HiOutlineShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No scan logs found</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Type</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Input</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Result</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Threat</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">IP</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-5 py-3.5">
                    <TypeBadge type={log.scan_type} />
                  </td>
                  <td className="px-5 py-3.5 text-gray-300 text-sm max-w-xs truncate" title={log.input_value}>
                    {log.input_value?.slice(0, 60)}{log.input_value?.length > 60 ? '...' : ''}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-sm">
                    {log.result || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    {log.is_threat ? (
                      <span className="inline-flex items-center gap-1 text-red-400 text-xs font-semibold">
                        <HiOutlineExclamation className="w-3.5 h-3.5" /> Threat
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-400 text-xs font-semibold">
                        <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Safe
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs font-mono">
                    {log.ip_address || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {new Date(log.created_at).toLocaleString()}
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

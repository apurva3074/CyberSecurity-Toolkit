import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminOverview from './AdminOverview';
import AdminPanel from './AdminPanel';
import AdminUsers from './AdminUsers';
import AdminScanLogs from './AdminScanLogs';
import AdminCommunity from './AdminCommunity';

import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/api/takedown`;

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(`${API_URL}/list/`);
      const data = await res.json();
      setPendingCount(data.filter((r) => r.status === 'pending').length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <AdminOverview onNavigate={setCurrentPage} />;
      case 'takedowns':
        return <AdminPanel />;
      case 'users':
        return <AdminUsers />;
      case 'scan-logs':
        return <AdminScanLogs />;
      case 'community':
        return <AdminCommunity />;
      default:
        return <AdminOverview onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage} pendingCount={pendingCount}>
      {renderPage()}
    </AdminLayout>
  );
}

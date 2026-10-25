import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import PageTransition from '../components/PageTransition.jsx';

const userLinks = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/tours', label: 'Browse Tours' },
  { to: '/my-posts', label: 'My Stories' },
];

const adminLinks = [
  { to: '/admin-dashboard', label: 'Dashboard' },
  { to: '/admin-bookings', label: 'Bookings' },
  { to: '/admin-tours', label: 'Tours' },
  { to: '/admin-blog', label: 'Blog' },
  { to: '/admin-inquiries', label: 'Inquiries' },
  { to: '/admin-users', label: 'Users' },
  { to: '/admin-newsletter', label: 'Newsletter' },
];

export default function DashboardLayout({ role = 'user' }) {
  const links = role === 'admin' ? adminLinks : userLinks;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar
        links={links}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader role={role} onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard-content bg-yellow-300/40">
          <PageTransition />
        </main>
      </div>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';

const userLinks = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/tours', label: 'Browse Tours' },
];
const adminLinks = [
  { to: '/admin-dashboard', label: 'Dashboard' },
  { to: '/admin-bookings', label: 'Bookings' },
];

export default function DashboardLayout({role = 'user'})
{
const links = role === 'admin' ? adminLinks : userLinks

return (
    <div className="dashboard-shell">
        <Sidebar links={links} />
        <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader role={role} />
        <main className='dashboard-content'>
            <Outlet />
        </main>
    </div>
    </div>
)
}

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LogOut } from 'lucide-react';
export default function DashboardHeader({ role = 'user' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.fullName || user?.username || 'Traveler';

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-orange-500/90 px-4 py-3 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold text-white ">
          {role === 'admin' ? 'Admin panel' : 'My account'}
        </p>
        <p className="text-sm font-semibold text-slate-900 bg-slate-50/40 rounded p-1">
          {displayName}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-slate-50/40  text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <button onClick={handleLogout} className='flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700'><LogOut className='h-4 w-4' /><span className='hidden sm:inline'>Logout</span></button>
      </div>
    </header>
  );
}

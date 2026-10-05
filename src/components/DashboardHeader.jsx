import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Compass, Home, LogOut } from 'lucide-react';
export default function DashboardHeader({ role = 'user' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.fullName || user?.username || 'Traveller';

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
          <Compass className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
            {role === 'admin' ? 'Admin workspace' : 'Travel workspace'}
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">
            {displayName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-2 px-3 text-sm text-slate-500 lg:flex">
          <CalendarDays className="h-4 w-4 text-amber-700" />
          {new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }).format(new Date())}
        </span>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-amber-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}

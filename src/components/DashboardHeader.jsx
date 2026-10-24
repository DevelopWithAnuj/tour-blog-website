import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Compass, Home, LogOut, Menu } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export default function DashboardHeader({ role = 'user', onMenuClick }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const displayName = user?.fullName || user?.username || 'Traveler';

  const handleLogout = async () => {
    try {
      await logout();
      toast('Signed out successfully.', { type: 'success' });
    } catch (error) {
      toast(
        error.response?.data?.message ||
          'Unable to sign out. Please try again.',
        { type: 'error' }
      );
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900/95 px-4 py-3 text-white backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open dashboard navigation"
          className="rounded-lg border border-white/15 p-2 text-white/70 hover:bg-white/10 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
          <Compass className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
            {role === 'admin' ? 'Admin workspace' : 'Travel workspace'}
          </p>
          <p className="truncate text-sm font-semibold text-white">
            {displayName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-2 px-3 text-sm text-white/60 lg:flex">
          <CalendarDays className="h-4 w-4 text-amber-300" />
          {new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }).format(new Date())}
        </span>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/75 transition-colors hover:border-amber-300/60 hover:bg-white/5 hover:text-amber-200"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}

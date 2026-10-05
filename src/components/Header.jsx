import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  BookOpen,
  ChevronDown,
  Compass,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/tours', label: 'Tours', icon: Compass },
  { to: '/blog', label: 'Blog', icon: BookOpen },
];

const initialsOf = (user) =>
  (user.fullName || user.username || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

function Avatar({ user, size = 'h-8 w-8' }) {
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-slate-950`}
    >
      {initialsOf(user)}
    </span>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (to) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  const dashboardPath =
    user?.role === 'admin' ? '/admin-dashboard' : '/dashboard';

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
      navigate('/');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/10 bg-slate-950/85 py-3 backdrop-blur-xl'
          : 'border-transparent bg-transparent py-6'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-white"
        >
          Drimora
          <img
            src="/logo.png"
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg object-contain"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                  active ? 'text-white' : 'text-white/65 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span
                  className={`absolute inset-x-4 bottom-0.5 h-0.5 origin-left rounded-full bg-amber-400 transition-transform duration-300 ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop account area */}
        <div className="hidden items-center md:flex">
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-3 text-sm text-white outline-none transition hover:border-amber-400/60 focus-visible:border-amber-400 data-[state=open]:border-amber-400/60">
                  <Avatar user={user} />
                  <span className="max-w-32 truncate">
                    {user.fullName || user.username}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/50" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={10}
                  className="z-50 w-60 origin-top-right rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl data-[state=open]:animate-scale-in"
                >
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.fullName || user.username}
                    </p>
                    <p className="truncate text-xs text-white/50">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
                  <DropdownMenu.Item asChild>
                    <Link
                      to={dashboardPath}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 outline-none data-highlighted:bg-white/10 data-highlighted:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {user.role === 'admin' ? 'Admin panel' : 'My dashboard'}
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={handleLogout}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-300 outline-none data-highlighted:bg-rose-400/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile drawer */}
        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Trigger asChild>
            <button
              aria-label="Open menu"
              className="rounded-full p-2 text-white transition hover:bg-white/10 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
            <Dialog.Content
              aria-describedby={undefined}
              className="fixed inset-y-0 right-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-slate-950 p-6 shadow-2xl outline-none data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right"
            >
              <div className="flex items-center justify-between">
                <Dialog.Title className="font-display text-xl text-white">
                  Drimora
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    aria-label="Close menu"
                    className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              <nav className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map(({ to, label, icon: Icon }, i) => (
                  <Link
                    key={to}
                    to={to}
                    style={{ animationDelay: `${80 + i * 60}ms` }}
                    className={`animate-fade-up flex items-center gap-3 rounded-xl px-4 py-3 text-lg ${
                      isActive(to)
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'text-white/75 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto border-t border-white/10 pt-6">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      to={dashboardPath}
                      className="flex items-center gap-3 rounded-xl border border-white/15 px-4 py-3 text-white"
                    >
                      <Avatar user={user} size="h-9 w-9" />
                      <span className="min-w-0 flex-1 truncate">
                        {user.fullName || user.username}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 rounded-full bg-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 rounded-full bg-amber-500 py-3 text-sm font-semibold text-slate-950"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                )}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}

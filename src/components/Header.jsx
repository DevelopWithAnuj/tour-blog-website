import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X, User, LogIn, LayoutDashboard, Home } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tours', label: 'Tours' },
  { to: '/blog', label: 'Blog' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-white/10 py-3'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
        <Link
          to="/"
          className="font-display flex gap-1 text-2xl font-semibold tracking-tight text-white"
        >
          Drimora
          <img
            src="/logo.png"
            alt="Drimora_logo"
            className="h-10 w-10 shrink-0 rounded-lg object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative font-sans text-sm text-white/80 transition-colors hover:text-white"
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-400" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:border-amber-400/60 hover:text-amber-300"
          >
            <User className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/login"
            className="rounded-full bg-amber-500 px-5 py-2 flex gap-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
          >
            <LogIn className="h-4.5 w-4.5" />
            Login
          </Link>
        </div>

        {/* Mobile trigger */}
        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Trigger asChild>
            <button
              aria-label="Open menu"
              className="rounded-md p-2 text-white md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
            <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex h-full w-72 flex-col gap-6 bg-slate-950 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <Dialog.Title className="font-display text-xl text-white">
                  Drimora
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    aria-label="Close menu"
                    className="rounded-md p-1 text-white/70 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-lg px-3 py-2.5 text-sm ${
                      isActive(link.to)
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/dashboard"
                  className="rounded-lg flex gap-2 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5"
                >
                  <LayoutDashboard className="h-4.5 w-4.5" />
                  Dashboard
                </Link>
              </nav>

              <Link
                to="/login"
                className="mt-auto flex gap-4 items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-center text-sm font-semibold text-slate-950"
              >
                <LogIn className="h-4.5 w-4.5" />
                Login
              </Link>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}

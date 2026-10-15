import { Link, Outlet } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5 sm:px-8">
        <Link
          to="/"
          className="font-display text-xl font-semibold tracking-tight text-white flex items-center gap-2"
        >
          Drimora
          <img
            src="/logo.png"
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg object-contain"
          />
        </Link>
        <Link
          to="/"
          className="text-sm text-white/60 transition hover:text-white"
        >
          Back to site
        </Link>
      </header>

      <main className="flex flex-1 flex-col">
        <PageTransition />
      </main>

      <footer className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-white/10 px-5 py-3 text-xs text-white/45 sm:px-8">
        <span>© {new Date().getFullYear()} Drimora</span>
        <nav aria-label="Legal" className="flex gap-4">
          <Link to="/privacy" className="transition hover:text-white">
            Privacy
          </Link>
          <Link to="/terms" className="transition hover:text-white">
            Terms
          </Link>
        </nav>
      </footer>
    </div>
  );
}

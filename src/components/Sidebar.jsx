import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Compass,
  Home,
  LayoutDashboard,
  Users,
} from 'lucide-react';

// Maps a route path to an icon. Extend this as you add more sidebar links.
const ICONS = {
  '/dashboard': LayoutDashboard,
  '/tours': Compass,
  '/admin-dashboard': LayoutDashboard,
  '/admin-bookings': ClipboardList,
  '/admin-users': Users,
};

const STORAGE_KEY = 'drimora-sidebar-collapsed';

function readInitialCollapsed() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === '1';
  } catch {
    // storage unavailable: fall through to the screen-size default
  }
  return window.matchMedia('(max-width: 1023px)').matches;
}

function Tooltip({ show, children }) {
  if (!show) return null;
  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
      {children}
    </span>
  );
}

function SidebarLink({ to, label, icon: Icon, active, collapsed }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-amber-300/70 ${
        collapsed ? 'justify-center' : ''
      } ${
        active
          ? 'bg-amber-300 text-amber-950 shadow-sm'
          : 'text-amber-50/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span
        className={`absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-amber-300 transition-opacity duration-300 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="animate-fade-in">{label}</span>}
      <Tooltip show={collapsed}>{label}</Tooltip>
    </Link>
  );
}

export default function Sidebar({ links }) {
  const [collapsed, setCollapsed] = useState(readInitialCollapsed);
  const { pathname } = useLocation();

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ignore storage errors
    }
  };

  return (
    <aside
      className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-amber-900 bg-amber-950 transition-[width] duration-300 ease-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div
        className={`flex h-20 items-center px-6 ${
          collapsed ? 'justify-center px-0' : ''
        }`}
      >
        <Link
          to="/"
          aria-label="Drimora home"
          className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-white"
        >
          <Compass className="h-6 w-6 shrink-0 text-amber-300" />
          {!collapsed && <span>Drimora</span>}
        </Link>
      </div>

      <nav
        aria-label="Dashboard"
        className="flex flex-1 flex-col gap-1 px-3 pt-2"
      >
        {links.map((link) => (
          <SidebarLink
            key={link.to}
            to={link.to}
            label={link.label}
            icon={ICONS[link.to] || Compass}
            active={pathname === link.to || pathname.startsWith(`${link.to}/`)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <SidebarLink
          to="/"
          label="Back to site"
          icon={Home}
          active={false}
          collapsed={collapsed}
        />
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-50/60 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-300/70 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5 shrink-0" />
          ) : (
            <ChevronsLeft className="h-5 w-5 shrink-0" />
          )}
          {!collapsed && <span className="animate-fade-in">Collapse</span>}
          <Tooltip show={collapsed}>Expand</Tooltip>
        </button>
      </div>
    </aside>
  );
}

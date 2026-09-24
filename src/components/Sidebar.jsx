import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  ClipboardList,
  Users,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

// Maps a route path to an icon. Extend this as you add more sidebar links.
const ICONS = {
  '/dashboard': LayoutDashboard,
  '/tours': Compass,
  '/admin-dashboard': LayoutDashboard,
  '/admin-bookings': ClipboardList,
  '/admin-users': Users,
};

export default function Sidebar({ links }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-6">
        {!collapsed && (
          <span className="font-display text-lg font-semibold text-slate-900">
            Drimora
          </span>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((link) => {
          const Icon = ICONS[link.to] || Compass;
          const active = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

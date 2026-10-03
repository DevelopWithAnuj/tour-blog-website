import { Outlet, useLocation } from 'react-router-dom';

export default function PageTransition() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="animate-page-in">
      <Outlet />
    </div>
  );
}

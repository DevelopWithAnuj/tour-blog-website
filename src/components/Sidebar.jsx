import { Link } from 'react-router-dom';

export default function Sidebar({ links }) {
  return (
    <aside className="sidebar">
      <nav>
        {links.map((link) => {
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>;
        })}
      </nav>
    </aside>
  );
}

import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="page-header">
      <Link to="/public/logo.webp">Drimora</Link>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/tours">Tours</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/login">Login</Link>
      </nav>
    </header>
  );
}

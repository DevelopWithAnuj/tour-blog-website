import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/tours', label: 'Tours' },
  { to: '/blog', label: 'Blog' },
  { to: '/login', label: 'Login' },
  { to: '/dashboard', label: 'Dashboard' },
];

const socialLinks = [
  { href: 'https://facebook.com', label: 'Facebook', icon: FaFacebook },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: FaLinkedin },
  { href: 'https://twitter.com', label: 'Twitter', icon: FaTwitter },
  { href: 'https://instagram.com', label: 'Instagram', icon: FaInstagram },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#1a1a1a] pt-10 pb-6 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1.4fr]">
          <div>
            <h2 className="mb-3 text-2xl font-bold text-amber-600">Drimora Travel</h2>
            <p className="max-w-md text-gray-400">
              Explore amazing destinations, discover unforgettable experiences, and
              find your perfect tour.
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-xl text-white transition-transform duration-300 hover:-translate-y-0.5 hover:border-amber-400/60 hover:text-amber-400"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display text-lg font-semibold text-amber-300">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-gray-300">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-display text-lg font-semibold text-amber-300">
              Newsletter
            </h3>
            <p className="mb-4 text-gray-300">
              Subscribe to our newsletter for the latest travel inspiration and updates.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2.5">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="flex-1 rounded-sm border border-white/10 bg-white/5 p-2.5 text-white outline-none placeholder:text-gray-400 focus:border-amber-400"
              />
              <button
                type="submit"
                className="rounded bg-amber-700 px-3.5 py-2.5 font-medium text-white transition-colors duration-300 hover:bg-amber-600"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-500/40 pt-5 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Drimora Travel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

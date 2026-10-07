import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Home,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { motion } from 'motion/react';

const LINK_GROUPS = [
  {
    title: 'Explore',
    links: [
      { to: '/', label: 'Home', icon: Home },
      { to: '/tours', label: 'Tours', icon: Compass },
      { to: '/blog', label: 'Travel blog', icon: BookOpen },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Sign in', icon: LogIn },
      { to: '/register', label: 'Create account', icon: UserPlus },
      { to: '/dashboard', label: 'My trips', icon: LayoutDashboard },
    ],
  },
];

const SOCIALS = [
  { href: 'https://facebook.com', label: 'Facebook', icon: FaFacebook },
  { href: 'https://instagram.com', label: 'Instagram', icon: FaInstagram },
  { href: 'https://twitter.com', label: 'Twitter', icon: FaTwitter },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: FaLinkedin },
];

const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const footerItemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: send to your newsletter endpoint
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <motion.div
          className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div variants={footerItemVariants}>
            <p className="font-display text-3xl text-amber-400">Drimora</p>
            <p className="mt-4 max-w-xs text-white/55">
              Hand-built tours with the stays, guides and transfers already
              sorted.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  whileHover={{ y: -4, rotate: -5, scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-amber-400/60 hover:text-amber-300"
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {LINK_GROUPS.map((group) => (
            <motion.nav
              variants={footerItemVariants}
              key={group.title}
              aria-label={group.title}
            >
              <h3 className="text-sm font-semibold text-white">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 text-white/55 transition hover:text-amber-300"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ))}

          <motion.div variants={footerItemVariants}>
            <h3 className="text-sm font-semibold text-white">
              Trip ideas in your inbox
            </h3>
            <p className="mt-4 text-white/55">
              One short email a month. Unsubscribe any time.
            </p>

            {subscribed ? (
              <p className="mt-5 flex animate-scale-in items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                <Check className="h-4 w-4" />
                You are on the list.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-5 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5 pl-4 focus-within:border-amber-400"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  Join
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-white/40 sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Drimora Travel. All rights
            reserved.
          </p>
          <p>Made for people who would rather be somewhere else.</p>
        </div>
      </div>
    </footer>
  );
}

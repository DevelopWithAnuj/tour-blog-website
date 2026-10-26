import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Headset,
  Check,
  Compass,
  Home,
  LayoutDashboard,
  LogIn,
  UserPlus,
  Info,
  LifeBuoy,
  Mail,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';

const LINK_GROUPS = [
  {
    title: 'Explore',
    links: [
      { to: '/', label: 'Home', icon: Home },
      { to: '/tours', label: 'Tours', icon: Compass },
      { to: '/locations', label: 'Locations', icon: MapPin },
      { to: '/blog', label: 'Travel blog', icon: BookOpen },
      { to: '/about', label: 'About', icon: Info },
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
  {
    title: 'Support',
    links: [
      { to: '/help', label: 'Help centre', icon: LifeBuoy },
      { to: '/contact', label: 'Contact us', icon: Mail },
      { to: '/contact-support', label: 'Contact support', icon: Headset },
    ],
  },
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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      await axios.post('/api/v1/newsletter', { email: email.trim() });
      setSubscribed(true);
      setError('');
    } catch (err) {
      const first = err.response?.data?.errors?.[0];
      setError(
        (first && Object.values(first)[0]) ||
          err.response?.data?.message ||
          'Could not subscribe. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <motion.div
          className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr]"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div variants={footerItemVariants}>
            <p className="font-display text-3xl text-amber-400">Drimora</p>
            <p className="mt-4 max-w-xs text-white/60">
              Hand-built tours with the stays, guides and transfers already
              sorted.
            </p>
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
                      className="flex items-center gap-2 text-white/60 transition hover:text-amber-300"
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
            <p className="mt-4 text-white/60">
              One short email a month. Unsubscribe any time with the link in
              every email.
            </p>

            {subscribed ? (
              <p className="mt-5 flex animate-scale-in items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                <Check className="h-4 w-4" />
                You are on the list.
              </p>
            ) : (
              <>
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
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                  >
                    {sending ? 'Joining…' : 'Join'}
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </form>
                {error && (
                  <p role="alert" className="mt-2 text-sm text-rose-300">
                    {error}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </motion.div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Drimora Travel. All rights
            reserved.
          </p>
          <nav aria-label="Legal" className="flex gap-5">
            <Link to="/privacy" className="transition hover:text-amber-300">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-amber-300">
              Terms
            </Link>
          </nav>
          <p>Made for people who would rather be somewhere else.</p>
        </div>
      </div>
    </footer>
  );
}

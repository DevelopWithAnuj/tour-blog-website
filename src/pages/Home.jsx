import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useReducedMotion,
} from 'motion/react';
import requestLogger from '../utils/requestLogger.js';
import Reveal from '../components/Reveal.jsx';
import {
  ArrowRight,
  Compass,
  Headset,
  Search,
  ShieldCheck,
} from 'lucide-react';

const delay = (ms) => ({ animationDelay: `${ms}ms` });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: 'easeOut' },
  },
};

const PROMISES = [
  {
    icon: Compass,
    title: 'Routes we have walked',
    text: 'Every itinerary is planned by guides who know the place, not copied from a brochure.',
  },
  {
    icon: ShieldCheck,
    title: 'Clear prices',
    text: 'What is included and what is not is listed on every tour, before you book.',
  },
  {
    icon: Headset,
    title: 'Someone to call',
    text: 'If a flight moves or plans change, a real person helps you rebook.',
  },
];

function TourCard({ tour, index, featured }) {
  const id = tour._id || tour.id;

  return (
    <Link
      to={`/tours/${id}`}
      style={delay(index * 90)}
      className={`group relative block animate-fade-up overflow-hidden rounded-3xl bg-slate-900 focus-visible:outline-amber-400 ${
        featured ? 'lg:col-span-2 lg:row-span-2' : ''
      }`}
    >
      <div
        className={`w-full overflow-hidden ${featured ? 'h-80 lg:h-full lg:min-h-130' : 'h-72'}`}
      >
        {tour.image ? (
          <img
            src={tour.image}
            alt={tour.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-slate-800"></div>
        )}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-slate-950/50 via-slate-950/29 to-transparent" />

      <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition duration-300 group-hover:bg-amber-400 group-hover:text-slate-950">
        <ArrowRight className="h-5 w-5 transition duration-300 group-hover:rotate-12" />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-sm capitalize text-amber-300">
          {tour.category} in {tour.destination}
        </p>
        <h3
          className={`mt-1 font-display text-white ${
            featured ? 'text-3xl sm:text-4xl' : 'text-2xl'
          }`}
        >
          {tour.title}
        </h3>
        <div className="mt-3 flex items-center justify-between text-sm text-white/70">
          <span>{tour.duration}</span>
          <span className="text-lg font-semibold text-white">
            ₹{Number(tour.price).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </Link>
  );
}

function TourSkeletons() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="h-96 animate-shimmer rounded-3xl bg-[linear-gradient(90deg,#0f172a_25%,#1e293b_50%,#0f172a_75%)] bg-size-[200%_100%] lg:col-span-2 lg:row-span-2" />
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="h-72 animate-shimmer rounded-3xl bg-[linear-gradient(90deg,#0f172a_25%,#1e293b_50%,#0f172a_75%)] bg-size-[200%_100%]"
        />
      ))}
    </div>
  );
}

function HomePage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['0%', '18']
  );

  useEffect(() => {
    const startTime = Date.now();
    const url = '/api/v1/tours';
    const controller = new AbortController();

    axios
      .get(url, { params: { limit: 5 }, signal: controller.signal })
      .then((res) => {
        requestLogger.logFetch(url, startTime);
        setTours(res.data.data?.tours || []);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        requestLogger.logFetch(url, startTime);
        console.log(err);
        setError(
          'We could not load tours. Check your connection and try again.'
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    axios
      .get('/api/v1/tours/categories', { signal: controller.signal })
      .then((res) => setCategories(res.data.data?.categories || []))
      .catch(() => {});

    return () => controller.abort();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/tours?q=${encodeURIComponent(q)}` : '/tours');
  };

  return (
    <div className="bg-slate-950 text-white">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative -mt-22 flex min-h-[88vh] items-end overflow-hidden pt-22"
      >
        <motion.img
          src="/img/login-hero.png"
          alt=""
          style={{ y: imageY }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/50 to-slate-950/30" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 md:px-8 md:pb-24">
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <motion.span variants={itemVariants} className="block">
              Pack light.
            </motion.span>
            <motion.span variants={itemVariants} className="block">
              Go somewhere that changes how you see home.
            </motion.span>
          </motion.h1>
          <motion.p
            style={delay(150)}
            className="mt-6 max-w-xl animate-fade-up text-lg text-white/75"
          >
            Hand-built tours across fjords, old cities and coastlines, with
            guides, stays and transfers already sorted.
          </motion.p>
          <form
            onSubmit={handleSearch}
            style={delay(300)}
            className="mt-10 flex w-full max-w-xl animate-fade-up items-center gap-2 rounded-full border border-white/20 bg-white/10 pl-5 backdrop-blur-md focus-within:border-amber-400"
          >
            <Search className="h-5 w-5 shrink-0 text-white/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Where do you want to go?"
              aria-label="Search destination"
              className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/50"
            />
            <button
              type="submit"
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
            >
              Find tours
            </button>
          </form>

          {categories.length > 0 && (
            <div
              style={delay(450)}
              className="mt-6 flex animate-fade-up flex-wrap gap-2"
            >
              {categories.map((c) => (
                <Link
                  key={c.name}
                  to={`/tours?category=${c.name}`}
                  className="rounded-full border border-white/20 px-4 py-1.5 text-sm capitalize text-white/80 transition hover:border-amber-400/70 hover:text-amber-300"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Tours */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">
              Trips people are booking now
            </h2>
            <p className="mt-2 text-white/60">
              Start with these, or browse the full list.
            </p>
          </div>
          <Link
            to="/tours"
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium transition hover:border-amber-400/70 hover:text-amber-300"
          >
            See all tours
          </Link>
        </motion.div>

        {/* Loading */}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TourSkeletons />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              {/* Existing tour results */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-6 text-rose-300">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && tours.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
            <p className="text-lg font-semibold">No tours are open yet</p>

            <p className="mt-1 text-white/60">
              New trips are added often. Check back soon.
            </p>
          </div>
        )}

        {/* Tour cards */}
        {!loading && !error && tours.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tours.map((tour, i) => (
              <TourCard
                key={tour._id || tour.id}
                tour={tour}
                index={i}
                featured={i === 0}
              />
            ))}
          </div>
        )}
      </section>

      {/* Promises */}
      <section className="border-y border-white/10 bg-slate-900/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3 md:px-8">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-xl">{title}</h3>
                <p className="mt-2 max-w-sm text-white/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center md:px-8">
        <h2 className="mx-auto max-w-2xl font-display text-4xl sm:text-5xl">
          Pick a place. We will handle the rest.
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/tours"
            className="rounded-full bg-amber-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
          >
            Browse tours
          </Link>
          <Link
            to="/blog"
            className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium transition hover:border-amber-400/70 hover:text-amber-300"
          >
            Read travel stories
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

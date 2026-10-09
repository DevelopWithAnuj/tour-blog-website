import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ArrowRight, Search, X } from 'lucide-react';
import mountainCover from '../../assets/mountain.avif';

export const categoryLabel = (name) =>
  String(name ?? '')
    .trim()
    .replace(/-/g, ' ') || 'General';

const destinationCovers = {
  norway: '/img/tours/Norway/images%206.jfif',
  japan: '/img/tours/Japan/thland-bg.avif',
  turkey: '/img/tours/Japan/turkey.jpg',
  italy: '/img/tours/Japan/rome.jpg',
  bali: mountainCover,
};

export const postCoverImage = (post) => {
  const coverImage = post?.coverImage?.trim();
  if (coverImage && !coverImage.endsWith('/login-hero.png')) return coverImage;

  return destinationCovers[post?.destination?.trim().toLowerCase()] || mountainCover;
};

export const formatPostDate = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const shimmer =
  'animate-shimmer bg-[linear-gradient(90deg,#0f172a_25%,#1e293b_50%,#0f172a_75%)] bg-size-[200%_100%]';

const EASE = [0.22, 1, 0.36, 1];

const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

export function PostCard({ post, index = 0, standalone = false }) {
  const standaloneProps = standalone
    ? {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, amount: 0.2 },
        transition: { delay: index * 0.08 },
      }
    : {};

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      whileTap={{ scale: 0.985 }}
      className="h-full"
      {...standaloneProps}
    >
      <motion.div
        variants={{ hover: { y: -6 } }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="h-full"
      >
        <Link
          to={`/blog/${post.slug}`}
          className="group block h-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900 transition-colors duration-300 hover:border-amber-400/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
        >
          <div className="relative h-52 overflow-hidden bg-slate-800">
            <motion.img
              src={postCoverImage(post)}
              alt=""
              loading="lazy"
              variants={{ hover: { scale: 1.07 } }}
              transition={{ duration: 0.7, ease: EASE }}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-medium capitalize text-amber-300 backdrop-blur-md">
              {categoryLabel(post.category)}
            </span>
            <motion.span
              variants={{
                hover: { opacity: 1, scale: 1, rotate: 0 },
              }}
              initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-slate-950"
            >
              <ArrowRight className="h-4 w-4" />
            </motion.span>
          </div>
          <div className="p-5">
            <h3 className="font-display text-xl text-white">{post.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-white/60">
              {post.excerpt}
            </p>
            <p className="mt-4 text-xs text-white/45">
              {post.author?.fullName || post.author?.username || 'Drimora'} ·{' '}
              {formatPostDate(post.publishedAt)}
            </p>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <motion.button
      variants={fadeUp}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative rounded-full border px-4 py-2 text-sm capitalize transition-colors ${
        active
          ? 'border-transparent font-semibold text-slate-950'
          : 'border-white/15 text-white/75 hover:border-amber-400/60 hover:text-amber-300'
      }`}
    >
      {active && (
        <motion.span
          layoutId="blog-active-chip"
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="absolute inset-0 rounded-full bg-amber-500"
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

function PageButton({ children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      className="rounded-full border border-white/15 px-5 py-2.5 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40"
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default function BlogPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const query = params.get('q') || '';
  const page = Math.max(Number(params.get('page')) || 1, 1);

  const [search, setSearch] = useState(query);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => setSearch(query), [query]);

  useEffect(() => {
    axios
      .get('/api/v1/blogs/categories')
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    axios
      .get('/api/v1/blogs', {
        params: { category: category || undefined, q: query || undefined, page },
        signal: controller.signal,
      })
      .then((res) => {
        setPosts(res.data.data.posts);
        setTotalPages(res.data.data.pages || 1);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setError('We could not load stories. Try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [category, query, page]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...patch }).forEach(([k, v]) => {
      if (v && v !== '1') next.set(k, v);
      else next.delete(k);
    });
    setParams(next);
  };

  const resultsKey = `${category}|${query}|${page}`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-8">
        <motion.header
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl sm:text-5xl"
          >
            Travel stories
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 max-w-xl text-white/60">
            Guides, itineraries and honest trip notes from the road.
          </motion.p>
        </motion.header>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25, ease: EASE }}
          whileFocus={{ scale: 1.01 }}
          onSubmit={(e) => {
            e.preventDefault();
            update({ category, q: search.trim() });
          }}
          className="mt-10 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5 pl-5 transition-colors focus-within:border-amber-400"
        >
          <Search className="h-5 w-5 shrink-0 text-white/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories or destinations"
            aria-label="Search stories"
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                key="clear"
                type="button"
                aria-label="Clear search"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                whileHover={{ rotate: 90 }}
                onClick={() => update({ category, q: '' })}
                className="rounded-full p-2 text-white/50 hover:text-white"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
          >
            Search
          </motion.button>
        </motion.form>

        <motion.div
          // Re-run the stagger once the categories arrive from the API.
          key={categories.length ? 'ready' : 'empty'}
          variants={staggerContainer(0.05, 0.35)}
          initial="hidden"
          animate="visible"
          className="mt-5 flex flex-wrap gap-2"
        >
          <Chip active={!category} onClick={() => update({ q: query })}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.name}
              active={category === c.name}
              onClick={() => update({ category: c.name, q: query })}
            >
              {categoryLabel(c.name)}
              <span className="ml-1.5 opacity-60">{c.count}</span>
            </Chip>
          ))}
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[1, 2, 3].map((n) => (
                <div key={n} className={`h-96 rounded-3xl ${shimmer}`} />
              ))}
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              role="alert"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: [0, -8, 8, -4, 4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-8 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-6 text-rose-300"
            >
              {error}
            </motion.div>
          )}

          {!loading && !error && posts.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-8 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center"
            >
              <p className="font-display text-2xl">No stories found</p>
              <p className="mt-2 text-white/60">
                Try another category or search.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setParams({})}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
              >
                Show all stories <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          )}

          {!loading && !error && posts.length > 0 && (
            <motion.div
              key={resultsKey}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                variants={staggerContainer(0.09)}
                initial="hidden"
                animate="visible"
                className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </motion.div>

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="mt-12 flex items-center justify-center gap-4 text-sm"
                >
                  <PageButton
                    disabled={page === 1}
                    onClick={() => {
                      update({ page: String(page - 1) });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Previous
                  </PageButton>
                  <span className="text-white/55">
                    Page {page} of {totalPages}
                  </span>
                  <PageButton
                    disabled={page === totalPages}
                    onClick={() => {
                      update({ page: String(page + 1) });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Next
                  </PageButton>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  ListFilter,
  MapPin,
  Search,
  SearchX,
  X,
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

const shimmer =
  'animate-shimmer bg-[linear-gradient(90deg,#0f172a_25%,#1e293b_50%,#0f172a_75%)] bg-size-[200%_100%]';

function TourCard({ tour, index }) {
  return (
    <Link
      to={`/tours/${tour._id}`}
      style={{ animationDelay: `${index * 60}ms` }}
      className="group animate-fade-up overflow-hidden rounded-3xl border border-white/10 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
    >
      <div className="relative h-56 overflow-hidden bg-slate-800">
        {tour.image && (
          <img
            src={tour.image}
            alt={tour.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-medium capitalize text-amber-300 backdrop-blur-md">
          {tour.category}
        </span>
        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl text-white">{tour.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/55">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>
            {tour.destination ? `${tour.destination}, ${tour.location}` : tour.location}
          </span>
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <Clock className="h-4 w-4" />
            {tour.duration}
          </span>
          <span className="text-lg font-semibold text-amber-400">
            ₹{Number(tour.price).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  const base =
    'h-10 min-w-10 rounded-full px-3 text-sm font-medium transition active:scale-[0.97]';

  return (
    <nav
      aria-label="Tour pagination"
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${base} inline-flex items-center gap-1.5 border border-white/15 text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-white/40">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${base} ${
              p === page
                ? 'bg-amber-500 text-slate-950'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={`${base} inline-flex items-center gap-1.5 border border-white/15 text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

export default function TourListingPage() {
  const [params, setParams] = useSearchParams();

  // The URL is the single source of truth for filters.
  const category = params.get('category') || '';
  const query = params.get('q') || '';
  const sort = params.get('sort') || 'newest';
  const page = Math.max(Number(params.get('page')) || 1, 1);

  const [search, setSearch] = useState(query);
  const [categories, setCategories] = useState([]);
  const [tours, setTours] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => setSearch(query), [query]);

  useEffect(() => {
    axios
      .get('/api/v1/tours/categories')
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    axios
      .get('/api/v1/tours', {
        params: {
          category: category || undefined,
          q: query || undefined,
          sort,
          page,
        },
        signal: controller.signal,
      })
      .then((res) => {
        const { tours, total, pages } = res.data.data;
        setTours(tours);
        setTotal(total ?? tours.length);
        setTotalPages(pages || 1);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError('We could not load tours. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [category, query, sort, page]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...patch }).forEach(([key, value]) => {
      if (value && value !== 'newest' && value !== '1') next.set(key, value);
      else next.delete(key);
    });
    setParams(next);
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    update({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasFilters = Boolean(category || query);

  const chip = (active) =>
    `rounded-full border px-4 py-2 text-sm capitalize transition active:scale-[0.97] ${
      active
        ? 'border-amber-500 bg-amber-500 font-semibold text-slate-950'
        : 'border-white/15 text-white/75 hover:border-amber-400/60 hover:text-amber-300'
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-8">
      <header className="animate-fade-up">
        <h1 className="font-display text-4xl sm:text-5xl">Find your next trip</h1>
        <p className="mt-3 max-w-xl text-white/60">
          Filter by style, search by place, and sort by price. Every tour lists
          what is included.
        </p>
      </header>

      {/* Search + sort */}
      <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ category, sort, q: search.trim() });
          }}
          className="flex flex-1 items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5 pl-5 focus-within:border-amber-400"
        >
          <Search className="h-5 w-5 shrink-0 text-white/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by destination or tour name"
            aria-label="Search tours"
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => update({ category, sort, q: '' })}
              className="rounded-full p-2 text-white/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
          >
            Search
          </button>
        </form>

        <div className="relative">
          <ListFilter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <select
            value={sort}
            onChange={(e) => update({ category, q: query, sort: e.target.value })}
            aria-label="Sort tours"
            className="rounded-full border border-white/15 bg-slate-900 py-3 pl-10 pr-5 text-sm text-white outline-none focus:border-amber-400"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className={chip(!category)}
          onClick={() => update({ q: query, sort })}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            className={chip(category === c.name)}
            onClick={() => update({ category: c.name, q: query, sort })}
          >
            {c.name}
            <span className="ml-1.5 opacity-60">{c.count}</span>
          </button>
        ))}
      </div>

      {/* Result summary */}
      <div className="mt-8 flex min-h-6 items-center justify-between text-sm text-white/55">
        <p aria-live="polite">
          {loading
            ? 'Loading tours…'
            : error
              ? ''
              : `${total} ${total === 1 ? 'tour' : 'tours'}${query ? ` for “${query}”` : ''}`}
        </p>
        {hasFilters && (
          <button
            onClick={() => setParams({})}
            className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading && (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className={`h-96 rounded-3xl ${shimmer}`} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-6 text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && tours.length === 0 && (
        <div className="mt-4 flex animate-scale-in flex-col items-center rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <SearchX className="h-7 w-7" />
          </span>
          <p className="mt-5 font-display text-2xl">No tours match these filters</p>
          <p className="mt-2 max-w-sm text-white/60">
            Try a different spelling, pick another category, or start over.
          </p>
          <button
            onClick={() => setParams({})}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
          >
            Show all tours
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {!loading && !error && tours.length > 0 && (
        <>
          {/* key replays the entrance whenever the result set changes */}
          <div
            key={`${category}|${query}|${sort}|${page}`}
            className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {tours.map((tour, i) => (
              <TourCard key={tour._id} tour={tour} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          )}
        </>
      )}
    </div>
  );
}

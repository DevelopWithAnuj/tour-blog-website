import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];
function TourListingPage() {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('/api/v1/tours/categories')
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [category, query, sort]);

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
        setTours(res.data.data.tours);
        setTotalPages(res.data.data.pages || 1);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setError('Unable to load tours.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [category, query, sort, page]);

  const chip = (active) =>
    `rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
      active
        ? 'bg-slate-900 text-white'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }`;

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = () => {
    const pages = [];
    const windowSize = 1;
    for (let p = 1; p <= totalPages; p++) {
      const isEdge = p === 1 || p === totalPages;
      const isNearCurrent = Math.abs(p - page) <= windowSize;
      if (isEdge || isNearCurrent) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…');
      }
    }
    return pages;
  };

  return (
    <section className="tour-listing-page text-slate-900">
      <h1 className="text-3xl font-bold">Our Tours</h1>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
          }}
          className="flex gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destination…"
            className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">
            Search
          </button>
        </form>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className={chip(!category)} onClick={() => setCategory('')}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            className={chip(category === c.name)}
            onClick={() => setCategory(c.name)}
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      {loading && <p className="mt-8 text-slate-500">Loading tours…</p>}
      {error && <p className="mt-8 text-red-600">{error}</p>}
      {!loading && !error && tours.length === 0 && (
        <p className="mt-8 text-slate-500">No tours match your filters.</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <Link
            key={tour._id}
            to={`/tours/${tour._id}`}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="h-44 bg-slate-200">
              {tour.image && (
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                {tour.category}
              </span>
              <h3 className="mt-1 text-lg font-bold">{tour.title}</h3>
              <p className="text-sm text-slate-500">{tour.location}</p>
              <p className="mt-3 flex justify-between text-sm">
                <span className="font-bold text-amber-600">
                  ₹{Number(tour.price).toLocaleString('en-IN')}
                </span>
                <span className="text-slate-500">{tour.duration}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>

      {!loading && !error && totalPages > 1 && (
        <nav
          aria-label="Tour listing pagination"
          className="mt-10 flex items-center justify-center gap-1.5"
        >
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          {pageNumbers().map((p, i) =>
            p === '…' ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-sm text-slate-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goToPage(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                  p === page
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}

export default TourListingPage;

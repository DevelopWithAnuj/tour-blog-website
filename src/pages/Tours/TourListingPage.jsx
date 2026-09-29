import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

export default function TourListingPage() {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        },
        signal: controller.signal,
      })
      .then((res) => setTours(res.data.data.tours))
      .catch((err) => {
        if (!axios.isCancel(err)) setError('Unable to load tours.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [category, query, sort]);

  const chip = (active) =>
    `rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
      active
        ? 'bg-slate-900 text-white'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }`;

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
    </section>
  );
}

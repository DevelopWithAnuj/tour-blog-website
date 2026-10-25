import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Search,
  SearchX,
} from 'lucide-react';
import { PageHero } from '../../components/InfoParts.jsx';
import { formatPrice } from '../../components/BookingParts.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const shimmer =
  'animate-shimmer bg-[linear-gradient(90deg,#0f172a_25%,#1e293b_50%,#0f172a_75%)] bg-size-[200%_100%]';

function LocationCard({ d, index, saved, saving, onToggle, canSave }) {
  return (
    <article
      style={{ animationDelay: `${index * 60}ms` }}
      className="group animate-fade-up overflow-hidden rounded-3xl border border-white/10 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40"
    >
      <Link
        to={`/tours?q=${encodeURIComponent(d.name)}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
      >
        <div className="relative h-56 overflow-hidden bg-slate-800">
          {d.image && (
            <img
              src={d.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 to-transparent" />
          <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="font-display text-2xl text-white">{d.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
              <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
              {d.location}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between p-5 text-sm">
          <span className="text-white/60">
            {d.count} {d.count === 1 ? 'tour' : 'tours'}
          </span>
          <span className="text-white/60">
            from{' '}
            <span className="text-lg font-semibold text-amber-400">
              {formatPrice(d.fromPrice)}
            </span>
          </span>
        </div>
      </Link>
      <div className="px-5 pb-5">
        {canSave ? (
          <button
            type="button"
            disabled={saving}
            aria-pressed={saved}
            onClick={() => onToggle(d.name, saved)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 px-3 text-sm font-semibold text-white transition hover:border-amber-400 hover:text-amber-300 disabled:cursor-wait disabled:opacity-60"
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {saved ? 'Saved' : 'Save destination'}
          </button>
        ) : (
          <Link
            to="/login"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 px-3 text-sm font-semibold text-white transition hover:border-amber-400 hover:text-amber-300"
          >
            <Bookmark className="h-4 w-4" />
            Sign in to save
          </Link>
        )}
      </div>
    </article>
  );
}

export default function LocationsPage() {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [savedDestinations, setSavedDestinations] = useState(
    user?.savedDestinations || []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [savingName, setSavingName] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    setSavedDestinations(user?.savedDestinations || []);
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get('/api/v1/tours/destinations', { signal: controller.signal })
      .then((res) => setDestinations(res.data.data.destinations))
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError(
            'We could not load destinations. Check your connection and try again.'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations.filter(
      (d) =>
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
    );
  }, [destinations, query]);

  const toggleSavedDestination = async (name, saved) => {
    if (savingName) return;
    setSavingName(name);
    setActionError('');
    try {
      const response = saved
        ? await axios.delete('/api/v1/auth/saved-destinations', {
            data: { destination: name },
          })
        : await axios.post('/api/v1/auth/saved-destinations', {
            destination: name,
          });
      setSavedDestinations(response.data.data.savedDestinations);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          'Unable to update saved destinations. Please try again.'
      );
    } finally {
      setSavingName('');
    }
  };

  return (
    <>
      <PageHero eyebrow="Locations" title="Where we take you.">
        Every destination with tours open for booking. Pick one to see its
        trips.
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-8">
        <label className="flex max-w-xl animate-fade-up items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 focus-within:border-amber-400">
          <Search className="h-5 w-5 shrink-0 text-white/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter destinations"
            aria-label="Filter destinations"
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
          />
        </label>

        {actionError && (
          <p role="alert" className="mt-4 text-sm text-rose-300">
            {actionError}
          </p>
        )}

        {loading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-80 rounded-3xl ${shimmer}`} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-6 text-rose-300"
          >
            {error}
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="mt-8 flex animate-scale-in flex-col items-center rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
              <SearchX className="h-7 w-7" />
            </span>
            <p className="mt-5 font-display text-2xl">
              {destinations.length === 0 ? 'No destinations yet' : 'No match'}
            </p>
            <p className="mt-2 max-w-sm text-white/60">
              {destinations.length === 0
                ? 'New trips are added often. Check back soon.'
                : 'Try a different spelling.'}
            </p>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((d, i) => {
              const saved = savedDestinations.includes(d.name);
              return (
                <LocationCard
                  key={d.name}
                  d={d}
                  index={i}
                  saved={saved}
                  saving={savingName === d.name}
                  onToggle={toggleSavedDestination}
                  canSave={Boolean(user)}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

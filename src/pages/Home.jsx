import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import requestLogger from '../utils/requestLogger.js';

function HomePage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const startTime = Date.now();
    const url = '/api/v1/tours';

    axios
      .get(url)
      .then((res) => {
        requestLogger.logFetch(url, startTime);

        if (Array.isArray(res.data)) {
          setTours(res.data);
        } else {
          setTours(res.data.tours || []);
        }
      })
      .catch((err) => {
        requestLogger.logFetch(url, startTime);
        console.log(err);
        setError('Unable to load tours. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-900 px-4 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">
            Explore the world
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover your next adventure with Drimora
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Explore amazing destinations, discover unforgettable experiences,
            and find your perfect tour.
          </p>
        </div>
      </section>
      {/* Tours */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Popular Tours</h2>

            <p className="mt-2 text-slate-500">
              {loading
                ? 'Loading tours...'
                : `${tours.length} ${tours.length === 1 ? 'tour available' : 'tours available'}`}
            </p>
          </div>
        </div>
        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        )}
        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}
        {/* Empty */}
        {!loading && !error && tours.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No tours found
            </h3>

            <p className="mt-2 text-slate-500">
              Check back later for new adventures.
            </p>
          </div>
        )}
        
        {/* Tour cards */}
        {!loading && !error && tours.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => {
              const tourId = tour._id || tour.id;
              return (
              <article
                key={tourId}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden bg-slate-200">
                  {tour.image ? (
                    <img
                      src={tour.image}
                      alt={tour.title}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-slate-900">
                    {tour.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {tour.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">
                        Starting from
                      </p>

                      <p className="text-xl font-bold text-amber-500">
                        ₹{Number(tour.price).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <Link
                      to={`/tours/${tourId}`}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Explore
                    </Link>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default HomePage;

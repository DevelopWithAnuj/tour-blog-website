import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

export default function TourDetailsPage() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/v1/tours/${id}`)
      .then((res) => setTour(res.data.data.tour))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <section className="tour-details-page">Loading…</section>;
  if (notFound || !tour)
    return (
      <section className="tour-details-page text-slate-900">
        Tour not found.
      </section>
    );

  const gallery = tour.images?.length
    ? tour.images
    : tour.image
      ? [tour.image]
      : [];

  return (
    <section className="tour-details-page space-y-8 text-slate-900">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
          {tour.category}
        </span>
        <h1 className="mt-1 text-3xl font-bold">{tour.title}</h1>
        <p className="text-slate-500">
          {tour.location} · {tour.duration}
        </p>
      </div>

      {gallery.length > 0 && (
        <div>
          <img
            src={gallery[activeImg]}
            alt={tour.title}
            className="h-72 w-full rounded-2xl object-cover sm:h-96"
          />
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((src, i) => (
                <button key={src} onClick={() => setActiveImg(i)}>
                  <img
                    src={src}
                    alt=""
                    className={`h-16 w-24 rounded-lg object-cover ${
                      i === activeImg ? 'ring-2 ring-amber-500' : 'opacity-70'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="leading-relaxed text-slate-700">{tour.description}</p>

      {tour.itinerary?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold">Itinerary</h2>
          <ol className="mt-3 space-y-3">
            {tour.itinerary.map((d) => (
              <li
                key={d.day}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="font-semibold">
                  Day {d.day}: {d.title}
                </p>
                <p className="text-sm text-slate-600">{d.description}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {tour.faq?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold">Frequently asked questions</h2>
          <div className="mt-3 space-y-3">
            {tour.faq.map((item, index) => (
              <div
                key={`${item.question}-${index}`}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-800">{item.question}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold">Included</h2>
          <ul className="mt-2 space-y-1 text-sm text-emerald-700">
            {tour.inclusions?.map((i) => (
              <li key={i}>✓ {i}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold">Not included</h2>
          <ul className="mt-2 space-y-1 text-sm text-rose-600">
            {tour.exclusions?.map((i) => (
              <li key={i}>✕ {i}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-5 text-white">
        <div>
          <p className="text-xs uppercase text-slate-400">Starting from</p>
          <p className="text-2xl font-bold text-amber-400">
            ₹{Number(tour.price).toLocaleString('en-IN')}
          </p>
        </div>
        <Link
          to="/booking"
          state={{
            tour: { _id: tour._id, title: tour.title, price: tour.price },
          }}
          className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Book this tour
        </Link>
      </div>
    </section>
  );
}

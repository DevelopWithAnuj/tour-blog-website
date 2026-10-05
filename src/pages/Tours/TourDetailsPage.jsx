import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  X,
} from 'lucide-react';

const shimmer =
  'animate-shimmer bg-[linear-gradient(90deg,#0f172a_25%,#1e293b_50%,#0f172a_75%)] bg-size-[200%_100%]';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

function Section({ title, children }) {
  return (
    <section className="animate-fade-up">
      <h2 className="font-display text-2xl text-white sm:text-3xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
      <div className={`h-10 w-40 rounded-full ${shimmer}`} />
      <div className={`mt-6 h-80 rounded-3xl sm:h-125 ${shimmer}`} />
      <div className={`mt-8 h-12 w-2/3 rounded-xl ${shimmer}`} />
      <div className={`mt-4 h-24 max-w-2xl rounded-xl ${shimmer}`} />
    </div>
  );
}

export default function TourDetailsPage() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);
    setActiveImg(0);

    axios
      .get(`/api/v1/tours/${id}`, { signal: controller.signal })
      .then((res) => setTour(res.data.data.tour))
      .catch((err) => {
        if (!axios.isCancel(err)) setNotFound(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  if (loading) return <DetailsSkeleton />;

  if (notFound || !tour) {
    return (
      <div className="mx-auto flex max-w-md animate-scale-in flex-col items-center px-6 py-32 text-center">
        <h1 className="font-display text-3xl">This tour is not available</h1>
        <p className="mt-3 text-white/60">
          It may have been removed, or the link is wrong.
        </p>
        <Link
          to="/tours"
          className="mt-8 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
        >
          Browse all tours
        </Link>
      </div>
    );
  }

  const gallery = tour.images?.length
    ? tour.images
    : tour.image
      ? [tour.image]
      : [];

  const bookingState = {
    tour: { _id: tour._id, title: tour.title, price: tour.price },
  };

  const BookButton = ({ className = '' }) => (
    <Link
      to="/booking"
      state={bookingState}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97] ${className}`}
    >
      Book this tour
      <ArrowRight className="h-4 w-4" />
    </Link>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 md:px-8 lg:pb-24">
      <Link
        to="/tours"
        className="inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        All tours
      </Link>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="mt-6">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900">
            <img
              key={gallery[activeImg]}
              src={gallery[activeImg]}
              alt={tour.title}
              className="h-80 w-full animate-fade-in object-cover sm:h-125"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />
            <span className="absolute left-5 top-5 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-medium capitalize text-amber-300 backdrop-blur-md">
              {tour.category}
            </span>
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === activeImg}
                  className="shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                >
                  <img
                    src={src}
                    alt=""
                    className={`h-16 w-24 rounded-xl object-cover transition duration-300 ${
                      i === activeImg
                        ? 'ring-2 ring-amber-400'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem]">
        {/* Main column */}
        <div className="min-w-0 space-y-14">
          <header className="animate-fade-up">
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              {tour.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-white/65">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-400" />
                {tour.location}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                {tour.duration}
              </span>
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              {tour.description}
            </p>
          </header>

          {tour.itinerary?.length > 0 && (
            <Section title="Your itinerary">
              <ol className="relative space-y-6 border-l border-white/15 pl-8">
                {tour.itinerary.map((d, i) => (
                  <li
                    key={d.day}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="relative animate-fade-up"
                  >
                    <span className="absolute -left-10.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                      {d.day}
                    </span>
                    <h3 className="font-semibold text-white">
                      Day {d.day}: {d.title}
                    </h3>
                    <p className="mt-1 text-white/60">{d.description}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {(tour.inclusions?.length > 0 || tour.exclusions?.length > 0) && (
            <Section title="What to expect">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
                  <h3 className="font-semibold text-emerald-300">Included</h3>
                  <ul className="mt-4 space-y-3">
                    {tour.inclusions?.map((item) => (
                      <li key={item} className="flex gap-3 text-white/75">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
                  <h3 className="font-semibold text-rose-300">Not included</h3>
                  <ul className="mt-4 space-y-3">
                    {tour.exclusions?.map((item) => (
                      <li key={item} className="flex gap-3 text-white/75">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>
          )}

          {tour.faq?.length > 0 && (
            <Section title="Questions travellers ask">
              <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-slate-900">
                {tour.faq.map((item, i) => (
                  <details key={`${item.question}-${i}`} className="group p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <ChevronDown className="h-5 w-5 shrink-0 text-white/50 transition duration-300 group-open:rotate-180 group-open:text-amber-400" />
                    </summary>
                    <p className="mt-3 leading-relaxed text-white/65">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Booking card (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm text-white/55">From</p>
            <p className="mt-1 font-display text-4xl text-amber-400">
              {formatPrice(tour.price)}
            </p>
            <p className="text-sm text-white/55">per person</p>

            <dl className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Duration</dt>
                <dd className="text-right text-white">{tour.duration}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Destination</dt>
                <dd className="text-right text-white">
                  {tour.destination || tour.location}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Style</dt>
                <dd className="text-right capitalize text-white">
                  {tour.category}
                </dd>
              </div>
            </dl>

            <BookButton className="mt-6" />
            <p className="mt-3 text-center text-xs text-white/45">
              You will confirm details before paying.
            </p>
          </div>
        </aside>
      </div>

      {/* Booking bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div>
          <p className="text-xs text-white/55">From</p>
          <p className="text-xl font-semibold text-amber-400">
            {formatPrice(tour.price)}
          </p>
        </div>
        <BookButton className="px-8" />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Compass,
  Luggage,
  Wallet,
} from 'lucide-react';
import axios from 'axios';
import { formatBookingId } from '../../utils/formatBookingId.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import beachSide from '../../assets/beach-side.avif';
import LoadError from '../../components/LoadError.jsx';
import { useActionDialog } from '../../components/ActionDialog.jsx';

const STATUS_STYLES = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-rose-50 text-rose-600',
};

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'pending', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
];

function formatDate(value) {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount) {
  if (typeof amount !== 'number') return '—';
  return `₹${amount.toLocaleString('en-IN')}`;
}

function isUpcomingBooking(booking) {
  return (
    booking.status !== 'cancelled' &&
    new Date(booking.date).getTime() >= Date.now()
  );
}

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof target !== 'number' || prefersReducedMotion) {
      setValue(typeof target === 'number' ? target : 0);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function StatCard({
  label,
  value,
  format = (value) => value,
  index,
  icon: Icon,
  tone,
}) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div
      style={{ animationDelay: `${index * 80}ms` }}
      className="animate-fade-up rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-950/80">{label}</p>
          <p className="mt-2 font-display text-4xl font-semibold text-slate-900">
            {format(typeof value === 'number' ? animated : value)}
          </p>
        </div>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function BookingCard({ booking, tour, index, onCancel, isCancelling }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const status = booking.status || 'pending';
  const statusClass = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const amount =
    typeof booking.totalAmount === 'number'
      ? booking.totalAmount
      : tour
        ? tour.price * (booking.guestCount || 1)
        : undefined;

  return (
    <li
      style={{ animationDelay: `${index * 70}ms` }}
      className="animate-fade-up rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-200/90 text-xl font-display text-amber-800">
            {(tour?.destination || 'T').charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {tour?.destination || 'Tour unavailable'}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
              <CalendarDays className="h-4 w-4 shrink-0 text-amber-700" />
              {formatDate(booking.date)}
              {tour?.location ? `, ${tour.location}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <span className="rounded-full border border-slate-300 bg-white/70 px-2.5 py-1 text-xs capitalize text-slate-700">
            {booking.paymentStatus || 'unpaid'}
          </span>
          <p className="min-w-24 text-right font-semibold text-slate-900">
            {formatCurrency(amount)}
          </p>
          {tour && (
            <Link
              to={`/tours/${tour._id || tour.id}`}
              aria-label={`View ${tour.destination || 'tour'}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-amber-500 hover:text-amber-700"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {booking.paymentStatus !== 'paid' && status !== 'cancelled' && (
              <>
                <Link
                  to={`/booking/payment?id=${booking._id}`}
                  className="inline-flex min-h-9 items-center rounded-lg bg-amber-700/90 px-3 text-sm font-semibold text-white transition-colors hover:bg-amber-800"
                >
                  Pay now
                </Link>
              </>
            )}
            {booking.canCancel && (
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => onCancel(booking)}
                className="inline-flex min-h-9 items-center rounded-lg border border-rose-300 px-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-wait disabled:opacity-60"
              >
                {isCancelling ? 'Cancelling…' : 'Cancel'}
              </button>
            )}
            <button
              type="button"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
              className="inline-flex min-h-9 items-center rounded-lg border border-slate-400 px-3 text-sm font-medium text-slate-800 transition-colors bg-amber-500/80 hover:bg-amber-200/70"
            >
              {detailsOpen ? 'Hide details' : 'Details'}
            </button>
          </div>
        </div>
      </div>

      {detailsOpen && (
        <dl className="mt-4 grid gap-x-6 gap-y-3 border-t border-amber-200 pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-600">Booking ID</dt>
            <dd className="break-all font-medium text-amber-800">
              {formatBookingId(booking._id)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-600">Tour</dt>
            <dd className="font-medium font-display text-slate-900">
              {tour?.title || tour?.destination || 'Tour unavailable'}
              {tour && (
                <Link
                  to={`/tours/${tour._id || tour.id}`}
                  className="ml-3 font-medium text-amber-800 hover:text-amber-950"
                >
                  View tour
                </Link>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-600">Amount</dt>
            <dd className="font-semibold text-slate-900">
              {formatCurrency(amount)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-600">Traveler</dt>
            <dd className="font-medium text-slate-900">
              {booking.travelerName}
            </dd>
          </div>
          <div>
            <dt className="text-slate-600">Email</dt>
            <dd className="break-all font-medium text-slate-900">
              {booking.travelerEmail}
            </dd>
          </div>
          <div>
            <dt className="text-slate-600">Guests</dt>
            <dd className="font-medium text-slate-900">{booking.guestCount}</dd>
          </div>
          <div>
            <dt className="text-slate-600">Payment</dt>
            <dd className="font-medium capitalize text-slate-900">
              {booking.paymentStatus || 'unpaid'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-600">Need help?</dt>
            <dd>
              <Link
                to={`/contact-support?booking=${booking._id}`}
                className="font-medium text-amber-800 hover:text-amber-950"
              >
                Contact support about this booking
              </Link>
            </dd>
          </div>
          {booking.paymentStatus === 'paid' && status !== 'cancelled' && (
            <div>
              <dt className="text-slate-600">Free cancellation</dt>
              <dd className="font-medium text-slate-900">
                {booking.canCancel
                  ? `Until ${new Date(booking.cancellableUntil).toLocaleString(
                      'en-IN',
                      {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      }
                    )}`
                  : 'Window closed. Contact support.'}
              </dd>
            </div>
          )}
          {booking.travelerPhone && (
            <div>
              <dt className="text-slate-600">Phone</dt>
              <dd className="font-medium text-slate-900">
                {booking.travelerPhone}
              </dd>
            </div>
          )}
          {booking.specialRequests && (
            <div className="sm:col-span-2">
              <dt className="text-slate-600">Special requests</dt>
              <dd className="whitespace-pre-wrap font-medium text-slate-900">
                {booking.specialRequests}
              </dd>
            </div>
          )}
        </dl>
      )}
    </li>
  );
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [savedDestinationsLoading, setSavedDestinationsLoading] =
    useState(true);
  const [savedDestinationsError, setSavedDestinationsError] = useState('');
  const [savedDestinationsAttempt, setSavedDestinationsAttempt] = useState(0);
  const [removingDestination, setRemovingDestination] = useState('');
  const { requestConfirmation, dialog } = useActionDialog();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');

    axios
      .get('/api/v1/bookings', { signal: controller.signal })
      .then((res) => setBookings(res.data.data.bookings))
      .catch((error) => {
        if (axios.isCancel(error)) return;
        setLoadError(
          error.response?.data?.message ||
            'We could not load your bookings. Check your connection and try again.'
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    const controller = new AbortController();
    setSavedDestinationsLoading(true);
    setSavedDestinationsError('');

    axios
      .get('/api/v1/auth/saved-destinations', { signal: controller.signal })
      .then((res) =>
        setSavedDestinations(res.data.data.savedDestinations || [])
      )
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setSavedDestinationsError(
            error.response?.data?.message ||
              'We could not load your saved destinations.'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setSavedDestinationsLoading(false);
      });

    return () => controller.abort();
  }, [savedDestinationsAttempt]);

  const removeSavedDestination = async (destination) => {
    if (removingDestination) return;
    setRemovingDestination(destination);
    setSavedDestinationsError('');
    try {
      const response = await axios.delete('/api/v1/auth/saved-destinations', {
        data: { destination },
      });
      setSavedDestinations(response.data.data.savedDestinations || []);
      toast(`${destination} removed from saved destinations.`, {
        type: 'success',
      });
    } catch (error) {
      setSavedDestinationsError(
        error.response?.data?.message ||
          'Unable to remove this saved destination.'
      );
    } finally {
      setRemovingDestination('');
    }
  };

  const handleCancelBooking = async (booking) => {
    const paid = booking.paymentStatus === 'paid';
    const confirmed = await requestConfirmation({
      title: 'Cancel this booking?',
      message: paid
        ? 'Your paid booking will be cancelled and refunded.'
        : 'Are you sure you want to cancel this booking?',
      confirmLabel: 'Cancel booking',
      danger: true,
    });
    if (!confirmed) return;
    const bookingId = booking._id;
    setCancellingBookingId(bookingId);
    try {
      const res = await axios.patch(`/api/v1/bookings/${bookingId}/cancel`);
      const updated = res.data.data.booking;
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId ? updated : booking
        )
      );
      toast(res.data.message, { type: 'success' });
    } catch (error) {
      toast(error.response?.data?.message || 'Unable to cancel this booking.', {
        type: 'error',
      });
    } finally {
      setCancellingBookingId(null);
    }
  };

  const visible = bookings.filter((row) => {
    if (tab === 'upcoming') return isUpcomingBooking(row);
    if (tab === 'pending') return row.status === 'pending';
    if (tab === 'cancelled') return row.status === 'cancelled';
    return true;
  });

  const enrichedBookings = visible.map((b) => ({ booking: b, tour: b.tour }));

  const upcomingCount = bookings.filter(isUpcomingBooking).length;

  const nextTrip = bookings
    .filter(isUpcomingBooking)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const displayName = user?.fullName || user?.username || 'Traveler';

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 text-slate-900 sm:p-6 lg:p-8">
      <header className="animate-fade-up flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800">
            {' '}
            <Compass className="h-4 w-4" /> Your travel desk
          </p>
          <h1 className="font-display text-4xl text-slate-950 sm:text-5xl">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 text-slate-600">
            {user?.email
              ? `Signed in as ${user.email}`
              : "Track every trip you've booked with Drimora, from pending requests to confirmed getaways."}
          </p>
        </div>
        <Link
          to="/tours"
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-amber-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 sm:self-auto"
        >
          Explore Tours <ArrowRight className="h-5 w-5" />
        </Link>
      </header>

      <section className="grid overflow-hidden rounded-lg bg-amber-950 text-white md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col items-start justify-center p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 uppercase text-xs font-bold tracking-widest text-orange-300">
            <CalendarDays className="h-4 w-4" />{' '}
            {nextTrip ? 'Coming up next' : 'Your next escape'}
          </p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">
            {nextTrip?.tour?.destination || 'Somewhere wonderful'}
          </h2>
          <p className="mt-2 text-sm text-amber-100/75">
            {nextTrip
              ? `${formatDate(nextTrip.date)}${nextTrip.tour?.duration ? ` · ${nextTrip.tour.duration}` : ''}`
              : 'Find a place you have never been and make it yours.'}
          </p>
          <Link
            to={
              nextTrip?.tour
                ? `/tours/${nextTrip.tour._id || nextTrip.tour.id}`
                : '/tours'
            }
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-300 px-4 py-2.5 text-sm font-semibold text-amber-950 transition hover:bg-orange-200"
          >
            {nextTrip?.tour ? 'View trip' : 'Find a Tour'}{' '}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative min-h-48 md:min-h-64">
          <img
            src={beachSide}
            alt="Coastal water beside a sunny beach"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-amber-950/70 via-amber-950/10 to-transparent md:bg-linear-to-l md:from-transparent md:via-amber-950/10 md:to-amber-950/20" />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          index={0}
          label="Total bookings"
          value={bookings.length}
          icon={Luggage}
          tone="bg-sky-100 text-sky-700"
        />
        <StatCard
          index={1}
          label="Upcoming trips"
          value={upcomingCount}
          icon={CalendarDays}
          tone="bg-emerald-100 text-lime-800"
        />
        <StatCard
          index={2}
          label="Total spent"
          value={totalSpent}
          format={formatCurrency}
          icon={Wallet}
          tone="bg-orange-100 text-orange-700"
        />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Your shortlist
            </p>
            <h2 className="mt-1 font-display text-2xl text-slate-950">
              Saved destinations
            </h2>
          </div>
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-950"
          >
            Explore destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {savedDestinationsError && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <p role="alert">{savedDestinationsError}</p>
            <button
              type="button"
              onClick={() =>
                setSavedDestinationsAttempt((current) => current + 1)
              }
              className="font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {savedDestinationsLoading ? (
          <p className="mt-5 text-sm text-slate-500">
            Loading saved destinations…
          </p>
        ) : savedDestinations.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 px-5 py-7 text-center">
            <Bookmark className="mx-auto h-6 w-6 text-amber-800" />
            <p className="mt-2 text-sm text-slate-600">
              Save destinations you want to explore later.
            </p>
            <Link
              to="/locations"
              className="mt-3 inline-block text-sm font-semibold text-amber-800 hover:text-amber-950"
            >
              Browse destinations
            </Link>
          </div>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedDestinations.map((destination) => (
              <li
                key={destination}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
              >
                <Link
                  to={`/tours?q=${encodeURIComponent(destination)}`}
                  className="min-w-0 truncate font-medium text-slate-900 hover:text-amber-800"
                >
                  {destination}
                </Link>
                <button
                  type="button"
                  disabled={Boolean(removingDestination)}
                  onClick={() => removeSavedDestination(destination)}
                  aria-label={`Remove ${destination} from saved destinations`}
                  className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                >
                  {removingDestination === destination ? 'Removing…' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>



      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Your itinerary
            </p>
            <h2 className="mt-1 font-display text-2xl text-slate-950">
              Bookings
            </h2>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-4 py-1.5 text-sm transition active:scale-[0.97] ${
                  tab === t.id
                    ? 'bg-emerald-800 font-semibold text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <p className="text-slate-700">Loading your trips…</p>
        ) : loadError ? (
          <div className="mt-6">
            <LoadError
              tone="light"
              message={loadError}
              onRetry={() => setAttempt((n) => n + 1)}
            />
          </div>
        ) : enrichedBookings.length === 0 ? (
          <div className="mt-6 flex animate-scale-in flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <Luggage className="h-7 w-7" />
            </span>
            <p className="mt-5 font-display text-2xl text-slate-950">
              {bookings.length === 0
                ? 'No bookings yet'
                : 'Nothing in this view'}
            </p>
            <p className="mt-2 max-w-sm text-slate-600">
              {bookings.length === 0
                ? 'Once you book a tour, it will show up here.'
                : 'Try another filter to see your other bookings.'}
            </p>
            {bookings.length === 0 && (
              <Link
                to="/tours"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
              >
                Browse tours <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <ul key={tab} className="mt-6 space-y-3">
            {enrichedBookings.map(({ booking, tour }, i) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                tour={tour}
                index={i}
                onCancel={handleCancelBooking}
                isCancelling={cancellingBookingId === booking._id}
              />
            ))}
          </ul>
        )}
      </section>
      {dialog}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatBookingId } from '../../utils/formatBookingId.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const STATUS_STYLES = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-rose-50 text-rose-600',
};

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
  return `₹${amount.toLocaleString()}`;
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gray-200/80 p-5 shadow-sm">
      <p className="text-sm text-slate-600/90">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function BookingCard({ booking, tour }) {
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
    <article className="rounded-2xl border border-slate-700 bg-blue-900 p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-200/90 text-lg font-bold text-amber-700">
            {(tour?.destination || 'T').charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white">
              {tour?.destination || 'Tour unavailable'}
            </p>
            <p className="text-sm text-slate-300">
              {tour?.location ? `${tour.location} · ` : ''}
              {formatDate(booking.date)}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              <span className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs capitalize text-slate-200">
                {booking.paymentStatus}
              </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {booking.paymentStatus !== 'paid' && status !== 'cancelled' && (
              <Link
                to={`/booking/payment?id=${booking._id}`}
                className="inline-flex min-h-9 items-center rounded-lg bg-amber-500 px-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
              >
                Pay now
              </Link>
            )}
            <button
              type="button"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
              className="inline-flex min-h-9 items-center rounded-lg border border-slate-500 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {detailsOpen ? 'Hide details' : 'Details'}
            </button>
          </div>
        </div>
      </div>

      {detailsOpen && (
        <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-slate-700 pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">Booking ID</dt>
            <dd className="break-all font-medium text-white"> {formatBookingId(booking._id)}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Tour</dt>
            <dd className="font-medium text-white">
              {tour?.title || tour?.destination || 'Tour unavailable'}
              {tour && (
                <Link
                  to={`/tours/${tour._id}`}
                  className="ml-3 font-medium text-amber-300 hover:text-amber-200"
                >
                  View tour
                </Link>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Amount</dt>
            <dd className="font-semibold text-white">{formatCurrency(amount)}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Traveler</dt>
            <dd className="font-medium text-white">{booking.travelerName}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Email</dt>
            <dd className="break-all font-medium text-white">
              {booking.travelerEmail}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Guests</dt>
            <dd className="font-medium text-white">{booking.guestCount}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Payment</dt>
            <dd className="font-medium capitalize text-white">
              {booking.paymentStatus || 'unpaid'}
            </dd>
          </div>
          {booking.travelerPhone && (
            <div>
              <dt className="text-slate-400">Phone</dt>
              <dd className="font-medium text-white">
                {booking.travelerPhone}
              </dd>
            </div>
          )}
          {booking.specialRequests && (
            <div className="sm:col-span-2">
              <dt className="text-slate-400">Special requests</dt>
              <dd className="whitespace-pre-wrap font-medium text-white">
                {booking.specialRequests}
              </dd>
            </div>
          )}
        </dl>
      )}
    </article>
  );
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get('/api/v1/bookings', { signal: controller.signal })
      .then((res) => setBookings(res.data.data.bookings))
      .catch((error) => {
        if (axios.isCancel(error)) return;
        setLoadError(true);
        toast(error.response?.data?.message || 'Unable to load bookings.', {
          type: 'error',
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [toast]);

  const enrichedBookings = bookings.map((b) => ({ booking: b, tour: b.tour }));

  const upcomingCount = bookings.filter(
    (b) => b.status !== 'cancelled' && new Date(b.date) >= new Date()
  ).length;

  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const displayName = user?.fullName || user?.username || 'Traveler';

  return (
    <section className="dashboard-page space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          Welcome back
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-100/90 sm:text-3xl">
          Hello, {displayName}
        </h1>
        <p className="mt-2 text-slate-400">
          {user?.email
            ? `Signed in as ${user.email}`
            : "Track every trip you've booked with Drimora, from pending requests to confirmed getaways."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total bookings" value={bookings.length} />
        <StatCard label="Upcoming trips" value={upcomingCount} />
        <StatCard label="Total spent" value={formatCurrency(totalSpent)} />
      </div>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : loadError ? (
        <p className="text-rose-400">Unable to load bookings.</p>
      ) : enrichedBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-lg font-semibold text-slate-800">
            No bookings yet
          </p>
          <p className="mt-1 text-slate-500">
            Once you book a tour, it will show up here.
          </p>
          <Link
            to="/tours"
            className="mt-4 inline-block rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-white transition hover:bg-amber-600"
          >
            Browse tours
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrichedBookings.map(({ booking, tour }) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              tour={tour}
            />
          ))}
        </div>
      )}
    </section>
  );
}

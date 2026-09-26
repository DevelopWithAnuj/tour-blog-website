import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { bookings } from '../../data/bookings.js';
import { tours } from '../../data/tours.js';

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
  return `$${amount.toLocaleString()}`;
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function BookingCard({ booking, tour }) {
  const status = booking.status || 'pending';
  const statusClass = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const amount =
    typeof booking.totalAmount === 'number'
      ? booking.totalAmount
      : tour
        ? tour.price * (booking.guestCount || 1)
        : undefined;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg font-bold text-amber-700">
          {(tour?.destination || 'T').charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-slate-900">
            {tour?.destination || 'Tour unavailable'}
          </p>
          <p className="text-sm text-slate-500">
            {tour?.location ? `${tour.location} · ` : ''}
            {formatDate(booking.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <p className="w-20 text-right font-semibold text-slate-900">
          {formatCurrency(amount)}
        </p>
        {tour && (
          <Link
            to={`/tours/${tour.id}`}
            className="hidden text-sm font-medium text-amber-600 hover:text-amber-700 sm:inline"
          >
            View tour
          </Link>
        )}
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.username || 'Traveler';

  const enrichedBookings = bookings
    .map((booking) => ({
      booking,
      tour: tours.find((t) => t.id === booking.tourId),
    }))
    .sort(
      (a, b) => new Date(b.booking.date || 0) - new Date(a.booking.date || 0)
    );

  const upcomingCount = bookings.filter(
    (b) => b.status !== 'cancelled' && new Date(b.date) >= new Date()
  ).length;

  const totalSpent = enrichedBookings.reduce((sum, { booking, tour }) => {
    const amount =
      typeof booking.totalAmount === 'number'
        ? booking.totalAmount
        : tour
          ? tour.price * (booking.guestCount || 1)
          : 0;
    return sum + (amount || 0);
  }, 0);

  return (
    <section className="dashboard-page space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
          Welcome back
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Hello, {displayName}
        </h1>
        <p className="mt-2 text-slate-500">
          {user?.email ? `Signed in as ${user.email}` : 'Track every trip you\'ve booked with Drimora, from pending requests to confirmed getaways.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total bookings" value={bookings.length} />
        <StatCard label="Upcoming trips" value={upcomingCount} />
        <StatCard label="Total spent" value={formatCurrency(totalSpent)} />
      </div>

      {enrichedBookings.length === 0 ? (
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
            <BookingCard key={booking.id} booking={booking} tour={tour} />
          ))}
        </div>
      )}
    </section>
  );
}

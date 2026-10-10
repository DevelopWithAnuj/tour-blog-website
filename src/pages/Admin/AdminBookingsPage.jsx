import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'cancelled'];
const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

function formatCurrency(value) {
  return typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : '—';
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadBookings = useCallback(
    async (signal) => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/v1/admin/bookings', {
          params: {
            page,
            status,
            q: submittedSearch || undefined,
          },
          withCredentials: true,
          signal,
        });
        setBookings(res.data.data.bookings);
        setPages(res.data.data.pages || 1);
        setTotal(res.data.data.total || 0);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(
            err.response?.data?.message ||
              'Unable to load bookings. Please try again.'
          );
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [page, status, submittedSearch]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadBookings(controller.signal);
    return () => controller.abort();
  }, [loadBookings]);

  const updateStatus = async (booking, nextStatus) => {
    if (booking.status === nextStatus || updatingId) return;
    if (
      nextStatus === 'cancelled' &&
      !window.confirm(
        booking.paymentStatus === 'paid'
          ? 'Cancel this paid booking? Its payment will be marked as refunded.'
          : 'Cancel this booking?'
      )
    ) {
      return;
    }

    setUpdatingId(booking._id);
    setError('');
    setNotice('');
    try {
      await axios.patch(
        `/api/v1/admin/bookings/${booking._id}/status`,
        { status: nextStatus },
        { withCredentials: true }
      );
      setNotice('Booking status updated.');
      const controller = new AbortController();
      await loadBookings(controller.signal);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to update booking status. Please try again.'
      );
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <section className="admin-bookings-page mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-800">
            Administration
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-slate-900">
            Booking management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Search travellers and manage booking statuses.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-600">
          {total} {total === 1 ? 'booking' : 'bookings'}
        </p>
      </div>

      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSubmittedSearch(search.trim());
        }}
      >
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-amber-600">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search traveller, email, or tour"
            aria-label="Search bookings"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          aria-label="Filter by booking status"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === 'all'
                ? 'All statuses'
                : `${option[0].toUpperCase()}${option.slice(1)}`}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900"
        >
          Search
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5" aria-label="Loading bookings">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-14 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-slate-500">
            No bookings match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[65rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Traveller</th>
                  <th className="px-5 py-3 font-semibold">Tour</th>
                  <th className="px-5 py-3 font-semibold">Travel date</th>
                  <th className="px-5 py-3 font-semibold">Guests</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {booking.travelerName || 'Traveller'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.travelerEmail}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <p>{booking.tour?.title || 'Tour unavailable'}</p>
                      {booking.tour?.destination && (
                        <p className="text-xs text-slate-500">
                          {booking.tour.destination}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(booking.date)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {booking.guestCount}
                    </td>
                    <td className="px-5 py-4 capitalize text-slate-600">
                      {booking.paymentStatus}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          STATUS_STYLES[booking.status] ||
                          'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        aria-label={`Update status for ${booking.travelerName || 'booking'}`}
                        value={booking.status}
                        disabled={
                          booking.status === 'cancelled' ||
                          updatingId === booking._id
                        }
                        onChange={(event) =>
                          updateStatus(booking, event.target.value)
                        }
                        className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        {STATUS_OPTIONS.filter((item) => item !== 'all').map(
                          (option) => (
                            <option
                              key={option}
                              value={option}
                              disabled={
                                (option === 'confirmed' &&
                                  booking.paymentStatus !== 'paid') ||
                                (option === 'pending' &&
                                  booking.paymentStatus === 'paid')
                              }
                            >
                              {option[0].toUpperCase() + option.slice(1)}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && pages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

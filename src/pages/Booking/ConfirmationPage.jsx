import { Link, Navigate, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import {
  BookingSteps,
  formatDate,
  formatPrice,
} from '../../components/BookingParts.jsx';

export default function ConfirmationPage() {
  const { state } = useLocation();

  if (!state?.tour || !state?.bookingId) {
    return <Navigate to="/dashboard" replace />;
  }

  const { tour, details, bookingId, method } = state;
  const total = tour.price * details.guests;

  const rows = [
    ['Booking ID', bookingId],
    ['Tour', tour.title],
    ['Travel date', formatDate(details.date)],
    ['Travellers', details.guests],
    [
      'Paid with',
      method === 'netbanking' ? 'Net banking' : method.toUpperCase(),
    ],
    ['Total paid', formatPrice(total)],
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 md:px-8">
      <BookingSteps current={4} />

      <div className="mt-12 text-center">
        <span className="mx-auto flex h-16 w-16 animate-scale-in items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
          <Check className="h-8 w-8" />
        </span>
        <h1 className="mt-6 animate-fade-up font-display text-4xl sm:text-5xl">
          You are going.
        </h1>
        <p
          style={{ animationDelay: '120ms' }}
          className="mt-3 animate-fade-up text-white/60"
        >
          A confirmation has been sent to{' '}
          <span className="text-white">{details.email}</span>.
        </p>
      </div>

      <dl
        style={{ animationDelay: '240ms' }}
        className="mt-10 animate-fade-up divide-y divide-white/10 rounded-3xl border border-white/10 bg-slate-900"
      >
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-6 px-6 py-4 text-sm"
          >
            <dt className="text-white/55">{label}</dt>
            <dd
              className={`text-right font-medium ${
                label === 'Booking ID'
                  ? 'font-mono text-amber-300'
                  : 'text-white'
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-full bg-amber-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
        >
          View my trips
        </Link>
        <Link
          to="/tours"
          className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-white transition hover:border-amber-400/70 hover:text-amber-300"
        >
          Browse more tours
        </Link>
      </div>
    </div>
  );
}

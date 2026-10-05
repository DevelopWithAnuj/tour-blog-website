import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Banknote, CreditCard, Loader2, Lock, Smartphone } from 'lucide-react';
import {
  BookingSteps,
  OrderSummary,
  formatPrice,
} from '../../components/BookingParts.jsx';

const METHODS = [
  { id: 'upi', label: 'UPI', hint: 'Pay with any UPI app', icon: Smartphone },
  { id: 'card', label: 'Card', hint: 'Credit or debit card', icon: CreditCard },
  {
    id: 'netbanking',
    label: 'Net banking',
    hint: 'Choose your bank',
    icon: Banknote,
  },
];

const makeBookingId = () =>
  `DRM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [method, setMethod] = useState('upi');
  const [paying, setPaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!state?.tour || !state?.details) {
    return <Navigate to="/tours" replace />;
  }

  const { tour, details } = state;
  const total = tour.price * details.guests;

  const handlePay = () => {
    setPaying(true);
    // Demo only: replace with a real gateway call and booking API request.
    timer.current = setTimeout(() => {
      navigate('/booking/confirmation', {
        replace: true,
        state: { tour, details, method, bookingId: makeBookingId() },
      });
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 md:px-8">
      <BookingSteps current={2} />

      <h1 className="mt-8 animate-fade-up font-display text-4xl sm:text-5xl">
        How would you like to pay?
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="animate-fade-up space-y-4">
          <div
            role="radiogroup"
            aria-label="Payment method"
            className="space-y-3"
          >
            {METHODS.map(({ id, label, hint, icon: Icon }) => {
              const selected = method === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setMethod(id)}
                  disabled={paying}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                    selected
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-white/10 bg-slate-900 hover:border-white/25'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      selected
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-white">
                      {label}
                    </span>
                    <span className="text-sm text-white/55">{hint}</span>
                  </span>
                  <span
                    className={`h-5 w-5 rounded-full border-2 transition ${
                      selected
                        ? 'border-amber-400 bg-amber-400 shadow-[inset_0_0_0_3px_#0f172a]'
                        : 'border-white/30'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <p className="flex items-center gap-2 text-sm text-white/45">
            <Lock className="h-4 w-4" />
            This is a demo checkout. No real payment is taken.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handlePay}
              disabled={paying}
              className="flex min-w-48 items-center justify-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98] disabled:opacity-70"
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                `Pay ${formatPrice(total)}`
              )}
            </button>
            {!paying && (
              <Link
                to="/booking"
                state={{ tour }}
                className="text-sm text-white/60 hover:text-white"
              >
                Edit details
              </Link>
            )}
          </div>
        </div>

        <OrderSummary tour={tour} details={details} />
      </div>
    </div>
  );
}

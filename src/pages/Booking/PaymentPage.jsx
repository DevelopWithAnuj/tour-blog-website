import { useEffect, useRef, useState } from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Banknote, CreditCard, Loader2, Lock, Smartphone } from 'lucide-react';
import {
  BookingSteps,
  OrderSummary,
  apiMessage,
  formatPrice,
} from '../../components/BookingParts.jsx';
import axios from 'axios';
import LoadError from '../../components/LoadError.jsx';

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

const formatCard = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

export default function PaymentPage() {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const id = params.get('id');
  const { tour, details } = location.state || {};
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [cardTouched, setCardTouched] = useState(false);
  const [method, setMethod] = useState('upi');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const methodButtons = useRef([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    axios
      .get(`/api/v1/bookings/${id}`)
      .then((res) => setBooking(res.data.data.booking))
      .catch((err) => setLoadError(apiMessage(err)))
      .finally(() => setLoading(false));
  }, [id, attempt]);

  if (loading) {
    return <p className="p-10 text-center text-white/60">Loading...</p>;
  }
  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <LoadError
          message={loadError}
          onRetry={() => setAttempt((n) => n + 1)}
        />
        <Link to="/dashboard" className="mt-4 inline-block text-amber-300">
          View my trips
        </Link>
      </div>
    );
  }
  if (booking?.status === 'cancelled') {
    return <Navigate to="/dashboard" replace />;
  }
  if (booking?.paymentStatus === 'paid') {
    return <Navigate to={`/booking/confirmation?id=${id}`} replace />;
  }
  if (!booking && (!tour || !details)) {
    return <Navigate to="/tours" replace />;
  }

  const currentTour = booking
    ? {
        ...tour,
        title: booking.tour?.title,
        price: booking.totalAmount / booking.guestCount,
      }
    : tour;
  const currentDetails = booking
    ? {
        ...details,
        date: booking.date,
        guests: booking.guestCount,
      }
    : details;
  const total = booking
    ? booking.totalAmount
    : currentTour.price * currentDetails.guests;

  const cardDigits = cardNumber.replace(/\s/g, '');
  const cardError =
    method === 'card' && cardTouched && cardDigits.length !== 16
      ? 'Enter all 16 digits of the card number.'
      : '';

  const handlePay = async () => {
    if (method === 'card' && cardDigits.length !== 16) {
      setCardTouched(true);
      return;
    }
    setPaying(true);
    setError('');
    try {
      let currentBooking = booking;
      if (!currentBooking) {
        const bookingResponse = await axios.post('/api/v1/bookings', {
          tourId: currentTour._id,
          date: currentDetails.date,
          guestCount: currentDetails.guests,
          travelerName: currentDetails.name,
          travelerEmail: currentDetails.email,
          travelerPhone: currentDetails.phone,
          specialRequests: currentDetails.requests,
        });
        currentBooking = bookingResponse.data.data.booking;
        setBooking(currentBooking);
        setParams({ id: currentBooking._id }, { replace: true });
      }

      await axios.post(`/api/v1/bookings/${currentBooking._id}/pay`, {
        method,
        cardNumber: method === 'card' ? cardDigits : undefined,
      });
      navigate(`/booking/confirmation?id=${currentBooking._id}`, {
        replace: true,
      });
    } catch (err) {
      setError(apiMessage(err));
      setPaying(false);
    }
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
            {METHODS.map(({ id, label, hint, icon: Icon }, index) => {
              const selected = method === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  ref={(element) => (methodButtons.current[index] = element)}
                  onClick={() => setMethod(id)}
                  onKeyDown={(event) => {
                    const directions = {
                      ArrowRight: 1,
                      ArrowDown: 1,
                      ArrowLeft: -1,
                      ArrowUp: -1,
                    };
                    const direction = directions[event.key];
                    if (!direction) return;
                    event.preventDefault();
                    const nextIndex =
                      (index + direction + METHODS.length) % METHODS.length;
                    setMethod(METHODS[nextIndex].id);
                    methodButtons.current[nextIndex]?.focus();
                  }}
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

          {method === 'card' && (
            <label className="block text-sm text-white/70">
              Card number
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                maxLength={19}
                value={cardNumber}
                onChange={(event) =>
                  setCardNumber(formatCard(event.target.value))
                }
                onBlur={() => setCardTouched(true)}
                aria-invalid={Boolean(cardError)}
                aria-describedby={cardError ? 'card-error' : undefined}
                placeholder="1234 5678 9012 3456"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 aria-invalid:border-rose-400"
              />
              {cardError && (
                <span
                  id="card-error"
                  className="mt-1.5 block text-xs text-rose-300"
                >
                  {cardError}
                </span>
              )}
            </label>
          )}

          {error && (
            <p role="alert" className="text-sm text-rose-300">
              {error}
            </p>
          )}
          <p className="flex items-start gap-2 text-sm text-white/45">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              This is a demo checkout. No real payment is taken.
              {method === 'card' &&
                ' To see a decline, use a card number ending in 0000. Any other 16 digits will succeed.'}
            </span>
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
          </div>
        </div>

        <OrderSummary tour={currentTour} details={currentDetails} />
      </div>
    </div>
  );
}

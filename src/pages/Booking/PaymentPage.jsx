import { useEffect, useState } from 'react';
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

export default function PaymentPage() {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const id = params.get('id');
  const { tour, details } = location.state || {};
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [method, setMethod] = useState('upi');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    axios
      .get(`/api/v1/bookings/${id}`)
      .then((res) => setBooking(res.data.data.booking))
      .catch((err) => setLoadError(apiMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="p-10 text-center text-white/60">Loading...</p>;
  }
  if (loadError) {
    return (
      <div className="p-10 text-center">
        <p role="alert" className="text-rose-300">
          {loadError}
        </p>
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

  const handlePay = async () => {
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
        cardNumber: method === 'card' ? cardNumber : undefined,
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

          {method === 'card' && (
            <label className="block text-sm text-white/70">
              Card number
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                placeholder="1234 5678 9012 3456"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </label>
          )}

          {error && (
            <p role="alert" className="text-sm text-rose-300">
              {error}
            </p>
          )}
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
          </div>
        </div>

        <OrderSummary tour={currentTour} details={currentDetails} />
      </div>
    </div>
  );
}

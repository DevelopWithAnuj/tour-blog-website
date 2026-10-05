import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  BookingSteps,
  OrderSummary,
  fieldClass,
} from '../../components/BookingParts.jsx';

const MAX_GUESTS = 10;

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function Field({ id, label, error, children }) {
  return (
    <div>
      {id ? (
        <label htmlFor={id} className="text-sm text-white/70">
          {label}
        </label>
      ) : (
        <p className="text-sm text-white/70">{label}</p>
      )}
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

export default function BookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tour = state?.tour;
  const [form, setForm] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    date: '',
    guests: 1,
    requests: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  if (!tour) {
    return (
      <div className="mx-auto flex max-w-md animate-scale-in flex-col items-center px-6 py-32 text-center">
        <h1 className="font-display text-3xl">Pick a tour first</h1>
        <p className="mt-3 text-white/60">
          Choose a tour and press “Book this tour” to start here.
        </p>
        <Link
          to="/tours"
          className="mt-8 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
        >
          Browse tours
        </Link>
      </div>
    );
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setGuests = (n) =>
    setForm((f) => ({ ...f, guests: Math.min(Math.max(n, 1), MAX_GUESTS) }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter the lead traveller’s name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email.';
    if (form.phone.replace(/\D/g, '').length < 10)
      next.phone = 'Enter a phone number with at least 10 digits.';
    if (!form.date) next.date = 'Choose a travel date.';
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    navigate('/booking/payment', {
      state: {
        tour,
        details: {
          date: form.date,
          guests: form.guests,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          requests: form.requests.trim(),
        },
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 md:px-8">
      <BookingSteps current={1} />

      <h1 className="mt-8 animate-fade-up font-display text-4xl sm:text-5xl">
        Who is travelling?
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="animate-fade-up space-y-6"
        >
          <Field id="traveler-name" label="Full name" error={errors.name}>
            <input
              id="traveler-name"
              value={form.name}
              onChange={set('name')}
              placeholder="As on the passport"
              className={fieldClass}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="traveler-email" label="Email" error={errors.email}>
              <input
                id="traveler-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className={fieldClass}
              />
            </Field>
            <Field id="traveler-phone" label="Phone" error={errors.phone}>
              <input
                id="traveler-phone"
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="98765 43210"
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="travel-date" label="Travel date" error={errors.date}>
              <input
                id="travel-date"
                type="date"
                min={tomorrow()}
                value={form.date}
                onChange={set('date')}
                className={`${fieldClass} scheme-dark`}
              />
            </Field>

            <Field label="Travellers">
              <div className="mt-1.5 flex items-center justify-between rounded-xl border border-white/15 bg-white/5 p-1.5">
                <button
                  type="button"
                  aria-label="Fewer travellers"
                  onClick={() => setGuests(form.guests - 1)}
                  disabled={form.guests <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10 active:scale-[0.95] disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold" aria-live="polite">
                  {form.guests}
                </span>
                <button
                  type="button"
                  aria-label="More travellers"
                  onClick={() => setGuests(form.guests + 1)}
                  disabled={form.guests >= MAX_GUESTS}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10 active:scale-[0.95] disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </Field>
          </div>

          <Field id="special-requests" label="Special requests (optional)">
            <textarea
              id="special-requests"
              rows={4}
              value={form.requests}
              onChange={set('requests')}
              placeholder="Dietary needs, accessibility, celebrations…"
              className={fieldClass}
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-amber-500 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98] sm:w-auto sm:px-10"
          >
            Continue to payment
          </button>
        </form>

        <OrderSummary tour={tour} details={form} />
      </div>
    </div>
  );
}

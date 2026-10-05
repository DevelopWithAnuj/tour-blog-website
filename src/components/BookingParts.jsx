import { Check } from 'lucide-react';

export const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export const formatDate = (value) => {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return 'To be confirmed';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const fieldClass =
  'mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20';

const STEPS = ['Traveller details', 'Payment', 'Confirmation'];

export function BookingSteps({ current }) {
  return (
    <ol className="flex items-center gap-3 text-sm" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              aria-current={active ? 'step' : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                done
                  ? 'bg-emerald-400 text-slate-950'
                  : active
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-white/20 text-white/50'
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : step}
            </span>
            <span
              className={`hidden sm:inline ${active ? 'text-white' : 'text-white/50'}`}
            >
              {label}
            </span>
            {step < STEPS.length && (
              <span className="h-px w-6 bg-white/15 sm:w-10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function OrderSummary({ tour, details, children }) {
  const guests = details?.guests || 1;
  const total = tour.price * guests;

  return (
    <aside className="rounded-3xl border border-white/10 bg-slate-900 p-6 lg:sticky lg:top-28">
      <h2 className="font-display text-xl text-white">Your trip</h2>
      <p className="mt-3 font-semibold text-white">{tour.title}</p>

      <dl className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
        {details?.date && (
          <div className="flex justify-between gap-4">
            <dt className="text-white/55">Date</dt>
            <dd className="text-right text-white">{formatDate(details.date)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-white/55">Travellers</dt>
          <dd className="text-white">{guests}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-white/55">
            {formatPrice(tour.price)} × {guests}
          </dt>
          <dd className="text-white">{formatPrice(total)}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-baseline justify-between border-t border-white/10 pt-5">
        <span className="text-white/70">Total</span>
        <span className="font-display text-3xl text-amber-400">
          {formatPrice(total)}
        </span>
      </div>

      {children}
    </aside>
  );
}

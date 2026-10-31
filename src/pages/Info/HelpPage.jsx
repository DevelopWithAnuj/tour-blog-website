import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, SearchX } from 'lucide-react';
import { PageHero } from '../../components/InfoParts.jsx';
import { CANCELLATION } from '../../config/site.js';

const FAQS = [
  {
    cat: 'Booking',
    q: 'Do I need an account to book?',
    a: 'Yes. You can browse tours, locations and stories without signing in, but you need an account to book so your bookings and confirmations stay in one place.',
  },
  {
    cat: 'Booking',
    q: 'How do I book a tour?',
    a: 'Open a tour and choose Book this tour. Enter traveler details and a travel date, then pay. You will land on a confirmation page with your booking ID.',
  },
  {
    cat: 'Booking',
    q: 'How many travelers can I add?',
    a: 'Up to 20 travelers per online booking. For a larger group, contact us.',
  },
  {
    cat: 'Booking',
    q: 'Where can I see my bookings?',
    a: 'In your dashboard. Each booking has a Details panel with its ID, amount, payment status and cancellation deadline.',
  },
  {
    cat: 'Payments',
    q: 'Which payment methods can I use?',
    a: 'UPI, card and net banking. Checkout is currently a demonstration: no real payment is taken and card numbers are not stored.',
  },
  {
    cat: 'Payments',
    q: 'Where do I find my booking ID?',
    a: 'On the confirmation page and in the Details panel of each booking in your dashboard. IDs look like DRM-XXXXXXXX.',
  },
  {
    cat: 'Cancellations',
    q: 'Can I cancel a booking?',
    a: `Unpaid bookings can be cancelled at any time from your dashboard. Paid bookings can be cancelled within ${CANCELLATION.windowHours} hours of payment, and never within ${CANCELLATION.minHoursBeforeTravel} hours of the travel date.`,
  },
  {
    cat: 'Cancellations',
    q: 'How do refunds work?',
    a: 'Cancelling a paid booking inside the window marks the payment as refunded. Because checkout is a demonstration, no money moves. When live payments are added, timing will depend on your payment method.',
  },
  {
    cat: 'Cancellations',
    q: 'The Cancel button is missing. What now?',
    a: 'It disappears once the cancellation window closes. Contact support and quote your booking ID.',
  },
  {
    cat: 'Account',
    q: 'I did not get my verification email.',
    a: 'Check your spam folder. Then try signing in: when we tell you the email is not verified, use Resend verification email. Links expire after 24 hours.',
  },
  {
    cat: 'Account',
    q: 'I forgot my password.',
    a: 'Choose Forgot password on the sign-in page. We will email you a reset link that is valid for 30 minutes.',
  },
  {
    cat: 'Account',
    q: 'Can I sign in with Google or GitHub?',
    a: 'Yes. Both are available on the sign-in and sign-up pages.',
  },
  {
    cat: 'Tours',
    q: 'What does a tour include?',
    a: 'Every tour page lists the itinerary, what is included, what is not and common questions. Check it before you book. Flights, visas and insurance are often excluded.',
  },
  {
    cat: 'Tours',
    q: 'Do I need a visa?',
    a: 'Visa rules depend on your nationality and travel dates, so check the latest requirements before you travel. Visa fees are listed under Not included on tours where they are not covered.',
  },
];

const CATS = ['All', ...new Set(FAQS.map((f) => f.cat))];

export default function HelpPage() {
  const [cat, setCat] = useState('All');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter(
      (f) =>
        (cat === 'All' || f.cat === cat) &&
        (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    );
  }, [cat, query]);

  const chip = (active) =>
    `rounded-full border px-4 py-2 text-sm transition active:scale-[0.97] ${
      active
        ? 'border-amber-500 bg-amber-500 font-semibold text-slate-950'
        : 'border-white/15 text-white/75 hover:border-amber-400/60 hover:text-amber-300'
    }`;

  return (
    <>
      <PageHero eyebrow="Help centre" title="Answers to common questions.">
        Search below, or browse by topic. If you cannot find what you need, we
        are one message away.
      </PageHero>

      <div className="mx-auto max-w-4xl px-4 pb-24 pt-10 md:px-8">
        <label className="flex animate-fade-up items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 focus-within:border-amber-400">
          <Search className="h-5 w-5 shrink-0 text-white/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help, e.g. cancel, refund, password"
            aria-label="Search help"
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              className={chip(cat === c)}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-8 text-sm text-white/55" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'answer' : 'answers'}
        </p>

        {visible.length === 0 ? (
          <div className="mt-4 flex animate-scale-in flex-col items-center rounded-3xl border border-dashed border-white/15 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
              <SearchX className="h-7 w-7" />
            </span>
            <p className="mt-5 font-display text-2xl">Nothing matches that</p>
            <p className="mt-2 max-w-sm text-white/60">
              Try different words, or ask us directly.
            </p>
          </div>
        ) : (
          <div
            key={`${cat}|${query}`}
            className="mt-4 animate-fade-up divide-y divide-white/10 rounded-2xl border border-white/10 bg-slate-900"
          >
            {visible.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="mb-1 block text-xs font-normal uppercase tracking-wide text-amber-300/80">
                      {f.cat}
                    </span>
                    {f.q}
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-white/50 transition duration-300 group-open:rotate-180 group-open:text-amber-400" />
                </summary>
                <p className="mt-3 leading-relaxed text-white/65">{f.a}</p>
              </details>
            ))}
          </div>
        )}

        <section className="mt-14 rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
          <h2 className="font-display text-2xl">Still stuck?</h2>
          <p className="mt-2 text-white/60">
            Tell us what happened and we will help.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact-support"
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
            >
              Contact support
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:border-amber-400/70 hover:text-amber-300"
            >
              General enquiry
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

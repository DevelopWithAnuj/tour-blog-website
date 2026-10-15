import { useEffect, useState } from 'react';
import axios from 'axios';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  AuthError,
  StatusScreen,
  SubmitButton,
  inputClass,
} from './AuthParts.jsx';
import { formatDate } from './BookingParts.jsx';
import { formatBookingId } from '@/utils/formatBookingId.js';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

const selectClass =
  'mt-1.5 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20';

const apiMessage = (err) => {
  const first = err.response?.data?.errors?.[0];
  return (
    (first && Object.values(first)[0]) ||
    err.response?.data?.message ||
    'Something went wrong. Please try again.'
  );
};

export default function InquiryForm({
  type = 'general',
  bookings = [],
  defaultBookingId = '',
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    bookingId: defaultBookingId,
    website: '', // honeypot
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Prefill once the signed-in user is known, without overwriting typing.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || user.fullName || user.username || '',
      email: f.email || user.email || '',
    }));
  }, [user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (form.name.trim().length < 2) return 'Please enter your name.';
    if (!EMAIL_RE.test(form.email.trim()))
      return 'Enter a valid email address.';
    if (form.subject.trim().length < 3) return 'Add a short subject.';
    if (form.message.trim().length < 10)
      return 'Please write at least 10 characters.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    setError(problem);
    if (problem) return;

    setSubmitting(true);
    try {
      await axios.post('/api/v1/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        type,
        bookingId: form.bookingId || undefined,
        website: form.website,
      });
      setSent(true);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm((f) => ({ ...f, subject: '', message: '', website: '' }));
    setSent(false);
  };

  if (sent) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
        <StatusScreen
          icon={MailCheck}
          tone="emerald"
          title="Message sent"
          action={
            <button
              type="button"
              onClick={reset}
              className="mt-8 text-sm text-amber-400 hover:text-amber-300"
            >
              Send another message
            </button>
          }
        >
          <p>
            Thanks, {form.name.split(' ')[0]}. We will reply to{' '}
            <span className="text-white">{form.email}</span>.
          </p>
        </StatusScreen>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-name" className="text-sm text-white/70">
            Name
          </label>
          <input
            id="inq-name"
            value={form.name}
            onChange={set('name')}
            autoComplete="name"
            maxLength={100}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="inq-email" className="text-sm text-white/70">
            Email
          </label>
          <input
            id="inq-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      </div>

      {bookings.length > 0 && (
        <div>
          <label htmlFor="inq-booking" className="text-sm text-white/70">
            Booking <span className="text-white/40">(optional)</span>
          </label>
          <select
            id="inq-booking"
            value={form.bookingId}
            onChange={set('bookingId')}
            className={selectClass}
          >
            <option value="">Not about a specific booking</option>
            {bookings.map((b) => (
              <option key={b._id} value={b._id}>
                {formatBookingId(b._id)} · {b.tour?.title || 'Tour'} ·{' '}
                {formatDate(b.date)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="inq-subject" className="text-sm text-white/70">
          Subject
        </label>
        <input
          id="inq-subject"
          value={form.subject}
          onChange={set('subject')}
          maxLength={150}
          className={inputClass}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="inq-message" className="text-sm text-white/70">
            Message
          </label>
          <span className="text-xs text-white/40">
            {form.message.length}/2000
          </span>
        </div>
        <textarea
          id="inq-message"
          rows={6}
          value={form.message}
          onChange={set('message')}
          maxLength={2000}
          className={inputClass}
        />
      </div>

      {/* Honeypot: hidden from people, tempting to bots */}
      <div
        className="absolute -left-2499.75 h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set('website')}
          />
        </label>
      </div>

      <AuthError>{error}</AuthError>

      <SubmitButton loading={submitting} loadingText="Sending…">
        Send message
      </SubmitButton>
    </form>
  );
}

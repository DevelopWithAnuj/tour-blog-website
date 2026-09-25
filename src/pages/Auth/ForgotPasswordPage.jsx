import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      // Backend always returns success (even if the email doesn't exist)
      // to avoid leaking which emails are registered.
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15">
            <MailCheck className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="mt-6 font-display text-2xl text-white">
            Check your inbox
          </h1>
          <p className="mt-3 text-sm text-white/60">
            If an account exists for <span className="text-white">{email}</span>
            , we've sent a link to reset your password.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-block w-full rounded-full bg-amber-500 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-sm">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <h1 className="mt-8 font-display text-3xl text-white">
          Forgot password?
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Enter the email linked to your account and we'll send you a reset
          link.
        </p>

        {error && (
          <p className="mt-6 rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 text-sm text-rose-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm text-white/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-amber-500 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}

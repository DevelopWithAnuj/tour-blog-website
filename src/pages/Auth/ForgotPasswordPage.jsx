import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  AuthError,
  AuthShell,
  StatusScreen,
  SubmitButton,
  inputClass,
} from '../../components/AuthParts.jsx';

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
      // The backend always succeeds so it never reveals which emails are registered.
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
      <AuthShell
        title="Back on the road soon."
        subtitle="Check your email for the reset link."
      >
        <StatusScreen
          icon={MailCheck}
          title="Check your inbox"
          action={
            <>
              <Link
                to="/login"
                className="mt-8 block rounded-full bg-amber-500 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98]"
              >
                Back to sign in
              </Link>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-sm text-white/50 hover:text-white"
              >
                Use a different email
              </button>
            </>
          }
        >
          <p>
            If an account exists for <span className="text-white">{email}</span>
            , we have sent a link to reset your password.
          </p>
        </StatusScreen>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Back on the road soon."
      subtitle="We will email you a link to reset your password."
    >
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <h1 className="mt-8 font-display text-4xl text-white">
        Forgot password?
      </h1>
      <p className="mt-2 text-white/60">
        Enter the email linked to your account and we will send you a reset
        link.
      </p>

      <AuthError>{error}</AuthError>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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
            autoComplete="email"
            required
            className={inputClass}
          />
        </div>
        <SubmitButton loading={submitting} loadingText="Sending…">
          Send reset link
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

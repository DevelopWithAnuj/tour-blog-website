import { useState } from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  AuthError,
  AuthShell,
  Divider,
  PasswordInput,
  SocialButtons,
  SubmitButton,
  inputClass,
} from '../../components/AuthParts.jsx';

export default function LoginPage() {
  const {
    user,
    login,
    resendVerificationEmail,
    loginWithGoogle,
    loginWithGitHub,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get('verified') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resend, setResend] = useState('idle'); // idle | sending | sent
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
        replace
      />
    );
  }

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setResend('idle');
    setSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      const role = res?.data?.user?.role;
      navigate(from || (role === 'admin' ? '/admin-dashboard' : '/dashboard'));
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      setNeedsVerification(/verify your email/i.test(message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResend('sending');
    try {
      await resendVerificationEmail(email.trim().toLowerCase());
    } finally {
      setResend('sent');
    }
  };

  return (
    <AuthShell>
      <h1 className="font-display text-4xl text-white">Welcome back</h1>
      <p className="mt-2 text-white/60">
        Sign in to manage your bookings and trips.
      </p>

      {justVerified && !error && (
        <p className="mt-6 flex animate-scale-in items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          <BadgeCheck className="h-4 w-4 shrink-0" />
          Email verified. You can sign in now.
        </p>
      )}

      <AuthError>{error}</AuthError>

      {needsVerification && email && (
        <button
          type="button"
          onClick={handleResend}
          disabled={resend !== 'idle'}
          className="mt-3 text-sm text-amber-400 hover:text-amber-300 disabled:text-white/50"
        >
          {resend === 'idle' && 'Resend verification email'}
          {resend === 'sending' && 'Sending…'}
          {resend === 'sent' &&
            'If that account exists, a new link is on its way.'}
        </button>
      )}

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

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          labelRight={
            <Link
              to="/forgot-password"
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              Forgot password?
            </Link>
          }
        />

        <SubmitButton loading={submitting} loadingText="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <Divider>or continue with</Divider>
      <SocialButtons onGoogle={loginWithGoogle} onGitHub={loginWithGitHub} />

      <p className="mt-8 text-center text-sm text-white/50">
        New to Drimora?{' '}
        <Link to="/register" className="text-amber-400 hover:text-amber-300">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MailCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { FaGithub } from 'react-icons/fa';

const USERNAME_PATTERN = /^[a-z0-9_]{4,20}$/;

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.48a5.54 5.54 0 0 1-2.4 3.64v3h3.88c2.27-2.09 3.56-5.17 3.56-8.83z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
export default function RegisterPage() {
  const { register, loginWithGoogle, loginWithGitHub } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(null);

  const validate = () => {
    if (!email.trim()) return 'Email is required.';
    if (!USERNAME_PATTERN.test(username)) {
      return 'Username must be 4-20 characters: lowercase letters, numbers, or underscores only.';
    }
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        password,
        fullName: fullName.trim() || undefined,
      });
      setSubmittedEmail(email.trim());
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Success state — backend requires email verification before login works
  if (submittedEmail) {
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
            We sent a verification link to{' '}
            <span className="text-white">{submittedEmail}</span>. Verify your
            email to activate your account, then sign in.
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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: destination image */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="/img/login-hero.png"
          alt="A scenic travel destination"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="font-display text-2xl text-white">
            Start planning your next trip.
          </p>
          <p className="mt-2 text-sm text-white/70">
            Create an account to save trips, track bookings, and more.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center bg-slate-950 px-6 py-12 md:px-12">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="font-display text-2xl font-semibold text-white"
          >
            Drimora
          </Link>

          <h1 className="mt-10 font-display text-3xl text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Join Drimora to book tours and share travel stories.
          </p>

          {error && (
            <p className="mt-6 rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label htmlFor="fullName" className="text-sm text-white/70">
                Full name <span className="text-white/40">(optional)</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Traveler"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            <div>
              <label htmlFor="username" className="text-sm text-white/70">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="jane_travels"
                required
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
              <p className="mt-1 text-xs text-white/40">
                4-20 characters: lowercase letters, numbers, underscores.
              </p>
            </div>

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

            <div>
              <label htmlFor="password" className="text-sm text-white/70">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-sm text-white/70"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full bg-amber-500 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
                      <span className="h-px flex-1 bg-white/10" />
                      <span className="text-xs text-white/40">or sign up with</span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
          
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={loginWithGoogle}
                        className="flex items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </button>
                      <button
                        onClick={loginWithGitHub}
                        className="flex items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
                      >
                        <FaGithub className="h-4.5 w-4.5" />
                        Continue with GitHub
                      </button>
                    </div>

          <p className="mt-8 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

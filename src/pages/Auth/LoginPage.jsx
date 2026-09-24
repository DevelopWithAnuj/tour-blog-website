import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GitBranch } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import loginBg from '../../assets/login-bg.avif';

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

export default function LoginPage() {
  const { login, loginWithGoogle, loginWithGitHub } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center bg-slate-950 px-6 py-12 md:px-12">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="font-display text-2xl font-semibold text-white"
          >
            Drimora
          </Link>

          <h1 className="mt-10 font-display text-3xl text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Sign in to manage your bookings and trips.
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
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full bg-amber-500 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/40">or continue with</span>
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
              <GitBranch className="h-4.5 w-4.5" />
              Continue with GitHub
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-white/50">
            New to Drimora?{' '}
            <span className="text-white/80">Sign-up is coming soon.</span>
          </p>
        </div>
      </div>

      {/* Right: destination image */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={loginBg}
          alt="A scenic travel destination"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="font-display text-2xl text-white">
            Your next journey starts here.
          </p>
          <p className="mt-2 text-sm text-white/70">
            Curated tours, real experiences, no guesswork.
          </p>
        </div>
      </div>
    </div>
  );
}

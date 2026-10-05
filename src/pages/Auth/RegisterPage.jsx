import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  AuthError,
  AuthShell,
  Divider,
  PasswordInput,
  SocialButtons,
  StatusScreen,
  SubmitButton,
  inputClass,
} from '../../components/AuthParts.jsx';

const USERNAME_PATTERN = /^[a-z0-9_]{4,20}$/;

export default function RegisterPage() {
  const { user, register, loginWithGoogle, loginWithGitHub } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(null);

  if (user) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
        replace
      />
    );
  }

  const validate = () => {
    if (!email.trim()) return 'Email is required.';
    if (!USERNAME_PATTERN.test(username)) {
      return 'Username must be 4 to 20 characters: lowercase letters, numbers or underscores.';
    }
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    setError(problem);
    if (problem) return;

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

  if (submittedEmail) {
    return (
      <AuthShell
        title="Start planning your next trip."
        subtitle="Save trips, track bookings and more."
      >
        <StatusScreen
          icon={MailCheck}
          title="Check your inbox"
          action={
            <Link
              to="/login"
              className="mt-8 block rounded-full bg-amber-500 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98]"
            >
              Back to sign in
            </Link>
          }
        >
          <p>
            We sent a verification link to{' '}
            <span className="text-white">{submittedEmail}</span>. Verify your
            email to activate your account, then sign in.
          </p>
        </StatusScreen>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Start planning your next trip."
      subtitle="Create an account to save trips, track bookings and more."
    >
      <h1 className="font-display text-4xl text-white">Create your account</h1>
      <p className="mt-2 text-white/60">
        Join Drimora to book tours and share travel stories.
      </p>

      <AuthError>{error}</AuthError>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="fullName" className="text-sm text-white/70">
            Full name <span className="text-white/40">(optional)</span>
          </label>
          <input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Traveller"
            autoComplete="name"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="username" className="text-sm text-white/70">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="jane_travels"
            autoComplete="username"
            required
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-white/40">
            4 to 20 characters: letters, numbers, underscores.
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
          placeholder="At least 6 characters"
          autoComplete="new-password"
          showStrength
          visible={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
        />

        <div>
          <label htmlFor="confirmPassword" className="text-sm text-white/70">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </div>

        <SubmitButton loading={submitting} loadingText="Creating account…">
          Create account
        </SubmitButton>
      </form>

      <Divider>or sign up with</Divider>
      <SocialButtons onGoogle={loginWithGoogle} onGitHub={loginWithGitHub} />

      <p className="mt-8 text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link to="/login" className="text-amber-400 hover:text-amber-300">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

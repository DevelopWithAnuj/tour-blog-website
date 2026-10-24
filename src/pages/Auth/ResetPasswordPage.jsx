import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  AuthError,
  AuthShell,
  PasswordInput,
  StatusScreen,
  SubmitButton,
  inputClass,
} from '../../components/AuthParts.jsx';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { resetToken } = useParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;

    const redirectTimer = window.setTimeout(() => navigate('/login'), 2000);
    return () => window.clearTimeout(redirectTimer);
  }, [done, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(resetToken, newPassword);
      setDone(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'This reset link is invalid or has expired. Please request a new one.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthShell
        title="Back on the road soon."
        subtitle="Your account is ready for the next journey."
      >
        <StatusScreen icon={CheckCircle2} tone="emerald" title="Password reset">
          <p>Redirecting you to sign in…</p>
        </StatusScreen>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Back on the road soon."
      subtitle="Choose a new password to get back to planning."
    >
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <h1 className="mt-8 font-display text-4xl text-white">
        Reset your password
      </h1>
      <p className="mt-2 text-white/60">
        Choose a new password for your account.
      </p>

      <AuthError>{error}</AuthError>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <PasswordInput
          id="newPassword"
          label="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          showStrength
          visible={showPassword}
          onToggle={() => setShowPassword((visible) => !visible)}
        />

        <div>
          <label htmlFor="confirmPassword" className="text-sm text-white/70">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </div>

        <SubmitButton loading={submitting} loadingText="Resetting…">
          Reset password
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

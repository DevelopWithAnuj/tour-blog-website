import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MailCheck } from 'lucide-react';
import {
  AuthError,
  AuthShell,
  StatusScreen,
  SubmitButton,
} from '@/components/AuthParts';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await axios.post(
        `/api/v1/auth/verify-email/${encodeURIComponent(token)}`
      );
      navigate('/login?verified=1', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'We could not verify this link. Please try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="One last step."
      subtitle="Confirm your email to activate your account."
    >
      <form onSubmit={handleSubmit}>
        <StatusScreen icon={MailCheck} title="Confirm your email">
          <p>Press the button below to verify your email address.</p>
        </StatusScreen>

        <AuthError>{error}</AuthError>

        <div className="mt-8 flex flex-col">
          <SubmitButton loading={submitting} loadingText="Verifying...">
            Verify my email
          </SubmitButton>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-white/50">
        Already verified?{' '}
        <Link to="/login" className="text-amber-400 hover:text-amber-300">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

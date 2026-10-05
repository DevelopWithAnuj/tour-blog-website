import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

export const inputClass =
  'mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20';

export function GoogleIcon(props) {
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

/** Form on the left, photo on the right. Pulled up under the transparent header. */
export function AuthShell({
  children,
  image = '/img/login-hero.png',
  title = 'Your next journey starts here.',
  subtitle = 'Curated tours, real experiences, no guesswork.',
}) {
  return (
    <div className="-mt-22 grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 pb-12 pt-32 md:px-12">
        <div className="w-full max-w-sm animate-fade-up">{children}</div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/15 to-slate-950/30" />
        <div className="absolute inset-x-10 bottom-12">
          <p className="max-w-md font-display text-4xl leading-tight text-white">
            {title}
          </p>
          <p className="mt-3 text-white/70">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

/** Round icon + heading + text, used by the "check your inbox" style screens. */
export function StatusScreen({
  icon: Icon,
  tone = 'amber',
  title,
  children,
  action,
}) {
  const tones = {
    amber: 'bg-amber-500/15 text-amber-400',
    emerald: 'bg-emerald-400/15 text-emerald-400',
  };
  return (
    <div className="text-center">
      <span
        className={`mx-auto flex h-16 w-16 animate-scale-in items-center justify-center rounded-full ${tones[tone]}`}
      >
        <Icon className="h-8 w-8" />
      </span>
      <h1 className="mt-6 font-display text-3xl text-white">{title}</h1>
      <div className="mt-3 text-white/60">{children}</div>
      {action}
    </div>
  );
}

export function AuthError({ children }) {
  if (!children) return null;
  return (
    <p
      key={children}
      role="alert"
      className="mt-6 animate-shake rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
    >
      {children}
    </p>
  );
}

export function SubmitButton({ loading, loadingText, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 flex items-center justify-center gap-2 rounded-full bg-amber-500 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98] disabled:opacity-70"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </button>
  );
}

function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH = [
  { label: 'Too short', bar: 'bg-rose-400' },
  { label: 'Weak', bar: 'bg-rose-400' },
  { label: 'Okay', bar: 'bg-amber-400' },
  { label: 'Good', bar: 'bg-emerald-400' },
  { label: 'Strong', bar: 'bg-emerald-400' },
];

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete,
  labelRight,
  showStrength = false,
  visible: controlledVisible,
  onToggle,
}) {
  const [localVisible, setLocalVisible] = useState(false);
  const visible = controlledVisible ?? localVisible;
  const toggle = onToggle ?? (() => setLocalVisible((v) => !v));
  const score = passwordScore(value);
  const strength =
    value.length < 6 ? STRENGTH[0] : STRENGTH[Math.max(score, 1)];

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm text-white/70">
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/50 transition hover:text-white"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {showStrength && value && (
        <div className="mt-2" aria-live="polite">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  value.length >= 6 && score >= n ? strength.bar : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-white/45">{strength.label}</p>
        </div>
      )}
    </div>
  );
}

export function SocialButtons({
  onGoogle,
  onGitHub,
  prefix = 'Continue with',
}) {
  const base =
    'flex items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-3 text-sm text-white transition hover:bg-white/10 active:scale-[0.98]';
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={onGoogle} className={base}>
        <GoogleIcon />
        Google
      </button>
      <button type="button" onClick={onGitHub} className={base}>
        <FaGithub className="h-4.5 w-4.5" />
        GitHub
      </button>
    </div>
  );
}

export function Divider({ children }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-xs text-white/40">{children}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

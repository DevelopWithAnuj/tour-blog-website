const TONES = {
  dark: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  light: 'border-rose-200 bg-rose-50 text-rose-800',
};

export default function LoadError({ message, onRetry, tone = 'dark' }) {
  return (
    <div
      role="alert"
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5 text-sm ${TONES[tone]}`}
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-current px-4 py-1.5 font-semibold transition hover:bg-black/5 active:scale-[0.97]"
        >
          Try again
        </button>
      )}
    </div>
  );
}

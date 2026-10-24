import { useServerStatus } from '../context/ServerStatusContext.jsx';

export default function ServerBanner() {
  const { status, retrying, retry } = useServerStatus();
  if (status !== 'down') return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-3 border-b border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-200"
    >
      {' '}
      <span>
        We can't reach the server right now. Tours, bookings and sign-in may not
        load.
      </span>
      <button
        type="button"
        onClick={retry}
        disabled={retrying}
        className="rounded-full border border-amber-300/50 px-3 py-1 font-semibold transition hover:bg-amber-300/10 disabled:opacity-60"
      >
        {retrying ? 'checking...' : 'Retry'}
      </button>
    </div>
  );
}

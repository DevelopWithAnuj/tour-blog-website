export default function ServerUnavailablePage({ onRetry, retrying }) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full text-center bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 text-3xl">
          ⚠
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Server unavailable
        </h1>
        <p className="text-white/60 text-sm mb-6">
          We can't reach the Drimora server or database right now. This is
          usually temporary — please try again in a moment.
        </p>
        <button
          onClick={onRetry}
          disabled={retrying}
          className="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {retrying ? 'Checking…' : 'Try again'}
        </button>
      </div>
    </section>
  );
}

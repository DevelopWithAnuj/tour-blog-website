import { ArrowLeft, Compass, House } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-16 text-white">
      <section className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
          Error 404
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
          This path isn’t on the map.
        </h1>
        <p className="mx-auto mt-5 max-w-md leading-relaxed text-white/60">
          The page may have moved, or the address may be mistyped. Let’s get you
          back to somewhere useful.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            <House className="h-4 w-4" aria-hidden="true" />
            Go home
          </Link>
          <Link
            to="/tours"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:border-amber-300/70 hover:text-amber-200"
          >
            Explore tours
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/75 transition hover:border-white/40 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Go back
          </button>
        </div>
      </section>
    </main>
  );
}

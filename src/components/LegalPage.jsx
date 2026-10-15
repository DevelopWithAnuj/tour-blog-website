import { Link } from 'react-router-dom';
import { LEGAL_UPDATED, SITE } from '../config/site.js';
import { PageHero } from './InfoParts.jsx';

const formatted = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function LegalPage({ title, intro, sections }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title}>
        {intro}
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-8">
        <p className="text-sm text-white/50">
          Last updated{' '}
          <time dateTime={LEGAL_UPDATED}>{formatted(LEGAL_UPDATED)}</time>
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-[14rem_1fr]">
          <nav aria-label="On this page" className="hidden lg:block">
            <ul className="sticky top-28 space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-white/55 transition hover:text-amber-300"
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl space-y-12">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="font-display text-2xl text-white">{s.heading}</h2>
                <div className="mt-4 space-y-4 leading-relaxed text-white/70">
                  {s.paragraphs?.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  {s.items && (
                    <ul className="list-disc space-y-2 pl-5 marker:text-amber-400">
                      {s.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}

            <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <h2 className="font-display text-xl text-white">Questions?</h2>
              <p className="mt-2 text-white/65">
                Email{' '}
                <a
                  href={`mailto:${SITE.supportEmail}`}
                  className="text-amber-400 hover:text-amber-300"
                >
                  {SITE.supportEmail}
                </a>{' '}
                or use our{' '}
                <Link to="/contact" className="text-amber-400 hover:text-amber-300">
                  contact page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

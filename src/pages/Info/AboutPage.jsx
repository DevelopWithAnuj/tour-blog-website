import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Headset,
  Search,
  ShieldCheck,
} from 'lucide-react';
import Reveal from '../../components/Reveal.jsx';
import { PageHero } from '../../components/InfoParts.jsx';

const WHAT_WE_DO = [
  {
    icon: Search,
    title: 'Discover',
    text: 'Browse hand-built tours by style, destination and price, with the itinerary laid out day by day.',
  },
  {
    icon: Compass,
    title: 'Book',
    text: 'A short booking flow with the inclusions and exclusions shown up front, so there are no surprises at checkout.',
  },
  {
    icon: BookOpen,
    title: 'Read',
    text: 'Guides, itineraries and honest trip notes from the road to help you plan before you go.',
  },
];

const PROMISES = [
  {
    icon: Compass,
    title: 'Routes we have walked',
    text: 'Every itinerary is planned by guides who know the place, not copied from a brochure.',
  },
  {
    icon: ShieldCheck,
    title: 'Clear prices',
    text: 'What is included and what is not is listed on every tour, before you book.',
  },
  {
    icon: Headset,
    title: 'Someone to call',
    text: 'If a flight moves or plans change, a real person helps you rebook.',
  },
];

export default function AboutPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get('/api/v1/tours/destinations', { signal: controller.signal })
      .then((res) => {
        const d = res.data.data.destinations;
        setStats({
          destinations: d.length,
          tours: d.reduce((sum, x) => sum + x.count, 0),
        });
      })
      .catch(() => {}); // stats are decoration; hide them on failure
    return () => controller.abort();
  }, []);

  return (
    <>
      <PageHero
        eyebrow="About Drimora"
        title="Tours built around the place, not the brochure."
      >
        Drimora is a travel platform for discovering, booking and sharing trips:
        hand-built tours across fjords, old cities and coastlines, with guides,
        stays and transfers already sorted.
      </PageHero>

      <div className="mx-auto max-w-7xl space-y-24 px-4 pb-24 pt-14 md:px-8">
        <section>
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl">
              What you can do here
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {WHAT_WE_DO.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="h-full rounded-3xl border border-white/10 bg-slate-900 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-xl">{title}</h3>
                  <p className="mt-2 text-white/60">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {stats && (
          <Reveal>
            <section
              aria-label="Drimora in numbers"
              className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center sm:grid-cols-2"
            >
              <div>
                <p className="font-display text-5xl text-amber-400">
                  {stats.destinations}
                </p>
                <p className="mt-1 text-white/60">
                  {stats.destinations === 1 ? 'destination' : 'destinations'}
                </p>
              </div>
              <div>
                <p className="font-display text-5xl text-amber-400">
                  {stats.tours}
                </p>
                <p className="mt-1 text-white/60">
                  {stats.tours === 1
                    ? 'tour open for booking'
                    : 'tours open for booking'}
                </p>
              </div>
            </section>
          </Reveal>
        )}

        <section>
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl">How we work</h2>
          </Reveal>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {PROMISES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl">{title}</h3>
                    <p className="mt-2 text-white/60">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal>
          <section className="text-center">
            <h2 className="mx-auto max-w-2xl font-display text-3xl sm:text-4xl">
              Ready when you are.
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/tours"
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
              >
                Browse tours <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-white transition hover:border-amber-400/70 hover:text-amber-300"
              >
                Get in touch
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { PageHero } from '../../components/InfoParts.jsx';

const STATUS_LABELS = {
  new: 'New',
  under_review: 'Under review',
  resolved: 'Resolved',
};

function formatDate(value) {
  const date = new Date(value);
  return !value || Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
}

export default function InquiryTrackerPage() {
  const { token } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    axios
      .get(`/api/v1/contact/track/${encodeURIComponent(token)}`, {
        signal: controller.signal,
      })
      .then((response) => setInquiry(response.data.data.inquiry))
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError(
            err.response?.data?.message ||
              'We could not load this inquiry. Check the link and try again.'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, attempt]);

  return (
    <>
      <PageHero eyebrow="Support" title="Track your inquiry">
        Check the latest status and updates from our team.
      </PageHero>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-8">
        {loading ? (
          <p className="text-white/60">Loading inquiry…</p>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-6 text-rose-200"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setAttempt((current) => current + 1)}
              className="mt-4 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : (
          <article className="rounded-2xl border border-white/10 bg-slate-900 p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                  {inquiry.type} inquiry
                </p>
                <h1 className="mt-2 font-display text-2xl">
                  {inquiry.subject}
                </h1>
              </div>
              <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-sm font-semibold text-amber-200">
                {STATUS_LABELS[inquiry.status] || inquiry.status}
              </span>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
              {inquiry.message}
            </p>
            <p className="mt-4 text-xs text-white/45">
              Submitted {formatDate(inquiry.createdAt)}
            </p>

            <section className="mt-8 border-t border-white/10 pt-6">
              <h2 className="font-semibold">Updates</h2>
              {inquiry.statusHistory?.length ? (
                <ol className="mt-4 space-y-4">
                  {[...inquiry.statusHistory].reverse().map((update, index) => (
                    <li
                      key={`${update.status}-${update.createdAt}-${index}`}
                      className="border-l-2 border-amber-400/50 pl-4"
                    >
                      <p className="font-medium">
                        {STATUS_LABELS[update.status] || update.status}
                      </p>
                      <time
                        className="mt-1 block text-xs text-white/45"
                        dateTime={update.createdAt}
                      >
                        {formatDate(update.createdAt)}
                      </time>
                      {update.message && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                          {update.message}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-white/60">
                  Your request has been received. We will post updates here.
                </p>
              )}
            </section>
            <Link
              to="/contact"
              className="mt-8 inline-block text-sm font-semibold text-amber-400 hover:text-amber-300"
            >
              Contact us about something else
            </Link>
          </article>
        )}
      </main>
    </>
  );
}

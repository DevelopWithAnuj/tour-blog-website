import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Pager,
  PressButton,
  SkeletonRows,
} from '../../components/AdminParts.jsx';

const STATUS_OPTIONS = ['all', 'new', 'under_review', 'resolved'];
const TYPE_OPTIONS = ['all', 'general', 'support'];
const STATUS_LABELS = {
  new: 'New',
  under_review: 'Under review',
  resolved: 'Resolved',
};
const STATUS_TRANSITIONS = {
  new: ['under_review'],
  under_review: ['resolved'],
  resolved: ['under_review'],
};

function formatDate(value) {
  const date = new Date(value);
  return !value || Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [status, setStatus] = useState('new');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [nextStatuses, setNextStatuses] = useState({});
  const [resolutionMessages, setResolutionMessages] = useState({});
  const [error, setError] = useState('');

  const loadInquiries = useCallback(
    async (signal) => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('/api/v1/admin/inquiries', {
          params: { page, status, type },
          withCredentials: true,
          signal,
        });
        const result = response.data.data;
        const resultPages = result.pages || 1;
        setPages(resultPages);
        setTotal(result.total || 0);
        if (page > resultPages) {
          setPage(resultPages);
          return;
        }
        setInquiries(result.inquiries);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(
            err.response?.data?.message ||
              'Unable to load inquiries. Please try again.'
          );
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [page, status, type]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadInquiries(controller.signal);
    return () => controller.abort();
  }, [loadInquiries]);

  const updateStatus = async (inquiry) => {
    if (updatingId) return;
    const nextStatus = nextStatuses[inquiry._id] || inquiry.status;
    const resolutionMessage = resolutionMessages[inquiry._id] || '';
    if (nextStatus === inquiry.status) return;
    if (nextStatus === 'resolved' && resolutionMessage.trim().length < 5) {
      setError('Add a resolution message of at least 5 characters.');
      return;
    }
    setUpdatingId(inquiry._id);
    setError('');
    try {
      const updateResponse = await axios.patch(
        `/api/v1/admin/inquiries/${inquiry._id}/status`,
        { status: nextStatus, resolutionMessage },
        { withCredentials: true }
      );
      setNextStatuses((current) => {
        const next = { ...current };
        delete next[inquiry._id];
        return next;
      });
      setResolutionMessages((current) => {
        const next = { ...current };
        delete next[inquiry._id];
        return next;
      });
      const controller = new AbortController();
      await loadInquiries(controller.signal);
      if (!updateResponse.data.data.notificationSent) {
        setError(updateResponse.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to update inquiry status. Please try again.'
      );
    } finally {
      setUpdatingId('');
    }
  };

  const changeFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <section className="mx-auto w-full max-w-5xl p-4 text-slate-900 sm:p-6 lg:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-800">
        Administration
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Inquiries</h1>
      <p className="mt-2 text-sm text-slate-600">
        Review messages, update their status, and share resolution notes.
      </p>

      <Alert>{error}</Alert>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">
          Status
          <select
            value={status}
            onChange={changeFilter(setStatus)}
            disabled={Boolean(updatingId)}
            className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All statuses' : STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Type
          <select
            value={type}
            onChange={changeFilter(setType)}
            disabled={Boolean(updatingId)}
            className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All types' : option}
              </option>
            ))}
          </select>
        </label>
        <span className="ml-auto text-sm text-slate-500">
          {total} {total === 1 ? 'message' : 'messages'}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            <SkeletonRows label="Loading inquiries" />
          </div>
        ) : inquiries.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
            No inquiries match these filters.
          </p>
        ) : (
          inquiries.map((inquiry) => (
            <article
              key={inquiry._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {inquiry.subject}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {inquiry.name} ·{' '}
                    <a
                      className="text-amber-800 hover:underline"
                      href={`mailto:${inquiry.email}`}
                    >
                      {inquiry.email}
                    </a>
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {STATUS_LABELS[inquiry.status]} · {inquiry.type}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {inquiry.message}
              </p>
              {inquiry.statusHistory?.some((update) => update.message) && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <h3 className="text-sm font-semibold text-emerald-900">
                    Resolution message
                  </h3>
                  {[...inquiry.statusHistory]
                    .reverse()
                    .filter((update) => update.message)
                    .map((update, index) => (
                      <p
                        key={`${update.createdAt}-${index}`}
                        className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-emerald-900"
                      >
                        {update.message}
                      </p>
                    ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <time
                  className="text-xs text-slate-500"
                  dateTime={inquiry.createdAt}
                >
                  Received {formatDate(inquiry.createdAt)}
                </time>
                <div className="flex flex-wrap items-end gap-2">
                  <label className="text-xs font-medium text-slate-600">
                    Update status
                    <select
                      value={nextStatuses[inquiry._id] || inquiry.status}
                      disabled={Boolean(updatingId)}
                      onChange={(event) =>
                        setNextStatuses((current) => ({
                          ...current,
                          [inquiry._id]: event.target.value,
                        }))
                      }
                      className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      {[
                        inquiry.status,
                        ...(STATUS_TRANSITIONS[inquiry.status] || []),
                      ].map((option) => (
                        <option key={option} value={option}>
                          {STATUS_LABELS[option]}
                        </option>
                      ))}
                    </select>
                  </label>
                  {(nextStatuses[inquiry._id] || inquiry.status) ===
                    'resolved' &&
                    inquiry.status !== 'resolved' && (
                      <label className="min-w-56 flex-1 text-xs font-medium text-slate-600">
                        Resolution message (required)
                        <textarea
                          rows={2}
                          maxLength={2000}
                          required
                          value={resolutionMessages[inquiry._id] || ''}
                          onChange={(event) =>
                            setResolutionMessages((current) => ({
                              ...current,
                              [inquiry._id]: event.target.value,
                            }))
                          }
                          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>
                    )}
                  <PressButton
                    type="button"
                    disabled={
                      Boolean(updatingId) ||
                      (nextStatuses[inquiry._id] || inquiry.status) ===
                        inquiry.status ||
                      ((nextStatuses[inquiry._id] || inquiry.status) ===
                        'resolved' &&
                        inquiry.status !== 'resolved' &&
                        (resolutionMessages[inquiry._id] || '').trim().length <
                          5)
                    }
                    onClick={() => updateStatus(inquiry)}
                    className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60"
                  >
                    {updatingId === inquiry._id ? 'Updating…' : 'Save update'}
                  </PressButton>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      {!loading && !updatingId && (
        <Pager page={page} pages={pages} onChange={setPage} />
      )}
    </section>
  );
}

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Pager,
  PressButton,
  SkeletonRows,
} from '../../components/AdminParts.jsx';

const STATUS_OPTIONS = ['all', 'new', 'resolved'];
const TYPE_OPTIONS = ['all', 'general', 'support'];

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

  const updateStatus = async (inquiry, nextStatus) => {
    if (updatingId) return;
    setUpdatingId(inquiry._id);
    setError('');
    try {
      await axios.patch(
        `/api/v1/admin/inquiries/${inquiry._id}/status`,
        { status: nextStatus },
        { withCredentials: true }
      );
      const controller = new AbortController();
      await loadInquiries(controller.signal);
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
        Review and resolve contact and support messages.
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
                {option === 'all' ? 'All statuses' : option}
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
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                  {inquiry.status} · {inquiry.type}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {inquiry.message}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <time
                  className="text-xs text-slate-500"
                  dateTime={inquiry.createdAt}
                >
                  Received {formatDate(inquiry.createdAt)}
                </time>
                {inquiry.status === 'new' ? (
                  <PressButton
                    type="button"
                    disabled={Boolean(updatingId)}
                    onClick={() => updateStatus(inquiry, 'resolved')}
                    className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60"
                  >
                    {updatingId === inquiry._id ? 'Updating…' : 'Mark resolved'}
                  </PressButton>
                ) : (
                  <PressButton
                    type="button"
                    disabled={Boolean(updatingId)}
                    onClick={() => updateStatus(inquiry, 'new')}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-amber-600 disabled:opacity-60"
                  >
                    {updatingId === inquiry._id
                      ? 'Updating…'
                      : 'Reopen inquiry'}
                  </PressButton>
                )}
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

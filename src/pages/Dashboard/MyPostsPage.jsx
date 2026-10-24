import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PenLine, Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Alert,
  SkeletonRows,
  formatDate,
} from '../../components/AdminParts.jsx';
import { STATUS_META, StatusBadge } from '../../components/PostStatus.jsx';
import { useActionDialog } from '../../components/ActionDialog.jsx';

const btn =
  'inline-flex min-h-9 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50';

export default function MyPostsPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const { requestConfirmation, dialog } = useActionDialog();

  const load = useCallback(async (signal, { silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/v1/my-posts', { signal });
      setPosts(res.data.data.posts);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.response?.data?.message || 'Unable to load your stories.');
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const run = async (post, action) => {
    if (busyId) return;
    if (action === 'delete') {
      const confirmed = await requestConfirmation({
        title: 'Delete this story?',
        message: `Delete "${post.title}"?`,
        confirmLabel: 'Delete story',
        danger: true,
      });
      if (!confirmed) return;
    }
    setBusyId(post._id);
    try {
      const res =
        action === 'delete'
          ? await axios.delete(`/api/v1/my-posts/${post._id}`)
          : await axios.patch(`/api/v1/my-posts/${post._id}/submit`);
      toast(res.data.message, { type: 'success' });
      await load(new AbortController().signal, { silent: true });
    } catch (err) {
      toast(err.response?.data?.message || 'Action failed.', { type: 'error' });
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-800">
            Your stories
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold">
            My submissions
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Stories are reviewed by our team before they appear on the blog.
          </p>
        </div>
        <Link
          to="/my-posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-900"
        >
          <Plus className="h-4 w-4" /> Share a story
        </Link>
      </div>

      {error && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Alert>{error}</Alert>
          <button
            type="button"
            onClick={() => load(new AbortController().signal)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <SkeletonRows label="Loading your stories" count={3} />
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <PenLine className="h-7 w-7" />
            </span>
            <p className="mt-5 font-display text-2xl">No stories yet</p>
            <p className="mt-2 max-w-sm text-slate-600">
              Tell other travelers about a trip. We review every story before it
              goes live.
            </p>
          </div>
        ) : (
          posts.map((p) => {
            const busy = busyId === p._id;
            const editable = p.status !== 'published';
            return (
              <article
                key={p._id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-semibold">
                      {p.title}
                    </h2>
                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {p.category.replace(/-/g, ' ')}
                      {p.destination ? ` · ${p.destination}` : ''} · Updated{' '}
                      {formatDate(p.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {STATUS_META[p.status]?.hint}
                </p>
                {p.status === 'rejected' && p.reviewNote && (
                  <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                    Reviewer note: {p.reviewNote}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.status === 'published' && (
                    <Link to={`/blog/${p.slug}`} className={btn}>
                      View on blog
                    </Link>
                  )}
                  {editable && (
                    <Link to={`/my-posts/${p._id}/edit`} className={btn}>
                      Edit
                    </Link>
                  )}
                  {(p.status === 'draft' || p.status === 'rejected') && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(p, 'submit')}
                      className={btn}
                    >
                      {p.status === 'rejected'
                        ? 'Resubmit'
                        : 'Submit for review'}
                    </button>
                  )}
                  {editable && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(p, 'delete')}
                      className="inline-flex min-h-9 items-center rounded-lg border border-rose-300 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
      {dialog}
    </section>
  );
}

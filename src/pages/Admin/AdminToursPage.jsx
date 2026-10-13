import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Plus, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Alert,
  EASE,
  Pager,
  PressButton,
  PressLink,
  SkeletonRows,
  StatusPill,
  fadeUp,
  formatCurrency,
  rowVariants,
  stagger,
} from '../../components/AdminParts.jsx';

const STATUS_OPTIONS = ['all', 'active', 'inactive'];

export default function AdminToursPage() {
  const { toast } = useToast();
  const [tours, setTours] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  // silent: refresh data without swapping the table for the skeleton,
  // so rows that no longer match can animate out instead.
  const load = useCallback(
    async (signal, { silent = false } = {}) => {
      if (!silent) setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/v1/admin/tours', {
          params: { page, status, q: submittedSearch || undefined },
          signal,
        });
        setTours(res.data.data.tours);
        setPages(res.data.data.pages || 1);
        setTotal(res.data.data.total || 0);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err.response?.data?.message || 'Unable to load tours.');
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [page, status, submittedSearch]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const toggleActive = async (tour) => {
    if (busyId) return;
    if (
      tour.isActive &&
      !window.confirm(
        `Hide "${tour.title}" from the public site? Existing bookings are kept.`
      )
    ) {
      return;
    }
    setBusyId(tour._id);
    try {
      const res = await axios.patch(`/api/v1/admin/tours/${tour._id}/active`, {
        isActive: !tour.isActive,
      });
      toast(res.data.message, { type: 'success' });
      await load(new AbortController().signal, { silent: true });
    } catch (err) {
      toast(err.response?.data?.message || 'Unable to update tour.', {
        type: 'error',
      });
    } finally {
      setBusyId('');
    }
  };

  const tableKey = `${status}|${submittedSearch}|${page}`;

  return (
    <MotionConfig reducedMotion="user">
      <section className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <motion.div variants={fadeUp}>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-800">
              Administration
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-slate-900">
              Tour management
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              <motion.span
                key={total}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {total}
              </motion.span>{' '}
              {total === 1 ? 'tour' : 'tours'}
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <PressLink
              to="/admin-tours/new"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-900"
            >
              <Plus className="h-4 w-4" /> New tour
            </PressLink>
          </motion.div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: EASE }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSubmittedSearch(search.trim());
          }}
        >
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 transition-colors focus-within:border-amber-600">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, destination or location"
              aria-label="Search tours"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            aria-label="Filter by status"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o === 'all' ? 'All tours' : o[0].toUpperCase() + o.slice(1)}
              </option>
            ))}
          </select>
          <PressButton
            type="submit"
            className="rounded-lg bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-900"
          >
            Search
          </PressButton>
        </motion.form>

        <Alert>{error}</Alert>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
          className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <SkeletonRows key="loading" label="Loading tours" />
            ) : tours.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="px-5 py-14 text-center text-sm text-slate-500"
              >
                No tours match these filters.
              </motion.p>
            ) : (
              <motion.div
                key={tableKey}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-x-auto"
              >
                <table className="w-full min-w-3xl text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Tour</th>
                      <th className="px-5 py-3 font-semibold">Category</th>
                      <th className="px-5 py-3 font-semibold">Duration</th>
                      <th className="px-5 py-3 font-semibold">Price</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={stagger(0.05)}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-slate-100"
                  >
                    <AnimatePresence>
                      {tours.map((t) => (
                        <motion.tr
                          key={t._id}
                          variants={rowVariants}
                          exit={{
                            opacity: 0,
                            x: -24,
                            transition: { duration: 0.2 },
                          }}
                          className="transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-900 font-display">
                              {t.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {t.location}
                            </p>
                          </td>
                          <td className="px-5 py-4 capitalize text-slate-600">
                            {t.category}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {t.duration}
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {formatCurrency(t.price)}
                          </td>
                          <td className="px-5 py-4">
                            <StatusPill
                              on={t.isActive}
                              onLabel="Active"
                              offLabel="Hidden"
                            />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <PressLink
                                to={`/admin-tours/${t._id}/edit`}
                                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-amber-500"
                              >
                                Edit
                              </PressLink>
                              <PressButton
                                type="button"
                                disabled={busyId === t._id}
                                onClick={() => toggleActive(t)}
                                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                              >
                                {t.isActive ? 'Hide' : 'Activate'}
                              </PressButton>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </motion.tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!loading && <Pager page={page} pages={pages} onChange={setPage} />}
      </section>
    </MotionConfig>
  );
}

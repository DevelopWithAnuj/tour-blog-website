import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Users,
} from 'lucide-react';
import {
  Alert,
  EASE,
  PressLink,
  fadeUp,
  rowVariants,
  stagger,
} from '../../components/AdminParts.jsx';

const statCards = [
  { key: 'totalBookings', label: 'Total bookings', icon: CalendarDays },
  { key: 'pendingBookings', label: 'Pending', icon: Clock3 },
  { key: 'confirmedBookings', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'totalUsers', label: 'Registered users', icon: Users },
  { key: 'totalBlogs', label: 'Blog stories', icon: BookOpen },
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

function formatCurrency(value) {
  return typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : '—';
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get('/api/v1/admin/dashboard', {
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => setData(res.data.data))
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError(
            err.response?.data?.message ||
              'Unable to load admin dashboard. Please try again.'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <section className="admin-dashboard-page mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
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
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Booking, user, and blog activity at a glance.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            <PressLink
              to="/admin-bookings"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900"
            >
              Manage bookings <ArrowRight className="h-4 w-4" />
            </PressLink>
            <PressLink
              to="/admin-users"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-amber-500"
            >
              View users
            </PressLink>
          </motion.div>
        </motion.div>

        <Alert>{error}</Alert>

        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
              aria-label="Loading dashboard"
            >
              {statCards.map(({ key }, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.06,
                    ease: EASE,
                  }}
                  className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <motion.div
                variants={stagger(0.06, 0.05)}
                initial="hidden"
                animate="visible"
                className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
              >
                {statCards.map(({ key, label, icon: Icon }) => (
                  <motion.article
                    key={key}
                    variants={fadeUp}
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-600">
                        {label}
                      </p>
                      <span className="rounded-lg bg-amber-50 p-2 text-amber-800">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <motion.p
                      key={data?.stats?.[key] ?? 0}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="mt-3 font-display text-3xl font-semibold text-slate-900"
                    >
                      {data?.stats?.[key] ?? 0}
                    </motion.p>
                  </motion.article>
                ))}
              </motion.div>

              <motion.div
                variants={stagger(0.08)}
                initial="hidden"
                animate="visible"
                className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]"
              >
                <motion.section
                  variants={fadeUp}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Recent bookings
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Latest booking activity across the platform.
                      </p>
                    </div>
                    <Link
                      to="/admin-bookings"
                      className="shrink-0 text-sm font-semibold text-amber-800 hover:text-amber-950"
                    >
                      View all
                    </Link>
                  </div>
                  {(data?.recentBookings || []).length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-slate-500">
                      No bookings yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-152 text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-5 py-3 font-semibold">
                              Traveller
                            </th>
                            <th className="px-5 py-3 font-semibold">Tour</th>
                            <th className="px-5 py-3 font-semibold">
                              Travel date
                            </th>
                            <th className="px-5 py-3 font-semibold">Status</th>
                            <th className="px-5 py-3 text-right font-semibold">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <motion.tbody
                          variants={stagger(0.04, 0.1)}
                          initial="hidden"
                          animate="visible"
                          className="divide-y divide-slate-100"
                        >
                          {data.recentBookings.map((booking) => (
                            <motion.tr
                              key={booking._id}
                              variants={rowVariants}
                              className="transition-colors hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-3">
                                <p className="font-medium text-slate-900">
                                  {booking.travelerName || 'Traveller'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {booking.travelerEmail}
                                </p>
                              </td>
                              <td className="px-5 py-3 text-slate-700">
                                {booking.tour?.title ||
                                  booking.tour?.destination ||
                                  'Tour unavailable'}
                              </td>
                              <td className="px-5 py-3 text-slate-600">
                                {formatDate(booking.date)}
                              </td>
                              <td className="px-5 py-3">
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                                  {booking.status}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right font-medium text-slate-900">
                                {formatCurrency(booking.totalAmount)}
                              </td>
                            </motion.tr>
                          ))}
                        </motion.tbody>
                      </table>
                    </div>
                  )}
                </motion.section>

                <motion.aside
                  variants={fadeUp}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h2 className="font-semibold text-slate-900">
                    Blog overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Content counts from the travel stories collection.
                  </p>
                  <dl className="mt-5 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-slate-600">Published</dt>
                      <dd className="font-semibold text-slate-900">
                        {data?.stats?.publishedBlogs ?? 0}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-slate-600">Drafts</dt>
                      <dd className="font-semibold text-slate-900">
                        {Math.max(
                          0,
                          (data?.stats?.totalBlogs ?? 0) -
                            (data?.stats?.publishedBlogs ?? 0)
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-slate-600">
                        Cancelled bookings
                      </dt>
                      <dd className="font-semibold text-slate-900">
                        {data?.stats?.cancelledBookings ?? 0}
                      </dd>
                    </div>
                  </dl>
                </motion.aside>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}

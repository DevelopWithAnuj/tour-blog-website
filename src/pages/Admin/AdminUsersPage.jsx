import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Alert,
  EASE,
  Pager,
  PressButton,
  SkeletonRows,
  fadeUp,
  rowVariants,
  stagger,
} from '../../components/AdminParts.jsx';

const ROLE_OPTIONS = ['all', 'user', 'admin'];

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: me } = useAuth();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState('');

  const changeRole = async (target, nextRole) => {
    if (target.role === nextRole || updatingId) return;
    if (
      !window.confirm(
        `Make ${target.fullName || target.username} ${
          nextRole === 'admin' ? 'an admin' : 'a regular user'
        }?`
      )
    ) {
      return;
    }
    setUpdatingId(target._id);
    try {
      const res = await axios.patch(`/api/v1/admin/users/${target._id}/role`, {
        role: nextRole,
      });
      const updated = res.data.data.user;
      setUsers((current) =>
        current.map((u) => (u._id === updated._id ? updated : u))
      );
      toast(res.data.message, { type: 'success' });
    } catch (err) {
      toast(err.response?.data?.message || 'Unable to change role.', {
        type: 'error',
      });
    } finally {
      setUpdatingId('');
    }
  };

  const loadUsers = useCallback(
    async (signal) => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/v1/admin/users', {
          params: { page, role, q: submittedSearch || undefined },
          withCredentials: true,
          signal,
        });
        setUsers(res.data.data.users);
        setPages(res.data.data.pages || 1);
        setTotal(res.data.data.total || 0);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(
            err.response?.data?.message ||
              'Unable to load users. Please try again.'
          );
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [page, role, submittedSearch]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadUsers(controller.signal);
    return () => controller.abort();
  }, [loadUsers]);

  return (
    <MotionConfig reducedMotion="user">
      <section className="admin-users-page mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
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
              User management
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Browse registered accounts and their platform roles.
            </p>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="text-sm font-medium text-slate-600"
          >
            <motion.span
              key={total}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="inline-block"
            >
              {total}
            </motion.span>{' '}
            {total === 1 ? 'user' : 'users'}
          </motion.p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: EASE }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSubmittedSearch(search.trim());
          }}
        >
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-amber-600">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, username, or email"
              aria-label="Search users"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
          <select
            value={role}
            onChange={(event) => {
              setPage(1);
              setRole(event.target.value);
            }}
            aria-label="Filter by role"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === 'all'
                  ? 'All roles'
                  : `${option[0].toUpperCase()}${option.slice(1)}`}
              </option>
            ))}
          </select>
          <PressButton
            type="submit"
            className="rounded-lg bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900"
          >
            Search
          </PressButton>
        </motion.form>

        <Alert>{error}</Alert>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: EASE }}
          className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <SkeletonRows key="loading" label="Loading users" />
            ) : users.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="px-5 py-14 text-center text-sm text-slate-500"
              >
                No users match these filters.
              </motion.p>
            ) : (
              <motion.div
                key={`${role}|${submittedSearch}|${page}`}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-x-auto"
              >
                <table className="w-full min-w-2xl text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Username</th>
                      <th className="px-5 py-3 font-semibold">Email</th>
                      <th className="px-5 py-3 font-semibold">Role</th>
                      <th className="px-5 py-3 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={stagger(0.04)}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-slate-100"
                  >
                    <AnimatePresence>
                      {users.map((user) => (
                        <motion.tr
                          key={user._id}
                          variants={rowVariants}
                          exit={{
                            opacity: 0,
                            x: -16,
                            transition: { duration: 0.18 },
                          }}
                          className="transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {user.fullName || '—'}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {user.username ? `@${user.username}` : '—'}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {user.email}
                          </td>
                          <td className="px-5 py-4">
                            <select
                              aria-label={`Role for ${user.fullName || user.username}`}
                              value={user.role}
                              disabled={
                                user._id === me?._id || updatingId === user._id
                              }
                              title={
                                user._id === me?._id
                                  ? 'You cannot change your own role'
                                  : undefined
                              }
                              onChange={(e) => changeRole(user, e.target.value)}
                              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs capitalize text-slate-700 disabled:bg-slate-100 disabled:text-slate-500"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {formatDate(user.createdAt)}
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

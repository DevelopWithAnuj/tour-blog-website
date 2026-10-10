import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

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
    <section className="admin-users-page mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-800">
            Administration
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-slate-900">
            User management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse registered accounts and their platform roles.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-600">
          {total} {total === 1 ? 'user' : 'users'}
        </p>
      </div>

      <form
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
        <button
          type="submit"
          className="rounded-lg bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900"
        >
          Search
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5" aria-label="Loading users">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-14 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-slate-500">
            No users match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Username</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {user.fullName || '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {user.username ? `@${user.username}` : '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && pages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

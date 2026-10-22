import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, AsteriskIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { Alert, Field, inputCls } from '../../components/AdminParts.jsx';
import { categoryLabel } from '../Blog/BlogPage.jsx';

const EMPTY = {
  title: '', category: '', destination: '', excerpt: '', coverImage: '', images: '', content: '',
};

const lines = (v) => v.split('\n').map((l) => l.trim()).filter(Boolean);

const apiMessage = (err) => {
  const first = err.response?.data?.errors?.[0];
  return (first && Object.values(first)[0]) || err.response?.data?.message || 'Something went wrong.';
};

export default function MyPostFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get('/api/v1/blogs/categories', { signal: controller.signal })
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const controller = new AbortController();
    axios
      .get(`/api/v1/my-posts/${id}`, { signal: controller.signal })
      .then((res) => {
        const p = res.data.data.post;
        if (p.status === 'published') setLocked(true);
        setForm({
          title: p.title || '',
          category: p.category || '',
          destination: p.destination || '',
          excerpt: p.excerpt || '',
          coverImage: p.coverImage || '',
          images: (p.images || []).join('\n'),
          content: p.content || '',
        });
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setError(apiMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, isEdit]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (status) => {
    if (saving) return;
    setError('');
    setSaving(status);
    try {
      const payload = { ...form, images: lines(form.images), status };
      if (isEdit) await axios.put(`/api/v1/my-posts/${id}`, payload);
      else await axios.post('/api/v1/my-posts', payload);
      toast(status === 'pending' ? 'Submitted for review.' : 'Draft saved.', { type: 'success' });
      navigate('/my-posts');
    } catch (err) {
      setError(apiMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving('');
    }
  };

  const busy = Boolean(saving);
  const primary =
    'inline-flex items-center gap-2 rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60';
  const secondary =
    'inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60';

  return (
    <section className="mx-auto w-full max-w-3xl p-4 text-slate-900 sm:p-6 lg:p-8">
      <Link
        to="/my-posts"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> My submissions
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold">
        {isEdit ? 'Edit your story' : 'Share a story'}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Save a draft any time. Once you submit, our team reviews it before it
        appears on the blog.
      </p>

      <Alert>{error}</Alert>

      {loading ? (
        <div
          className="mt-6 h-96 animate-pulse rounded-xl bg-white"
          aria-label="Loading story"
        />
      ) : locked ? (
        <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-700">
          This story is published and can no longer be edited. Contact support
          if you need a change.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save('pending');
          }}
          className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <Field label="Title" htmlFor="title">
            <input
              id="title"
              value={form.title}
              onChange={set('title')}
              required
              maxLength={150}
              placeholder="The Night I Finally Saw the Northern Lights"
              className={inputCls}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Category" htmlFor="category">
              <select
                id="category"
                value={form.category}
                onChange={set('category')}
                required
                className={inputCls}
              >
                <option value="">Select a category</option>
                {categories.map(({ name }) => (
                  <option key={name} value={name}>
                    {categoryLabel(name)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Destination (optional)" htmlFor="destination">
              <input
                id="destination"
                value={form.destination}
                onChange={set('destination')}
                maxLength={80}
                placeholder="Norway(place name...)"
                className={inputCls}
              />
            </Field>
          </div>

          <Field
            label={`Excerpt (${form.excerpt.length}/400)`}
            htmlFor="excerpt"
          >
            <textarea
              id="excerpt"
              rows={2}
              value={form.excerpt}
              onChange={set('excerpt')}
              required
              maxLength={400}
              placeholder="Three cold nights, one clear sky, and a lesson in patience."
              className={inputCls}
            />
          </Field>

          <Field label="Cover image URL (optional)" htmlFor="coverImage">
            <input
              id="coverImage"
              value={form.coverImage}
              onChange={set('coverImage')}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>

          <Field
            label="Gallery image URLs (optional, one per line, max 6)"
            htmlFor="images"
          >
            <textarea
              id="images"
              rows={3}
              value={form.images}
              onChange={set('images')}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>

          <Field label="Your story" htmlFor="content">
            <textarea
              id="content"
              rows={14}
              value={form.content}
              onChange={set('content')}
              required
              className={`${inputCls} leading-relaxed`}
              placeholder="Plain text. Leave a blank line between paragraphs."
            />
          </Field>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <button type="submit" disabled={busy} className={primary}>
              {saving === 'pending' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {saving === 'pending' ? 'Submitting…' : 'Submit for review'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => save('draft')}
              className={secondary}
            >
              {saving === 'draft' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {saving === 'draft' ? 'Saving…' : 'Save draft'}
            </button>
            <Link to="/my-posts" className={secondary}>
              Cancel
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}

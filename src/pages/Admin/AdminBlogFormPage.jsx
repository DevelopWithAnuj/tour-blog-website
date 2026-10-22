import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Alert,
  EASE,
  Field,
  PressButton,
  PressLink,
  fadeUp,
  inputCls,
  stagger,
} from '../../components/AdminParts.jsx';

function useBlogCategories() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get('/api/v1/blogs/categories', { signal: controller.signal })
      .then((response) => {
        const data = response.data?.data?.categories;
        if (!Array.isArray(data)) {
          throw new Error('Invalid categories response');
        }
        setCategories(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCategoriesError(
            error.response?.data?.message ||
              'We could not load blog categories. Check your connection and try again.'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { categories, categoriesLoading, categoriesError };
}

const EMPTY = {
  title: '',
  category: 'travel-guide',
  destination: '',
  excerpt: '',
  coverImage: '',
  images: '',
  content: '',
  status: 'draft',
};

const imageLines = (value) =>
  value
    .split('\n')
    .map((image) => image.trim())
    .filter(Boolean);

const apiMessage = (err) => {
  const first = err.response?.data?.errors?.[0];
  return (
    (first && Object.values(first)[0]) ||
    err.response?.data?.message ||
    'Something went wrong.'
  );
};

function FormSkeleton() {
  return (
    <motion.div
      key="loading"
      aria-label="Loading post"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {[0, 1, 2, 3, 4].map((n) => (
        <div key={n} className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
          <div
            style={{ animationDelay: `${n * 120}ms` }}
            className={`animate-pulse rounded-lg bg-slate-100 ${
              n === 4 ? 'h-56' : n === 3 ? 'h-20' : 'h-11'
            }`}
          />
        </div>
      ))}
    </motion.div>
  );
}

export default function AdminBlogFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [isOwnPost, setIsOwnPost] = useState(!isEdit);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(''); 
  const [error, setError] = useState('');
  const { categories, categoriesLoading, categoriesError } =
    useBlogCategories();

  useEffect(() => {
    if (!isEdit) return;
    const controller = new AbortController();
    axios
      .get(`/api/v1/admin/blogs/${id}`, { signal: controller.signal })
      .then((res) => {
        const p = res.data.data.post;
        const authorId = p.author?._id ?? p.author;
        setIsOwnPost(String(authorId) === String(user?._id));
        setForm({
          title: p.title || '',
          category: p.category || 'travel-guide',
          destination: p.destination || '',
          excerpt: p.excerpt || '',
          coverImage: p.coverImage || '',
          images: (p.images || []).join('\n'),
          content: p.content || '',
          status: p.status || 'draft',
        });
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setError(apiMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, isEdit, user?._id]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (status) => {
    if (saving) return;
    setError('');
    setSaving(status);
    try {
      const payload = { ...form, images: imageLines(form.images), status };
      if (isEdit) await axios.put(`/api/v1/admin/blogs/${id}`, payload);
      else await axios.post('/api/v1/admin/blogs', payload);
      toast(status === 'published' ? 'Post published.' : 'Draft saved.', {
        type: 'success',
      });
      navigate('/admin-blog');
    } catch (err) {
      setError(apiMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    save(form.status); // Enter key keeps the current status
  };

  const busy = Boolean(saving);
  const primary =
    'inline-flex items-center gap-2 rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-900 disabled:opacity-60';
  const secondary =
    'inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60';

  return (
    <MotionConfig reducedMotion="user">
      <section className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <Link
            to="/admin-blog"
            className="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            All posts
          </Link>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
          className="mt-3 font-display text-3xl font-semibold text-slate-900"
        >
          {isEdit ? 'Edit post' : 'New post'}
        </motion.h1>

        <Alert>{error}</Alert>
        <Alert>{categoriesError}</Alert>

        <AnimatePresence mode="wait">
          {loading ? (
            <FormSkeleton key="loading" />
          ) : (
            <motion.form
              key="form"
              variants={stagger(0.05, 0.1)}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <Field label="Title" htmlFor="title">
                <input
                  id="title"
                  value={form.title}
                  onChange={set('title')}
                  required
                  maxLength={150}
                  className={inputCls}
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Category" htmlFor="category">
                  <select
                    id="category"
                    value={form.category}
                    onChange={set('category')}
                    disabled={categoriesLoading || categories.length === 0}
                    required
                    className={inputCls}
                  >
                    {categoriesLoading ? (
                      <option value="">Loading categories…</option>
                    ) : categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map(({ name }) => (
                        <option key={name} value={name} className="capitalize">
                          {name}
                        </option>
                      ))
                    )}
                  </select>
                </Field>
                <Field
                  label="Destination"
                  htmlFor="destination"
                  hint="Optional"
                >
                  <input
                    id="destination"
                    value={form.destination}
                    onChange={set('destination')}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field
                label="Excerpt"
                htmlFor="excerpt"
                hint={`${form.excerpt.length}/400`}
              >
                <textarea
                  id="excerpt"
                  rows={2}
                  value={form.excerpt}
                  onChange={set('excerpt')}
                  required
                  maxLength={400}
                  className={inputCls}
                />
              </Field>

              <Field
                label="Cover image"
                htmlFor="coverImage"
                hint="A /path under /public or a full http(s) URL"
              >
                <input
                  id="coverImage"
                  value={form.coverImage}
                  onChange={set('coverImage')}
                  placeholder="/img/tours/Norway/cover.jpg"
                  className={inputCls}
                />
              </Field>

              <Field
                label="Gallery images"
                htmlFor="images"
                hint="One /path or http(s) URL per line, up to 12 images"
              >
                <textarea
                  id="images"
                  rows={4}
                  value={form.images}
                  onChange={set('images')}
                  placeholder={
                    '/img/travel/photo-1.jpg\nhttps://example.com/photo-2.jpg'
                  }
                  className={inputCls}
                />
              </Field>

              <Field
                label="Content"
                htmlFor="content"
                hint="Plain text. Leave a blank line between paragraphs."
              >
                <textarea
                  id="content"
                  rows={14}
                  value={form.content}
                  onChange={set('content')}
                  required
                  className={`${inputCls} font-mono leading-relaxed`}
                />
              </Field>

              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-3 border-t border-slate-200 pt-5"
              >
                <PressButton
                  type="button"
                  disabled={busy}
                  onClick={() => save('published')}
                  className={primary}
                >
                  {saving === 'published' && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {saving === 'published'
                    ? 'Publishing…'
                    : form.status === 'published'
                      ? 'Save & keep published'
                      : 'Publish'}
                </PressButton>
                {isOwnPost && (
                  <PressButton
                    type="button"
                    disabled={busy}
                    onClick={() => save('draft')}
                    className={secondary}
                  >
                    {saving === 'draft' && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {saving === 'draft'
                      ? 'Saving…'
                      : form.status === 'published'
                        ? 'Move to drafts'
                        : 'Save draft'}
                  </PressButton>
                )}
                <PressLink to="/admin-blog" className={secondary}>
                  Cancel
                </PressLink>
              </motion.div>
            </motion.form>
          )}
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}

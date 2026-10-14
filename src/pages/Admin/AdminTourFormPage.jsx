import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast, useToast } from '../../context/ToastContext.jsx';
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

function useTourCategories() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get('/api/v1/tours/categories', { signal: controller.signal })
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
              'We could not load tour categories. Check your connection and try again.'
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
  destination: '',
  location: '',
  description: '',
  price: '',
  duration: '',
  category: 'adventure',
  image: '',
  images: '',
  inclusions: '',
  exclusions: '',
  itinerary: '',
  faq: '',
};

const lines = (s) =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const splitPair = (line) => {
  const i = line.indexOf('|');
  return i === -1
    ? [line.trim(), '']
    : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
};

const toPayload = (f) => ({
  title: f.title,
  destination: f.destination,
  location: f.location,
  description: f.description,
  price: f.price === '' ? undefined : Number(f.price),
  duration: f.duration,
  category: f.category,
  image: f.image,
  images: lines(f.images),
  inclusions: lines(f.inclusions),
  exclusions: lines(f.exclusions),
  itinerary: lines(f.itinerary).map((l, i) => {
    const [title, description] = splitPair(l);
    return { day: i + 1, title, description };
  }),
  faq: lines(f.faq).map((l) => {
    const [question, answer] = splitPair(l);
    return { question, answer };
  }),
});

const toForm = (t) => ({
  title: t.title || '',
  destination: t.destination || '',
  location: t.location || '',
  description: t.description || '',
  price: t.price ?? '',
  duration: t.duration || '',
  category: t.category || 'adventure',
  image: t.image || '',
  images: (t.images || []).join('\n'),
  inclusions: (t.inclusions || []).join('\n'),
  exclusions: (t.exclusions || []).join('\n'),
  itinerary: (t.itinerary || [])
    .map((d) => `${d.title} | ${d.description || ''}`)
    .join('\n'),
  faq: (t.faq || []).map((q) => `${q.question} | ${q.answer}`).join('\n'),
});

const apiMessage = (err) => {
  const first = err.response?.data?.errors?.[0];
  return (
    (first && Object.values(first)[0]) ||
    err.response?.data?.message ||
    err.message ||
    'Something went wrong.'
  );
};

function FormSkeleton() {
  return (
    <motion.div
      key="loading"
      aria-label="Loading tour"
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
              n === 2 ? 'h-24' : 'h-11'
            }`}
          />
        </div>
      ))}
    </motion.div>
  );
}

export default function AdminTourFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categories, categoriesLoading, categoriesError } =
    useTourCategories();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const controller = new AbortController();
    axios
      .get(`/api/v1/admin/tours/${id}`, { signal: controller.signal })
      .then((res) => setForm(toForm(res.data.data.tour)))
      .catch((err) => {
        if (!axios.isCancel(err)) setError(apiMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, isEdit]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (isEdit) await axios.put(`/api/v1/admin/tours/${id}`, payload);
      else await axios.post('/api/v1/admin/tours', payload);
      toast(isEdit ? 'Tour updated.' : 'Tour created.', { type: 'success' });
      navigate('/admin-tours');
    } catch (err) {
      setError(apiMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };
  return (
    <MotionConfig reducedMotion="user">
      <section className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <Link
            to="/admin-tours"
            className="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            All tours
          </Link>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
          className="mt-3 font-display text-3xl font-semibold text-slate-900"
        >
          {isEdit ? 'Edit tour' : 'New tour'}
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
                  maxLength={120}
                  className={inputCls}
                  placeholder="title, e.g. Fjords & Northern Lights"
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Destination"
                  htmlFor="destination"
                  hint="Short name, e.g.Norway"
                >
                  <input
                    id="destination"
                    value={form.destination}
                    onChange={set('destination')}
                    required
                    placeholder="Short name, e.g.Norway"
                    className={inputCls}
                  />
                </Field>
                <Field
                  label="Location"
                  htmlFor="location"
                  hint="e.g. Tromsø, Norway"
                >
                  <input
                    id="location"
                    value={form.location}
                    onChange={set('location')}
                    required
                    placeholder="e.g. Tromsø, Norway"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Description" htmlFor="description">
                <textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={set('description')}
                  required
                  maxLength={2000}
                  placeholder="description"
                  className={inputCls}
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-3">
                <Field label="Price per person(₹)" htmlFor="price">
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={set('price')}
                    required
                    placeholder="price"
                    className={inputCls}
                  />
                </Field>
                <Field
                  label="Duration"
                  htmlFor="duration"
                  hint="e.g. 6 days / 5 nights"
                >
                  <input
                    id="duration"
                    value={form.duration}
                    onChange={set('duration')}
                    required
                    placeholder="e.g. 6 days / 5 nights"
                    className={inputCls}
                  />
                </Field>
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
              </div>

              <Field
                label="Gallery images"
                htmlFor="images"
                hint="One path or URL per line"
              >
                <textarea
                  id="images"
                  rows={3}
                  value={form.images}
                  onChange={set('images')}
                  className={inputCls}
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Included"
                  htmlFor="inclusions"
                  hint="One item per line"
                >
                  <textarea
                    id="inclusions"
                    rows={5}
                    value={form.inclusions}
                    onChange={set('inclusions')}
                    className={inputCls}
                  />
                </Field>
                <Field
                  label="Not included"
                  htmlFor="exclusions"
                  hint="One item per line"
                >
                  <textarea
                    id="exclusions"
                    rows={5}
                    value={form.exclusions}
                    onChange={set('exclusions')}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field
                label="Itinerary"
                htmlFor="itinerary"
                hint="One day per line: Title | Description. Days are numbered automatically."
              >
                <textarea
                  id="itinerary"
                  rows={5}
                  value={form.itinerary}
                  onChange={set('itinerary')}
                  placeholder="Arrival in Tromsø | Airport transfer and welcome dinner."
                  className={inputCls}
                />
              </Field>

              <Field
                label="FAQ"
                htmlFor="faq"
                hint="One per line: Question | Answer"
              >
                <textarea
                  id="faq"
                  rows={4}
                  value={form.faq}
                  onChange={set('faq')}
                  placeholder="Is the aurora guaranteed? | No, it is a natural phenomenon…"
                  className={inputCls}
                />
              </Field>

              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-3 border-t border-slate-200 pt-5"
              >
                <PressButton
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-900 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}{' '}
                  {saving
                    ? 'Saving...'
                    : isEdit
                      ? 'Save changes'
                      : 'Create tour'}
                </PressButton>
                <PressLink
                  to="/admin-tours"
                  className="rounded-lg border border-slate-300 px-6 py-2.5
                text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
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

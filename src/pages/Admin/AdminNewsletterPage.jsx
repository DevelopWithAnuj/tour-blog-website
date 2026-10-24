import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { Alert, inputCls } from '../../components/AdminParts.jsx';
import { useActionDialog } from '../../components/ActionDialog.jsx';

export default function AdminNewsletterPage() {
  const { toast } = useToast();
  const [count, setCount] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { requestConfirmation, dialog } = useActionDialog();

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get('/api/v1/admin/newsletter', { signal: controller.signal })
      .then((res) => setCount(res.data.data.subscribers))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const confirmed = await requestConfirmation({
      title: 'Send newsletter?',
      message: `Send this to ${count ?? 'all'} subscribers? This cannot be undone.`,
      confirmLabel: 'Send newsletter',
      danger: true,
    });
    if (!confirmed) return;
    setError('');
    setSending(true);
    try {
      const res = await axios.post('/api/v1/admin/newsletter/send', form);
      toast(res.data.message, { type: 'success' });
      setForm({ subject: '', message: '' });
    } catch (err) {
      const first = err.response?.data?.errors?.[0];
      setError(
        (first && Object.values(first)[0]) ||
          err.response?.data?.message ||
          'Unable to send.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl p-4 text-slate-900 sm:p-6 lg:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-800">
        Administration
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Newsletter</h1>
      <p className="mt-2 text-sm text-slate-600">
        {count === null ? '…' : count} active{' '}
        {count === 1 ? 'subscriber' : 'subscribers'}. Every email includes an
        unsubscribe link automatically.
      </p>

      <Alert>{error}</Alert>

      <form
        onSubmit={submit}
        className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div>
          <label
            htmlFor="subject"
            className="text-sm font-medium text-slate-700"
          >
            Subject
          </label>
          <input
            id="subject"
            value={form.subject}
            onChange={set('subject')}
            required
            maxLength={150}
            className={`${inputCls} mt-1.5`}
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className="text-sm font-medium text-slate-700"
          >
            Message
          </label>
          <textarea
            id="message"
            rows={12}
            value={form.message}
            onChange={set('message')}
            required
            className={`${inputCls} mt-1.5 leading-relaxed`}
          />
          <p className="mt-1 text-xs text-slate-500">
            Plain text. Leave a blank line between paragraphs.
          </p>
        </div>
        <button
          type="submit"
          disabled={sending || count === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60"
        >
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          {sending ? 'Starting…' : 'Send to subscribers'}
        </button>
      </form>
      {dialog}
    </section>
  );
}

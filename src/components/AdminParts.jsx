import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

export const EASE = [0.22, 1, 0.36, 1];

export const stagger = (gap = 0.06, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap, delayChildren } },
});

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

const SPRING = { type: 'spring', stiffness: 400, damping: 25 };

export const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-amber-600';

export const formatDate = (value) => {
  const d = new Date(value);
  return !value || Number.isNaN(d.getTime())
    ? '-'
    : d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

export const formatCurrency = (v) =>
  typeof v === 'number' ? `₹${v.toLocaleString('en-IN')}` : '—';

export function PressButton({ children, ...props }) {
  const off = props.disabled;
  return (
    <motion.button
      whileHover={
        off
          ? undefined
          : {
              scale: 1.03,
            }
      }
      whileTap={off ? undefined : { scale: 0.96 }}
      transition={SPRING}
      {...props}
    >
      {children}
    </motion.button>
  );
}

const MotionLink = motion.create(Link);

export function PressLink({ children, ...props }) {
  return (
    <MotionLink
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={SPRING}
      {...props}
    >
      {children}
    </MotionLink>
  );
}

export function Field({ label, htmlFor, hint, children }) {
  return (
    <motion.div variants={fadeUp}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-xs mt-1 text-slate-500">{hint}</p>}
    </motion.div>
  );
}

export function Alert({ tone = 'error', children }) {
  const tones = {
    error: 'border-rose-200 bg-rose-50 text-rose-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.div
          key={`${tone}:${String(children)}`}
          role={tone === 'error' ? 'alert' : 'status'}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="overflow-hidden"
        >
          <motion.div
            initial={{ y: -8 }}
            animate={{ y: 0, x: tone === 'error' ? [0, -6, 6, -3, 3, 0] : 0 }}
            transition={{ duration: 0.45 }}
            className={`mt-5 rounded-xl border p-4 text-sm ${tones[tone]}`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function StatusPill({ on, onLabel, offLabel }) {
  return (
    <motion.span
      key={String(on)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold inline-block ${
        on ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
      }`}
    >
      {on ? onLabel : offLabel}
    </motion.span>
  );
}

export function SkeletonRows({ label, count = 4 }) {
  return (
    <motion.div
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-3 p-5"
    >
      {Array.from({ length: count }, (_, n) => (
        <div
          key={n}
          style={{ animationDelay: `${n * 120}ms` }}
          className="h-14 animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </motion.div>
  );
}

export function Pager({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const btn =
    'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="mt-5 flex items-center justify-center gap-4"
    >
      <PressButton
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={btn}
      >
        Previous
      </PressButton>
      <span className="text-sm text-slate-600">
        page{' '}
        <motion.span
          key={page}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="inline-block"
        >
          {page}
        </motion.span>{' '}
        of {pages}
      </span>
      <PressButton
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className={btn}
      >
        Next
      </PressButton>
    </motion.div>
  );
}

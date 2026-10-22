export const STATUS_META = {
  draft: {
    label: 'Draft',
    cls: 'bg-slate-200 text-slate-700',
    hint: 'Only you can see this.',
  },
  pending: {
    label: 'In review',
    cls: 'bg-amber-100 text-amber-800',
    hint: 'Waiting for an admin to review it.',
  },
  published: {
    label: 'Published',
    cls: 'bg-emerald-100 text-emerald-800',
    hint: 'Live on the blog.',
  },
  rejected: {
    label: 'Needs changes',
    cls: 'bg-rose-100 text-rose-800',
    hint: 'Edit and resubmit.',
  },
};

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

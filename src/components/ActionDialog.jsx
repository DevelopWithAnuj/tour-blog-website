import { useEffect, useRef, useState } from 'react';

export function useActionDialog() {
  const [request, setRequest] = useState(null);
  const resolver = useRef(null);

  const ask = (options) =>
    new Promise((resolve) => {
      resolver.current = resolve;
      setRequest(options);
    });

  const requestConfirmation = (options) => ask({ kind: 'confirm', ...options });
  const requestText = (options) => ask({ kind: 'text', ...options });
  const finish = (value) => {
    resolver.current?.(value);
    resolver.current = null;
    setRequest(null);
  };

  const dialog = request ? (
    <Dialog
      key={`${request.kind}:${request.title}`}
      request={request}
      onFinish={finish}
    />
  ) : null;

  return { requestConfirmation, requestText, dialog };
}

function Dialog({ request, onFinish }) {
  const dialogRef = useRef(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="action-dialog-title"
      aria-describedby="action-dialog-message"
      onCancel={(event) => {
        event.preventDefault();
        onFinish(null);
      }}
      className="w-[min(92vw,30rem)] rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/65"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onFinish(request.kind === 'text' ? value : true);
        }}
      >
        <div className="p-6 sm:p-7">
          <h2
            id="action-dialog-title"
            className="font-display text-2xl font-semibold"
          >
            {request.title}
          </h2>
          <p
            id="action-dialog-message"
            className="mt-2 text-sm leading-relaxed text-slate-600"
          >
            {request.message}
          </p>
          {request.kind === 'text' && (
            <textarea
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={request.placeholder || 'Add a note for the author'}
              rows={4}
              className="mt-4 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
            />
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-7">
          <button
            type="button"
            onClick={() => onFinish(null)}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {request.cancelLabel || 'Keep editing'}
          </button>
          <button
            type="submit"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              request.danger
                ? 'bg-rose-700 text-white hover:bg-rose-800'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {request.confirmLabel || 'Continue'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

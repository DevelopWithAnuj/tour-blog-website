import { Link, useParams } from 'react-router-dom';
import { PageHero } from '../../components/InfoParts.jsx';
import { useState } from 'react';
import axios from 'axios';

export default function UnsubscribePage() {
  const { token } = useParams();
  const [state, setState] = useState('idle');

  const confirm = async () => {
    setState('working');
    try {
      await axios.post(`/api/v1/newsletter/unsubscribe/${token}`);
      setState('done');
    } catch (error) {
      setState('error');
    }
  };

  return (
    <>
      <PageHero eyebrow="Newsletter" title="Unsubscribe">
        {state === 'done'
          ? 'You are unsubscribed. You will not get any more trip-idea emails.'
          : 'Confirm below and we will stop sending you trip ideas.'}
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-8">
        {state === 'error' && (
          <p role="alert" className="mb-6 text-rose-300">
            This link is not valid or something went wrong. Email us and we will
            remove you by hand.
          </p>
        )}
        {state !== 'done' ? (
          <button
            onClick={confirm}
            disabled={state === 'working'}
            className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
          >
            {state === 'working' ? 'Working...' : 'Unsubscribe me'}
          </button>
        ) : (
          <Link to='/' className='text-amber-400 hover:text-amber-300' >Back to Drimora</Link>
        )}
      </div>
    </>
  );
}

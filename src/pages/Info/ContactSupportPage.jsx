import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHero } from '../../components/InfoParts.jsx';
import InquiryForm from '../../components/InquiryForm.jsx';

export default function ContactSupportPage() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    const controller = new AbortController();
    setBookingsLoading(true);
    axios
      .get('/api/v1/bookings', { signal: controller.signal })
      .then((res) => setBookings(res.data.data.bookings))
      .catch(() => {}) // the form still works without the picker
      .finally(() => {
        if (!controller.signal.aborted) setBookingsLoading(false);
      });
    return () => controller.abort();
  }, [user]);

  const wanted = params.get('booking');
  const defaultBookingId = bookings.some((b) => b._id === wanted) ? wanted : '';
  const ready = !authLoading && !bookingsLoading;

  return (
    <>
      <PageHero eyebrow="Support" title="Help with your trip.">
        Changed plans, payment questions or something not right? Tell us what
        happened and we will get back to you.
      </PageHero>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-10 md:px-8 lg:grid-cols-[1fr_22rem]">
        <div className="animate-fade-up">
          {ready ? (
            <InquiryForm
              type="support"
              bookings={bookings}
              defaultBookingId={defaultBookingId}
            />
          ) : (
            <div
              aria-label="Loading form"
              className="h-96 animate-pulse rounded-3xl bg-slate-900"
            />
          )}
        </div>

        <aside className="space-y-4">
          {user ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <h2 className="font-semibold text-white">Signed in</h2>
              <p className="mt-2 text-sm text-white/60">
                You are signed in as{' '}
                <span className="text-white">{user.email}</span>. Pick a booking
                in the form to link it to your message. Only bookings on your
                account are listed.
              </p>
            </div>
          ) : (
            !authLoading && (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
                <h2 className="font-semibold text-amber-200">
                  Need help with a booking?
                </h2>
                <p className="mt-2 text-sm text-white/65">
                  Sign in first. For privacy we only show and link bookings to
                  the account that made them. You can still send us a general
                  message below.
                </p>
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 active:scale-[0.97]"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              </div>
            )
          )}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h2 className="font-semibold text-white">
              Looking for quick answers?
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Cancellations, payments and account questions are covered in the{' '}
              <Link to="/help" className="text-amber-400 hover:text-amber-300">
                Help centre
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

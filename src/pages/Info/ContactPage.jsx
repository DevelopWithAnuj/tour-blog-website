import { Link } from 'react-router-dom';
import { Headset, LifeBuoy, Mail } from 'lucide-react';
import { PageHero } from '../../components/InfoParts.jsx';
import InquiryForm from '../../components/InquiryForm.jsx';

const cardCls =
  'flex gap-4 rounded-2xl border border-white/10 bg-slate-900 p-5';
const iconCls =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400';

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Tell us how we can help.">
        Questions about a tour, a destination or working with us? Send a message
        and we will reply to the email you give us. You do not need an account.
      </PageHero>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-10 md:px-8 lg:grid-cols-[1fr_22rem]">
        <div className="animate-fade-up">
          <InquiryForm type="general" />
        </div>

        <aside className="space-y-4">
          <div className={cardCls}>
            <span className={iconCls}>
              <Mail className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-white">
                Send us a message
              </span>
              <span className="text-sm text-white/60">
                Use the contact form and we will reply to your email.
              </span>
            </span>
          </div>

          <Link to="/help" className={cardCls}>
            <span className={iconCls}>
              <LifeBuoy className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-white">
                Help centre
              </span>
              <span className="text-sm text-white/60">
                Quick answers on booking, payments and cancellations.
              </span>
            </span>
          </Link>

          <Link to="/contact-support" className={cardCls}>
            <span className={iconCls}>
              <Headset className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-white">
                Help with a booking
              </span>
              <span className="text-sm text-white/60">
                Sign in so we can link your message to the right booking.
              </span>
            </span>
          </Link>
        </aside>
      </div>
    </>
  );
}

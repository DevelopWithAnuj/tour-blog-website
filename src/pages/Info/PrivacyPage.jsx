import LegalPage from '../../components/LegalPage.jsx';
import { SITE } from '../../config/site.js';

const sections = [
  {
    id: 'who-we-are',
    heading: 'Who we are',
    paragraphs: [
      `${SITE.legalName} ("${SITE.name}", "we") runs this website, where you can browse tours, book trips and read travel stories. This policy explains what personal information we collect and how we use it.`,
    ],
  },
  {
    id: 'what-we-collect',
    heading: 'Information we collect',
    items: [
      'Account details: your name, username, email address and password. Passwords are stored only as a one-way hash.',
      'Sign-in with Google or GitHub: your name, email address and the provider account ID, which we receive from the provider.',
      'Booking details: traveller name, email, phone number, travel date, number of travellers and any special requests.',
      'Messages: what you send through our contact and support forms, plus the booking you attach, if any.',
      'Basic request logs, such as the page requested, response status and timing, used for security and debugging.',
    ],
  },
  {
    id: 'payments',
    heading: 'Payments',
    paragraphs: [
      'Checkout on this site is currently a demonstration. No real payment is taken, and card numbers entered are used only to simulate a result and are not stored.',
      'If we add a live payment provider, card details will be handled by that provider and we will update this policy first.',
    ],
  },
  {
    id: 'cookies',
    heading: 'Cookies and local storage',
    paragraphs: [
      'We use strictly necessary cookies to keep you signed in. They are marked httpOnly, so scripts on the page cannot read them. We do not use advertising or analytics cookies.',
      'Your browser also stores one preference locally: whether the dashboard sidebar is collapsed.',
    ],
  },
  {
    id: 'how-we-use',
    heading: 'How we use your information',
    items: [
      'To create and secure your account, and to send verification and password-reset emails.',
      'To process bookings, show them in your dashboard and handle cancellations.',
      'To reply to your messages and help with bookings.',
      'To prevent abuse, such as spam and repeated failed sign-ins.',
    ],
  },
  {
    id: 'sharing',
    heading: 'Who we share it with',
    paragraphs: [
      'We do not sell your personal information. We share it only with services that help us run the site (for example, the email delivery service that sends account emails and the sign-in providers you choose to use) and where the law requires it.',
    ],
  },
  {
    id: 'retention',
    heading: 'How long we keep it',
    paragraphs: [
      'We keep account and booking information while your account is active and for as long as needed for the purposes above. We keep messages for as long as needed to resolve your request.',
    ],
  },
  {
    id: 'your-choices',
    heading: 'Your choices',
    paragraphs: [
      'You can ask us to access, correct or delete the personal information we hold about you by emailing us. We may need to verify your identity first, and we may keep information we are legally required to retain.',
    ],
  },
  {
    id: 'security',
    heading: 'Security',
    paragraphs: [
      'We protect accounts with hashed passwords, httpOnly cookies, rate limiting and input validation. No system is perfectly secure, so please use a strong, unique password.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to this policy',
    paragraphs: [
      'When we change this policy we will update the date at the top of this page.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="What we collect, why we collect it, and the choices you have."
      sections={sections}
    />
  );
}

import LegalPage from '../../components/LegalPage.jsx';
import { CANCELLATION, SITE } from '../../config/site.js';

const sections = [
  {
    id: 'acceptance',
    heading: 'Accepting these terms',
    paragraphs: [
      `By using ${SITE.name} or creating an account you agree to these terms. If you do not agree, please do not use the site.`,
    ],
  },
  {
    id: 'accounts',
    heading: 'Your account',
    items: [
      'Give accurate information and verify your email address before signing in.',
      'Keep your password confidential. You are responsible for activity on your account.',
      'We may suspend or close accounts that are used to abuse the site or other people.',
    ],
  },
  {
    id: 'bookings',
    heading: 'Tours and bookings',
    paragraphs: [
      'Each tour page lists the itinerary, what is included and what is not. Please read it before you book.',
      'A booking is created when you submit traveller details and continue to payment, and it is confirmed when payment succeeds. Travel dates must be in the future, and one online booking can include up to 10 travellers.',
    ],
  },
  {
    id: 'prices',
    heading: 'Prices and payment',
    paragraphs: [
      'Prices are shown in Indian rupees (₹) per person. The total is the price multiplied by the number of travellers.',
      'Checkout is currently a demonstration, so no real payment is taken.',
    ],
  },
  {
    id: 'cancellations',
    heading: 'Cancellations and refunds',
    items: [
      'You can cancel an unpaid booking at any time from your dashboard.',
      `You can cancel a paid booking within ${CANCELLATION.windowHours} hours of payment, and never within ${CANCELLATION.minHoursBeforeTravel} hours of the travel date.`,
      'Outside that window, please contact support and quote your booking ID.',
      'Cancelling a paid booking inside the window marks the payment as refunded.',
    ],
  },
  {
    id: 'changes-by-us',
    heading: 'Changes by us',
    paragraphs: [
      'We may update or withdraw a tour from the site. Withdrawing a tour does not remove existing bookings for it.',
    ],
  },
  {
    id: 'travel-requirements',
    heading: 'Travel documents',
    paragraphs: [
      'You are responsible for valid passports, visas, insurance and any health requirements for your trip. Visa fees and insurance are listed under Not included on tours where they are not covered.',
    ],
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable use',
    items: [
      'Do not attempt to break, overload or scrape the site.',
      'Do not use the contact forms to send spam or abusive messages.',
      'Do not use the site for unlawful purposes.',
    ],
  },
  {
    id: 'content',
    heading: 'Our content',
    paragraphs: [
      'Tour descriptions, stories and images on this site belong to us or our licensors. Please do not copy or republish them without permission.',
    ],
  },
  {
    id: 'liability',
    heading: 'Liability',
    paragraphs: [
      'The site is provided as is. To the extent the law allows, we are not liable for indirect or consequential losses. Nothing in these terms limits liability that cannot be limited by law.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to these terms',
    paragraphs: [
      'When we change these terms we will update the date at the top of this page. Continuing to use the site means you accept the updated terms.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      intro="The rules for using Drimora and booking tours through it."
      sections={sections}
    />
  );
}

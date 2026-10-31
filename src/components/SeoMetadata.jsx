import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Drimora';
const DEFAULT_IMAGE = '/img/login-hero.webp';

export function SeoMetadata({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  structuredData,
}) {
  const canonicalUrl =
    typeof window === 'undefined'
      ? undefined
      : new URL(window.location.pathname, window.location.origin).href;
  const imageUrl =
    typeof window === 'undefined'
      ? image
      : new URL(image, window.location.origin).href;
  const pageTitle = `${title} | ${SITE_NAME}`;

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow'}
      />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </>
  );
}

const routeMetadata = {
  '/': [
    'Hand-built tours and travel stories',
    'Discover hand-built tours, practical destination guides, and travel stories for your next journey.',
  ],
  '/about': [
    'About Drimora',
    'Meet Drimora and learn how we create carefully planned, memorable travel experiences.',
  ],
  '/contact': [
    'Contact Drimora',
    'Get in touch with the Drimora team for help planning your next trip.',
  ],
  '/contact-support': [
    'Contact travel support',
    'Get help with an existing trip, booking, or travel question from Drimora support.',
  ],
  '/help': [
    'Travel help centre',
    'Find answers to common questions about Drimora tours, bookings, and travel.',
  ],
  '/privacy': [
    'Privacy policy',
    'Read how Drimora handles personal information and protects your privacy.',
  ],
  '/terms': [
    'Terms and conditions',
    'Review the terms and conditions for using Drimora travel services.',
  ],
  '/locations': [
    'Explore travel destinations',
    'Explore destinations and find a Drimora tour for your next journey.',
  ],
  '/tours': [
    'Explore tours',
    'Browse curated Drimora tours, compare destinations, and find your next trip.',
  ],
  '/blog': [
    'Travel guides and stories',
    'Read practical destination guides, itineraries, food stories, and travel advice.',
  ],
  '/login': ['Sign in', 'Sign in to manage your Drimora trips and bookings.'],
  '/register': [
    'Create an account',
    'Create a Drimora account to plan and manage your trips.',
  ],
  '/forgot-password': [
    'Reset your password',
    'Request a password reset for your Drimora account.',
  ],
};

const isPrivatePath = (pathname) =>
  /^\/(?:admin(?:-|\/|$)|dashboard(?:\/|$)|my-posts(?:\/|$)|booking(?:\/|$)|login(?:\/|$)|register(?:\/|$)|forgot-password(?:\/|$)|reset-password(?:\/|$)|unsubscribe(?:\/|$)|inquiry-tracker(?:\/|$))/.test(
    pathname
  );

export function RouteSeoMetadata() {
  const { pathname } = useLocation();

  if (isPrivatePath(pathname)) {
    return (
      <SeoMetadata
        title="Account"
        description="Manage your Drimora account and travel."
        noindex
      />
    );
  }

  if (pathname.startsWith('/tours/')) {
    return (
      <SeoMetadata
        title="Tour details"
        description="Explore this curated Drimora tour, including its destination, itinerary, and trip details."
      />
    );
  }

  if (pathname.startsWith('/blog/')) {
    return (
      <SeoMetadata
        title="Travel story"
        description="Read destination guides and travel stories from Drimora."
        type="article"
      />
    );
  }

  const [title, description] = routeMetadata[pathname] || [
    'Page not found',
    'The page you requested could not be found.',
  ];
  return <SeoMetadata title={title} description={description} />;
}

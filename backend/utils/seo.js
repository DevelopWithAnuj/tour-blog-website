export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

export const getSiteUrl = (req) => {
  const configuredUrl = process.env.SITE_URL || process.env.CLIENT_URL;
  const origin = configuredUrl || `${req.protocol}://${req.get('host')}`;
  return new URL(origin).origin;
};

export const buildSitemap = ({ siteUrl, tours, posts }) => {
  const urls = [
    '/',
    '/about',
    '/contact',
    '/contact-support',
    '/help',
    '/locations',
    '/tours',
    '/blog',
    '/privacy',
    '/terms',
    ...tours.map((tour) => ({
      path: `/tours/${encodeURIComponent(tour._id)}`,
      lastModified: tour.updatedAt,
    })),
    ...posts.map((post) => ({
      path: `/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt || post.publishedAt,
    })),
  ];
  const entries = urls.map((item) => {
    const path = typeof item === 'string' ? item : item.path;
    const lastModified =
      typeof item === 'string' || !item.lastModified
        ? ''
        : `<lastmod>${new Date(item.lastModified).toISOString()}</lastmod>`;
    return `<url><loc>${escapeHtml(new URL(path, siteUrl).href)}</loc>${lastModified}</url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`;
};

export const buildRobots = (siteUrl) =>
  [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin-',
    'Disallow: /dashboard',
    'Disallow: /my-posts',
    'Disallow: /booking',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /forgot-password',
    'Disallow: /reset-password',
    'Disallow: /unsubscribe',
    'Disallow: /inquiry-tracker',
    `Sitemap: ${new URL('/sitemap.xml', siteUrl).href}`,
    '',
  ].join('\n');

export const renderSeoHead = (html, metadata) => {
  const title = escapeHtml(`${metadata.title} | Drimora`);
  const description = escapeHtml(metadata.description);
  const canonicalUrl = escapeHtml(metadata.url);
  const image = escapeHtml(metadata.image);
  const jsonLd = metadata.structuredData
    ? JSON.stringify(metadata.structuredData).replace(/</g, '\\u003c')
    : '';
  const tags = [
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta name="robots" content="${metadata.noindex ? 'noindex, nofollow' : 'index, follow'}" />`,
    `<meta property="og:type" content="${escapeHtml(metadata.type || 'website')}" />`,
    '<meta property="og:site_name" content="Drimora" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    ...(jsonLd
      ? [`<script type="application/ld+json">${jsonLd}</script>`]
      : []),
  ].join('');

  return html
    .replace(
      /<link\s+rel="canonical"[^>]*\/?>|<meta\s+(?:name="(?:robots|twitter:[^"]+)"|property="(?:og:[^"]+)")[^>]*\/?>/g,
      ''
    )
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`
    )
    .replace('</head>', `${tags}</head>`);
};

const staticRouteMetadata = {
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

export const getRouteSeoMetadata = (pathname) => {
  const privatePath =
    /^\/(?:admin(?:-|\/|$)|dashboard(?:\/|$)|my-posts(?:\/|$)|booking(?:\/|$)|login(?:\/|$)|register(?:\/|$)|forgot-password(?:\/|$)|reset-password(?:\/|$)|unsubscribe(?:\/|$)|inquiry-tracker(?:\/|$))/.test(
      pathname
    );
  const entry = staticRouteMetadata[pathname];

  if (entry) {
    return { title: entry[0], description: entry[1], noindex: privatePath };
  }
  if (pathname.startsWith('/tours/')) {
    return {
      title: 'Tour details',
      description:
        'Explore this curated Drimora tour, including its destination, itinerary, and trip details.',
    };
  }
  if (pathname.startsWith('/blog/')) {
    return {
      title: 'Travel story',
      description: 'Read destination guides and travel stories from Drimora.',
      type: 'article',
    };
  }
  if (privatePath) {
    return {
      title: 'Account',
      description: 'Manage your Drimora account and travel.',
      noindex: true,
    };
  }
  return {
    title: 'Page not found',
    description: 'The page you requested could not be found.',
    noindex: true,
  };
};

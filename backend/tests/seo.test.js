import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRobots,
  buildSitemap,
  escapeHtml,
  getRouteSeoMetadata,
  getSiteUrl,
  renderSeoHead,
} from '../utils/seo.js';

test('robots rules exclude account routes and declare the sitemap', () => {
  const robots = buildRobots('https://travel.example');

  assert.match(robots, /Disallow: \/admin-/);
  assert.match(robots, /Disallow: \/booking/);
  assert.match(robots, /Sitemap: https:\/\/travel\.example\/sitemap\.xml/);
});

test('sitemap includes public pages and published content only', () => {
  const sitemap = buildSitemap({
    siteUrl: 'https://travel.example',
    tours: [{ _id: 'tour-1' }],
    posts: [{ slug: 'published-story' }],
  });

  assert.match(sitemap, /https:\/\/travel\.example\/tours\/tour-1/);
  assert.match(sitemap, /https:\/\/travel\.example\/blog\/published-story/);
  assert.doesNotMatch(sitemap, /admin|dashboard|booking/);
});

test('SEO head escapes page metadata and includes Open Graph and JSON-LD', () => {
  const html = renderSeoHead(
    '<html><head><title>Drimora</title><meta name="description" content="Default" /></head></html>',
    {
      title: 'A <script> story',
      description: 'A "great" & safe story',
      image: 'https://travel.example/cover.webp',
      type: 'article',
      url: 'https://travel.example/blog/story',
      structuredData: { '@type': 'Article', headline: 'Story' },
    }
  );

  assert.match(html, /A &lt;script&gt; story \| Drimora/);
  assert.match(html, /A &quot;great&quot; &amp; safe story/);
  assert.match(html, /property="og:type" content="article"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"headline":"Story"/);
  assert.doesNotMatch(html, /<script> story/);
});

test('site URL prefers configured canonical URL, then request origin', () => {
  const previous = process.env.SITE_URL;
  process.env.SITE_URL = 'https://travel.example/path';
  assert.equal(
    getSiteUrl({ protocol: 'http', get: () => 'localhost:3000' }),
    'https://travel.example'
  );

  delete process.env.SITE_URL;
  assert.equal(
    getSiteUrl({ protocol: 'https', get: () => 'travel.example' }),
    'https://travel.example'
  );

  if (previous === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = previous;
});

test('HTML metadata escaping handles XML and attribute characters', () => {
  assert.equal(
    escapeHtml(`<tag a="b">&'`),
    '&lt;tag a=&quot;b&quot;&gt;&amp;&#39;'
  );
});

test('route metadata is distinct for public pages and private pages are noindex', () => {
  assert.equal(getRouteSeoMetadata('/about').title, 'About Drimora');
  assert.equal(
    getRouteSeoMetadata('/privacy').description,
    'Read how Drimora handles personal information and protects your privacy.'
  );
  assert.equal(getRouteSeoMetadata('/dashboard').noindex, true);
  assert.equal(getRouteSeoMetadata('/unknown-page').noindex, true);
});

test('route metadata output omits structured data when none is provided', () => {
  const html = renderSeoHead(
    '<html><head><title>Drimora</title><meta name="description" content="Default" /></head></html>',
    {
      title: 'Account',
      description: 'Manage your Drimora account and travel.',
      image: 'https://travel.example/cover.webp',
      url: 'https://travel.example/dashboard',
      noindex: true,
    }
  );

  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(html, /application\/ld\+json/);
});

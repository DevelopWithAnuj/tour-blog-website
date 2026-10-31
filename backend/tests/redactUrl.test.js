import assert from 'node:assert/strict';
import test from 'node:test';
import { redactPath, redactUrl } from '../utils/redact-url.js';

const TOKEN = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

test('redacts tokens in every sensitive route', () => {
  const cases = [
    ['/reset-password/', '/reset-password/[redacted]'],
    ['/verify-email/', '/verify-email/[redacted]'],
    ['/inquiry-tracker/', '/inquiry-tracker/[redacted]'],
    ['/unsubscribe/', '/unsubscribe/[redacted]'],
    ['/api/v1/contact/track/', '/api/v1/contact/track/[redacted]'],
    ['/api/v1/auth/reset-password/', '/api/v1/auth/reset-password/[redacted]'],
    ['/api/v1/auth/verify-email/', '/api/v1/auth/verify-email/[redacted]'],
    ['/api/v1/newsletter/unsubscribe/', '/api/v1/newsletter/unsubscribe/[redacted]'],
  ];

  for (const [prefix, expected] of cases) {
    const result = redactPath(`${prefix}${TOKEN}`);
    assert.equal(result, expected);
    assert.equal(result.includes(TOKEN), false);
  }
});

test('drops anything after the token segment', () => {
  assert.equal(
    redactPath(`/reset-password/${TOKEN}/extra`),
    '/reset-password/[redacted]'
  );
});

test('leaves normal paths untouched', () => {
  for (const path of [
    '/',
    '/api/v1/tours',
    '/api/v1/tours/64b0c0ffee',
    '/blog/some-slug-1a2b3c',
    '/reset-password', // no token segment
    '/api/v1/healthcheck',
  ]) {
    assert.equal(redactPath(path), path);
  }
});

test('redactUrl keeps the query string and redacts the path part', () => {
  assert.equal(redactUrl('/api/v1/tours?q=paris&page=2'), '/api/v1/tours?q=paris&page=2');
  assert.equal(
    redactUrl(`/reset-password/${TOKEN}?x=1`),
    '/reset-password/[redacted]?x=1'
  );
});

test('handles missing input', () => {
  assert.equal(redactUrl(), '');
  assert.equal(redactPath(), '');
});

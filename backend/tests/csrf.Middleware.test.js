import assert from 'node:assert/strict';
import test from 'node:test';

process.env.CORS_ORIGIN =
  'https://travel.example, https://admin.travel.example';

const { verifyRequestOrigin } =
  await import('../middleware/csrf.Middleware.js');

const checkRequest = (method, headers = {}) => {
  let called = false;
  let error;
  const req = {
    method,
    get: (name) => headers[name.toLowerCase()],
  };

  verifyRequestOrigin(req, {}, (nextError) => {
    called = true;
    error = nextError;
  });

  return { called, error };
};

test('allows state-changing requests from each configured origin', () => {
  for (const origin of [
    'https://travel.example',
    'https://admin.travel.example',
  ]) {
    const result = checkRequest('POST', { origin });
    assert.equal(result.called, true);
    assert.equal(result.error, undefined);
  }
});

test('rejects state-changing requests from untrusted or missing origins', () => {
  for (const headers of [
    { origin: 'https://attacker.example' },
    {},
    { origin: 'null' },
    { referer: 'not a valid URL' },
  ]) {
    const result = checkRequest('POST', headers);
    assert.equal(result.called, true);
    assert.equal(result.error.statusCode, 403);
  }
});

test('uses a trusted Referer when Origin is absent', () => {
  const result = checkRequest('PATCH', {
    referer: 'https://travel.example/admin/tours',
  });

  assert.equal(result.called, true);
  assert.equal(result.error, undefined);
});

test('does not require an origin for safe methods', () => {
  for (const method of ['GET', 'HEAD', 'OPTIONS']) {
    const result = checkRequest(method);
    assert.equal(result.called, true);
    assert.equal(result.error, undefined);
  }
});

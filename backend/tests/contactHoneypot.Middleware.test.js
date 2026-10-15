import assert from 'node:assert/strict';
import test from 'node:test';
import { ignoreHoneypot } from '../middleware/contactHoneypot.Middleware.js';

test('returns success for honeypot submissions without continuing to storage', () => {
  let nextCalled = false;
  let responseStatus;
  let responseBody;
  const res = {
    status(status) {
      responseStatus = status;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  ignoreHoneypot({ body: { website: 'x' } }, res, () => {
    nextCalled = true;
  });

  assert.equal(responseStatus, 201);
  assert.equal(responseBody.message, 'Thanks, we received your message.');
  assert.equal(nextCalled, false);
});

test('passes normal submissions to authentication and validation', () => {
  let nextCalled = false;

  ignoreHoneypot({ body: { website: '' } }, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

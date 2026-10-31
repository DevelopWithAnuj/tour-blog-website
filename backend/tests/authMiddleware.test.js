import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';

const { verifyJWT, optionalAuth, requireRole } = await import(
  '../middleware/auth.Middleware.js'
);
const { User } = await import('../models/User.models.js');
const { RefreshSession } = await import('../models/RefreshSession.models.js');

const userId = new mongoose.Types.ObjectId().toString();
const sid = new mongoose.Types.ObjectId().toString();
const nowSec = () => Math.floor(Date.now() / 1000);

const sign = (payload = {}, options = { expiresIn: '15m' }, secret) =>
  jwt.sign(
    { _id: userId, sid, ...payload },
    secret || process.env.ACCESS_TOKEN_SECRET,
    options
  );

const cookieReq = (token) => ({ header: () => undefined, cookies: { accessToken: token } });

const run = (handler, req) =>
  new Promise((resolve) => {
    handler(req, {}, (err) => resolve({ err, req }));
  });

const mockLookups = (t, { user = { _id: userId, role: 'user' }, sessionAlive = true } = {}) => {
  t.mock.method(User, 'findById', () => ({ select: async () => user }));
  const exists = t.mock.method(RefreshSession, 'exists', async () =>
    sessionAlive ? { _id: sid } : null
  );
  return { exists, user };
};

test('verifyJWT rejects requests without a token', async () => {
  const { err } = await run(verifyJWT, { header: () => undefined, cookies: {} });
  assert.equal(err.statusCode, 401);
  assert.equal(err.message, 'Unauthorized request');
});

test('verifyJWT accepts a valid token with a live session (cookie)', async (t) => {
  const { exists, user } = mockLookups(t);
  const { err, req } = await run(verifyJWT, cookieReq(sign()));

  assert.equal(err, undefined);
  assert.equal(req.user, user);
  assert.equal(req.sid, sid);
  assert.deepEqual(exists.mock.calls[0].arguments[0], { _id: sid, user: userId });
});

test('verifyJWT accepts a Bearer token', async (t) => {
  mockLookups(t);
  const token = sign();
  const req = {
    header: (name) => (name === 'Authorization' ? `Bearer ${token}` : undefined),
    cookies: {},
  };
  const { err } = await run(verifyJWT, req);
  assert.equal(err, undefined);
  assert.equal(req.sid, sid);
});

test('verifyJWT rejects when the session was revoked (logout)', async (t) => {
  mockLookups(t, { sessionAlive: false });
  const { err, req } = await run(verifyJWT, cookieReq(sign()));
  assert.equal(err.statusCode, 401);
  assert.equal(err.message, 'Invalid access token');
  assert.equal(req.user, undefined);
});

test('verifyJWT rejects legacy tokens without a sid', async (t) => {
  const { exists } = mockLookups(t);
  const token = jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
  const { err } = await run(verifyJWT, cookieReq(token));
  assert.equal(err.statusCode, 401);
  assert.equal(exists.mock.callCount(), 0);
});

test('verifyJWT rejects when the user no longer exists', async (t) => {
  mockLookups(t, { user: null });
  const { err } = await run(verifyJWT, cookieReq(sign()));
  assert.equal(err.statusCode, 401);
});

test('verifyJWT rejects tokens issued before the last password change', async (t) => {
  const changedAt = new Date((nowSec() - 50) * 1000);
  mockLookups(t, { user: { _id: userId, passwordChangedAt: changedAt } });
  const old = sign({ iat: nowSec() - 100 });
  const { err } = await run(verifyJWT, cookieReq(old));
  assert.equal(err.statusCode, 401);
  assert.equal(err.message, 'Invalid access token');
});

test('verifyJWT accepts tokens issued after the password change', async (t) => {
  const changedAt = new Date((nowSec() - 100) * 1000);
  mockLookups(t, { user: { _id: userId, passwordChangedAt: changedAt } });
  const fresh = sign({ iat: nowSec() - 10 });
  const { err } = await run(verifyJWT, cookieReq(fresh));
  assert.equal(err, undefined);
});

test('password change in the same second does not lock out the new token', async (t) => {
  // iat has 1s resolution; passwordChangedAt is floored to seconds before comparing
  const changedAt = new Date();
  mockLookups(t, { user: { _id: userId, passwordChangedAt: changedAt } });
  const { err } = await run(verifyJWT, cookieReq(sign({ iat: nowSec() })));
  assert.equal(err, undefined);
});

test('verifyJWT reports expired tokens', async (t) => {
  mockLookups(t);
  const { err } = await run(verifyJWT, cookieReq(sign({}, { expiresIn: -10 })));
  assert.equal(err.statusCode, 401);
  assert.equal(err.message, 'Access token expired');
});

test('verifyJWT rejects tokens signed with another secret', async (t) => {
  mockLookups(t);
  const { err } = await run(
    verifyJWT,
    cookieReq(sign({}, { expiresIn: '15m' }, 'some-other-secret'))
  );
  assert.equal(err.statusCode, 401);
  assert.equal(err.message, 'Invalid access token');
});

test('optionalAuth attaches the user for a live session', async (t) => {
  const { user } = mockLookups(t);
  const { err, req } = await run(optionalAuth, cookieReq(sign()));
  assert.equal(err, undefined);
  assert.equal(req.user, user);
  assert.equal(req.sid, sid);
});

test('optionalAuth treats a revoked session as a guest', async (t) => {
  mockLookups(t, { sessionAlive: false });
  const { err, req } = await run(optionalAuth, cookieReq(sign()));
  assert.equal(err, undefined);
  assert.equal(req.user, undefined);
});

test('requireRole: 401 without user, 403 for wrong role, passes for right role', async () => {
  const guard = requireRole('admin');

  let result = await run(guard, {});
  assert.equal(result.err.statusCode, 401);

  result = await run(guard, { user: { role: 'user' } });
  assert.equal(result.err.statusCode, 403);

  result = await run(guard, { user: { role: 'admin' } });
  assert.equal(result.err, undefined);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const { User } = await import('../models/User.models.js');
const { RefreshSession } = await import('../models/RefreshSession.models.js');

const signAccess = (payload) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
const mockSession = (t, { alive }) => {
  t.mock.method(User, 'findById', () => ({
    select: async () => ({ _id: 'u1', role: 'user' }),
  }));
  t.mock.method(RefreshSession, 'exists', async () =>
    alive ? { _id: 's1' } : null
  );
};

process.env.ACCESS_TOKEN_SECRET = 'test-secret';

const { optionalAuth } = await import('../middleware/auth.Middleware.js');
const { default: contactRouter } = await import('../routes/contact.Routes.js');
const { errorHandler } = await import('../middleware/errorMiddleware.js');

const runOptionalAuth = (req) =>
  new Promise((resolve, reject) => {
    optionalAuth(req, {}, (err) => (err ? reject(err) : resolve(req)));
  });

test('optionalAuth continues for guests with no token', async () => {
  const req = await runOptionalAuth({ header: () => undefined, cookies: {} });
  assert.equal(req.user, undefined);
});

test('optionalAuth treats an invalid token as a guest', async () => {
  const req = await runOptionalAuth({
    header: () => undefined,
    cookies: { accessToken: 'not-a-jwt' },
  });
  assert.equal(req.user, undefined);
});

test('POST /contact reaches validation instead of crashing in optionalAuth', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/contact', contactRouter);
  app.use(errorHandler);

  const server = app.listen(0);
  try {
    const { port } = server.address();
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A' }),
    });
    const body = await res.json();

    assert.equal(res.status, 422);
    assert.equal(body.message, 'Received data is not valid');
  } finally {
    server.closeAllConnections();
    server.close();
  }
});

test('optionalAuth attaches the user when the session is alive', async (t) => {
  mockSession(t, { alive: true });
  const token = signAccess({ _id: 'u1', sid: new mongoose.Types.ObjectId().toString() });
  const req = await runOptionalAuth({
    header: () => undefined,
    cookies: { accessToken: token },
  });
  assert.equal(req.user._id, 'u1');
});

test('optionalAuth treats a revoked session as a guest', async (t) => {
  mockSession(t, { alive: false });
  const token = signAccess({ _id: 'u1', sid: new mongoose.Types.ObjectId().toString() });
  const req = await runOptionalAuth({
    header: () => undefined,
    cookies: { accessToken: token },
  });
  assert.equal(req.user, undefined);
});

test('optionalAuth treats a legacy token without sid as a guest', async (t) => {
  mockSession(t, { alive: true });
  const req = await runOptionalAuth({
    header: () => undefined,
    cookies: { accessToken: signAccess({ _id: 'u1' }) },
  });
  assert.equal(req.user, undefined);
});

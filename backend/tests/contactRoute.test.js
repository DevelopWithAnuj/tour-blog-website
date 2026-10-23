import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';

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

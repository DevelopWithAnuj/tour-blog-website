import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';

process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

const {
  createSession,
  setAuthCookies,
  clearAuthCookies,
  hashToken,
  MAX_SESSIONS,
  ROTATION_GRACE_MS,
} = await import('../utils/session.js');
const { RefreshSession } = await import('../models/RefreshSession.models.js');
const { User } = await import('../models/User.models.js');
const { CookieOptions } = await import('../utils/constants.js');

const makeRes = () => ({
  cookies: {},
  cleared: [],
  cookie(name, value, options) {
    this.cookies[name] = { value, options };
    return this;
  },
  clearCookie(name, options) {
    this.cleared.push({ name, options });
    return this;
  },
});

const makeUser = () =>
  new User({ username: 'jane_doe', email: 'jane@example.com', role: 'user' });

test('constants are what the design promises', () => {
  assert.equal(MAX_SESSIONS, 10);
  assert.equal(ROTATION_GRACE_MS, 10_000);
});

test('hashToken is a deterministic sha256 hex digest', () => {
  assert.match(hashToken('abc'), /^[0-9a-f]{64}$/);
  assert.equal(hashToken('abc'), hashToken('abc'));
  assert.notEqual(hashToken('abc'), hashToken('abd'));
});

test('setAuthCookies sets both cookies with httpOnly options', () => {
  const res = makeRes();
  setAuthCookies(res, { accessToken: 'a', refreshToken: 'r' });

  assert.equal(res.cookies.accessToken.value, 'a');
  assert.equal(res.cookies.accessToken.options.httpOnly, true);
  assert.equal(res.cookies.accessToken.options.maxAge, 15 * 60 * 1000);
  assert.equal(res.cookies.refreshToken.value, 'r');
  assert.equal(res.cookies.refreshToken.options.maxAge, CookieOptions.maxAge);
});

test('setAuthCookies without a refresh token leaves the refresh cookie alone', () => {
  const res = makeRes();
  setAuthCookies(res, { accessToken: 'a' });
  assert.equal(res.cookies.accessToken.value, 'a');
  assert.equal(res.cookies.refreshToken, undefined);
});

test('clearAuthCookies clears both cookies without maxAge', () => {
  const res = makeRes();
  clearAuthCookies(res);

  assert.deepEqual(res.cleared.map((c) => c.name), ['accessToken', 'refreshToken']);
  for (const { options } of res.cleared) {
    assert.equal('maxAge' in options, false);
    assert.equal(options.httpOnly, true);
  }
});

test('User tokens carry sid; refresh tokens are unique via jti', () => {
  const user = makeUser();
  const access = jwt.decode(user.generateAccessToken('sess-1'));
  assert.equal(access.sid, 'sess-1');
  assert.equal(access._id, String(user._id));
  assert.equal(access.role, 'user');

  const a = user.generateRefreshToken('sess-1');
  const b = user.generateRefreshToken('sess-1');
  assert.notEqual(a, b); // same second, still different
  assert.equal(jwt.decode(a).sid, 'sess-1');
  assert.ok(jwt.decode(a).jti);
});

test('createSession stores a hashed refresh token tied to the sid', async (t) => {
  const user = makeUser();
  let saved;
  t.mock.method(RefreshSession.prototype, 'save', async function () {
    saved = this;
    return this;
  });
  t.mock.method(RefreshSession, 'find', () => ({
    sort() { return this; },
    skip() { return this; },
    select() { return this; },
    lean: async () => [],
  }));
  const deleteMany = t.mock.method(RefreshSession, 'deleteMany', async () => ({}));

  const before = Date.now();
  const { accessToken, refreshToken } = await createSession(user, {
    get: () => 'x'.repeat(500),
  });

  assert.equal(saved.tokenHash, hashToken(refreshToken));
  assert.equal(String(saved.user), String(user._id));
  assert.equal(saved.userAgent.length, 300);
  assert.ok(saved.expiresAt.getTime() >= before + CookieOptions.maxAge - 5000);
  assert.equal(jwt.decode(refreshToken).sid, String(saved._id));
  assert.equal(jwt.decode(accessToken).sid, String(saved._id));
  assert.equal(deleteMany.mock.callCount(), 0);
});

test('createSession evicts sessions beyond the per-user cap', async (t) => {
  const user = makeUser();
  const stale = [{ _id: 'old-1' }, { _id: 'old-2' }];
  let sortArg;
  let skipArg;
  t.mock.method(RefreshSession.prototype, 'save', async function () {
    return this;
  });
  t.mock.method(RefreshSession, 'find', () => ({
    sort(arg) { sortArg = arg; return this; },
    skip(n) { skipArg = n; return this; },
    select() { return this; },
    lean: async () => stale,
  }));
  const deleteMany = t.mock.method(RefreshSession, 'deleteMany', async () => ({}));

  await createSession(user, { get: () => 'ua' });

  assert.deepEqual(sortArg, { lastUsedAt: -1 });
  assert.equal(skipArg, MAX_SESSIONS);
  assert.deepEqual(deleteMany.mock.calls[0].arguments[0], {
    _id: { $in: ['old-1', 'old-2'] },
  });
});

import assert from 'node:assert/strict';
import test from 'node:test';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

const { loginUser, logoutUser, refreshAccessToken } =
  await import('../controllers/auth.Controller.js');
const { User } = await import('../models/User.models.js');
const { RefreshSession } = await import('../models/RefreshSession.models.js');
const { hashToken } = await import('../utils/session.js');

const GENERIC = 'Invalid email or password';
const PASSWORD = 'correct-horse-battery';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 4);

const makeRes = () => ({
  statusCode: undefined,
  body: undefined,
  cookies: {},
  cleared: [],
  status(code) {
    this.statusCode = code;
    return this;
  },
  cookie(name, value, options) {
    this.cookies[name] = { value, options };
    return this;
  },
  clearCookie(name, options) {
    this.cleared.push({ name, options });
    return this;
  },
  json(body) {
    this.body = body;
    this._resolve?.(this);
    return this;
  },
});

// Resolves with res when the handler responds, rejects when it calls next(err)
const call = (handler, req, res = makeRes()) =>
  new Promise((resolve, reject) => {
    res._resolve = resolve;
    handler(req, res, reject);
  });

const req = (extra = {}) => ({
  body: {},
  cookies: {},
  get: () => 'test-agent',
  ...extra,
});

const makeUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  email: 'jane@example.com',
  password: PASSWORD_HASH,
  isEmailVerified: true,
  failedLoginAttempts: 0,
  lockUntil: undefined,
  generateAccessToken: (sid) => `access-${sid}`,
  generateRefreshToken: (sid) => `refresh-${sid}`,
  ...overrides,
});

const loginReq = (password = PASSWORD) =>
  req({ body: { email: 'Jane@Example.com', password } });

/* ------------------------------- login ------------------------------- */

const mockLogin = (t, user, { attempts = 1 } = {}) => {
  let current = user;
  const findOne = t.mock.method(User, 'findOne', () => ({
    select: async () => current,
  }));
  const findOneAndUpdate = t.mock.method(User, 'findOneAndUpdate', () => ({
    select: async () => ({ failedLoginAttempts: attempts }),
  }));
  const updateOne = t.mock.method(User, 'updateOne', async () => ({}));
  t.mock.method(User, 'findById', async () => current);
  const save = t.mock.method(
    RefreshSession.prototype,
    'save',
    async function () {
      return this;
    }
  );
  t.mock.method(RefreshSession, 'find', () => ({
    sort() {
      return this;
    },
    skip() {
      return this;
    },
    select() {
      return this;
    },
    lean: async () => [],
  }));
  t.mock.method(RefreshSession, 'deleteMany', async () => ({}));
  return {
    findOne,
    findOneAndUpdate,
    updateOne,
    save,
    setUser: (u) => {
      current = u;
    },
  };
};

const loginFailure = async (r) => {
  try {
    await call(loginUser, r);
  } catch (error) {
    return error;
  }
  assert.fail('login should have been rejected');
};

test('login: unknown email gets the generic 401 and no counter is touched', async (t) => {
  const m = mockLogin(t, null);
  const error = await loginFailure(loginReq());
  assert.equal(error.statusCode, 401);
  assert.equal(error.message, GENERIC);
  assert.equal(m.findOneAndUpdate.mock.callCount(), 0);
  assert.equal(m.save.mock.callCount(), 0);
});

test('login: wrong password increments the failure counter atomically', async (t) => {
  const user = makeUser();
  const m = mockLogin(t, user, { attempts: 1 });
  const error = await loginFailure(loginReq('wrong-password'));

  assert.equal(error.statusCode, 401);
  assert.equal(error.message, GENERIC);
  const [filter, update] = m.findOneAndUpdate.mock.calls[0].arguments;
  assert.deepEqual(filter, { _id: user._id });
  assert.deepEqual(update, { $inc: { failedLoginAttempts: 1 } });
  assert.equal(m.updateOne.mock.callCount(), 0); // not locked yet
});

test('login: fifth failure locks the account for ~15 minutes and resets the counter', async (t) => {
  const user = makeUser();
  const m = mockLogin(t, user, { attempts: 5 });
  await loginFailure(loginReq('wrong-password'));

  const [filter, update] = m.updateOne.mock.calls[0].arguments;
  assert.deepEqual(filter, { _id: user._id });
  assert.equal(update.$set.failedLoginAttempts, 0);
  const lockMs = update.$set.lockUntil.getTime() - Date.now();
  assert.ok(lockMs > 14 * 60 * 1000 && lockMs <= 15 * 60 * 1000);
});

test('login: unknown email and wrong password are indistinguishable', async (t) => {
  const m = mockLogin(t, null);
  const unknown = await loginFailure(loginReq());
  m.setUser(makeUser());
  const wrong = await loginFailure(loginReq('wrong-password'));

  assert.equal(unknown.statusCode, wrong.statusCode);
  assert.equal(unknown.message, wrong.message);
  assert.equal(unknown.code, wrong.code);
  assert.deepEqual(unknown.errors, wrong.errors);
});

test('login: locked account rejects even the correct password, without extending the lock', async (t) => {
  const user = makeUser({ lockUntil: new Date(Date.now() + 10 * 60 * 1000) });
  const m = mockLogin(t, user);
  const error = await loginFailure(loginReq());

  assert.equal(error.statusCode, 401);
  assert.equal(error.message, GENERIC);
  assert.equal(m.findOneAndUpdate.mock.callCount(), 0);
  assert.equal(m.updateOne.mock.callCount(), 0);
  assert.equal(m.save.mock.callCount(), 0);
});

test('login: an expired lock no longer blocks and is cleared on success', async (t) => {
  const user = makeUser({
    lockUntil: new Date(Date.now() - 1000),
    failedLoginAttempts: 0,
  });
  const m = mockLogin(t, user);
  const res = await call(loginUser, loginReq());

  assert.equal(res.statusCode, 200);
  const [, update] = m.updateOne.mock.calls[0].arguments;
  assert.deepEqual(update, {
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: '' },
  });
});

test('login: success creates a session and sets both httpOnly cookies', async (t) => {
  const user = makeUser();
  const m = mockLogin(t, user);
  const res = await call(loginUser, loginReq());

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user, user);
  assert.match(res.cookies.accessToken.value, /^access-/);
  assert.match(res.cookies.refreshToken.value, /^refresh-/);
  assert.equal(res.cookies.accessToken.options.httpOnly, true);
  assert.equal(m.save.mock.callCount(), 1);
  assert.equal(m.updateOne.mock.callCount(), 0); // nothing to reset
});

test('login: success resets earlier failures', async (t) => {
  const user = makeUser({ failedLoginAttempts: 3 });
  const m = mockLogin(t, user);
  await call(loginUser, loginReq());

  const [, update] = m.updateOne.mock.calls[0].arguments;
  assert.deepEqual(update, {
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: '' },
  });
});

test('login: EMAIL_NOT_VERIFIED is only revealed after a correct password', async (t) => {
  const user = makeUser({ isEmailVerified: false });
  const m = mockLogin(t, user);

  const withRight = await loginFailure(loginReq());
  assert.equal(withRight.statusCode, 401);
  assert.equal(withRight.code, 'EMAIL_NOT_VERIFIED');
  assert.equal(m.save.mock.callCount(), 0);

  const withWrong = await loginFailure(loginReq('wrong-password'));
  assert.equal(withWrong.message, GENERIC);
  assert.equal(withWrong.code, undefined);
});

test('login: OAuth-only accounts (no password) cannot sign in with a password', async (t) => {
  mockLogin(t, makeUser({ password: undefined }));
  const error = await loginFailure(loginReq('anything'));
  assert.equal(error.statusCode, 401);
  assert.equal(error.message, GENERIC);
});

/* ------------------------------- logout ------------------------------ */

const sessionId = new mongoose.Types.ObjectId().toString();
const userId = new mongoose.Types.ObjectId().toString();

const refreshJwt = (
  payload = {},
  secret = process.env.REFRESH_TOKEN_SECRET,
  options = { expiresIn: '7d' }
) =>
  jwt.sign(
    {
      _id: userId,
      sid: sessionId,
      jti: crypto.randomBytes(4).toString('hex'),
      ...payload,
    },
    secret,
    options
  );

test('logout: deletes only the current session and clears cookies', async (t) => {
  const deleteOne = t.mock.method(
    RefreshSession,
    'deleteOne',
    async () => ({})
  );
  const res = await call(
    logoutUser,
    req({ cookies: { refreshToken: refreshJwt() } })
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(deleteOne.mock.calls[0].arguments[0], {
    _id: sessionId,
    user: userId,
  });
  assert.deepEqual(
    res.cleared.map((c) => c.name),
    ['accessToken', 'refreshToken']
  );
  for (const { options } of res.cleared)
    assert.equal('maxAge' in options, false);
});

test('logout: an expired access token alone still logs the session out', async (t) => {
  const deleteOne = t.mock.method(
    RefreshSession,
    'deleteOne',
    async () => ({})
  );
  const expired = jwt.sign(
    { _id: userId, sid: sessionId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: -60 }
  );
  await call(logoutUser, req({ cookies: { accessToken: expired } }));
  assert.equal(deleteOne.mock.callCount(), 1);
});

test('logout: with no cookies it still succeeds and clears cookies', async (t) => {
  const deleteOne = t.mock.method(
    RefreshSession,
    'deleteOne',
    async () => ({})
  );
  const res = await call(logoutUser, req());
  assert.equal(res.statusCode, 200);
  assert.equal(deleteOne.mock.callCount(), 0);
  assert.equal(res.cleared.length, 2);
});

test("logout: a forged token cannot delete someone else's session", async (t) => {
  const deleteOne = t.mock.method(
    RefreshSession,
    'deleteOne',
    async () => ({})
  );
  const forged = refreshJwt({}, 'attacker-secret');
  await call(logoutUser, req({ cookies: { refreshToken: forged } }));
  assert.equal(deleteOne.mock.callCount(), 0);
});

/* ------------------------------- refresh ----------------------------- */

const mockRefresh = (
  t,
  { session, user = makeUser(), rotated = {}, fresh = null } = {}
) => {
  t.mock.method(RefreshSession, 'findOne', async () => session);
  t.mock.method(User, 'findById', async () => user);
  const findOneAndUpdate = t.mock.method(
    RefreshSession,
    'findOneAndUpdate',
    async () => rotated
  );
  t.mock.method(RefreshSession, 'findById', async () => fresh);
  const deleteOne = t.mock.method(
    RefreshSession,
    'deleteOne',
    async () => ({})
  );
  return { findOneAndUpdate, deleteOne };
};

const refreshFailure = async (r) => {
  const res = makeRes();
  try {
    await call(refreshAccessToken, r, res);
  } catch (error) {
    return { error, res };
  }
  assert.fail('refresh should have been rejected');
};

const baseSession = (token, extra = {}) => ({
  _id: new mongoose.Types.ObjectId(sessionId),
  user: userId,
  tokenHash: hashToken(token),
  ...extra,
});

test('refresh: missing cookie is 401', async () => {
  const { error } = await refreshFailure(req());
  assert.equal(error.statusCode, 401);
  assert.equal(error.message, 'Unauthorized access');
});

test('refresh: garbage token is 401 and cookies are cleared', async () => {
  const { error, res } = await refreshFailure(
    req({ cookies: { refreshToken: 'nope' } })
  );
  assert.equal(error.statusCode, 401);
  assert.equal(error.message, 'Invalid refresh token');
  assert.equal(res.cleared.length, 2);
});

test('refresh: legacy tokens without sid are rejected before any DB lookup', async (t) => {
  const findOne = t.mock.method(RefreshSession, 'findOne', async () => null);
  const legacy = jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
  const { error } = await refreshFailure(
    req({ cookies: { refreshToken: legacy } })
  );
  assert.equal(error.statusCode, 401);
  assert.equal(findOne.mock.callCount(), 0);
});

test('refresh: unknown or revoked session is 401', async (t) => {
  mockRefresh(t, { session: null });
  const { error } = await refreshFailure(
    req({ cookies: { refreshToken: refreshJwt() } })
  );
  assert.equal(error.statusCode, 401);
  assert.equal(error.message, 'Invalid refresh token');
});

test('refresh: deleted user is 401', async (t) => {
  const token = refreshJwt();
  mockRefresh(t, { session: baseSession(token), user: null });
  const { error } = await refreshFailure(
    req({ cookies: { refreshToken: token } })
  );
  assert.equal(error.statusCode, 401);
});

test('refresh: normal rotation issues new tokens and keeps the old hash for the grace window', async (t) => {
  const token = refreshJwt();
  const session = baseSession(token);
  const m = mockRefresh(t, { session });
  const before = Date.now();

  const res = await call(
    refreshAccessToken,
    req({ cookies: { refreshToken: token } })
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.cookies.refreshToken.value, `refresh-${session._id}`);
  assert.equal(res.cookies.accessToken.value, `access-${session._id}`);

  const [filter, update] = m.findOneAndUpdate.mock.calls[0].arguments;
  assert.deepEqual(filter, { _id: session._id, tokenHash: hashToken(token) }); // atomic guard
  assert.equal(update.$set.prevHash, hashToken(token));
  assert.equal(update.$set.tokenHash, hashToken(`refresh-${session._id}`));
  const grace = update.$set.prevValidUntil.getTime() - before;
  assert.ok(grace >= 9000 && grace <= 11000);
  assert.equal(m.deleteOne.mock.callCount(), 0);
});

test('refresh: losing a parallel race gets only a new access token (no refresh cookie)', async (t) => {
  const token = refreshJwt();
  const session = baseSession(token);
  const fresh = {
    ...session,
    tokenHash: 'someone-elses-new-hash',
    prevHash: hashToken(token),
    prevValidUntil: new Date(Date.now() + 5000),
  };
  const m = mockRefresh(t, { session, rotated: null, fresh });

  const res = await call(
    refreshAccessToken,
    req({ cookies: { refreshToken: token } })
  );

  assert.equal(res.statusCode, 200);
  assert.ok(res.cookies.accessToken);
  assert.equal(res.cookies.refreshToken, undefined);
  assert.equal(m.deleteOne.mock.callCount(), 0);
});

test('refresh: just-rotated token inside the grace window only gets an access token', async (t) => {
  const token = refreshJwt();
  const session = baseSession('already-rotated', {
    prevHash: hashToken(token),
    prevValidUntil: new Date(Date.now() + 5000),
  });
  const m = mockRefresh(t, { session });

  const res = await call(
    refreshAccessToken,
    req({ cookies: { refreshToken: token } })
  );

  assert.equal(res.statusCode, 200);
  assert.ok(res.cookies.accessToken);
  assert.equal(res.cookies.refreshToken, undefined);
  assert.equal(m.findOneAndUpdate.mock.callCount(), 0);
});

test('refresh: reuse after the grace window revokes that session', async (t) => {
  const token = refreshJwt();
  const session = baseSession('already-rotated', {
    prevHash: hashToken(token),
    prevValidUntil: new Date(Date.now() - 1000),
  });
  const m = mockRefresh(t, { session });

  const { error, res } = await refreshFailure(
    req({ cookies: { refreshToken: token } })
  );

  assert.equal(error.statusCode, 401);
  assert.equal(error.message, 'Refresh token reuse detected');
  assert.deepEqual(m.deleteOne.mock.calls[0].arguments[0], {
    _id: session._id,
  });
  assert.equal(res.cleared.length, 2);
});

test('refresh: a token that matches neither current nor previous hash revokes the session', async (t) => {
  const token = refreshJwt();
  const session = baseSession('current', { prevHash: 'something-else' });
  const m = mockRefresh(t, { session });

  const { error } = await refreshFailure(
    req({ cookies: { refreshToken: token } })
  );

  assert.equal(error.statusCode, 401);
  assert.equal(m.deleteOne.mock.callCount(), 1);
});

import crypto from 'crypto';

const COOKIE_NAME = 'oauth_state';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/v1/auth',
};

const sameValue = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

export const cookieStateStore = {
  store(req, meta, callback) {
    const state = crypto.randomBytes(24).toString('hex');
    req.res.cookies(COOKIE_NAME, state, {
      ...cookieOptions,
      maxAge: 10 * 60 * 1000,
    });
    callback(null, state);
  },

  verify(req, provideState, callback) {
    const expected = req.cookies?.[COOKIE_NAME];
    req.res.clearCookie(COOKIE_NAME, cookieOptions);

    if (!expected || !provideState || !sameValue(expected, provideState)) {
      return callback(null, false, {
        message: 'Invalid or missing OAuth state',
      });
    }
    return callback(null, true, provideState);
  },
};

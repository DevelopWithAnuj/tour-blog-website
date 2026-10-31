import crypto from 'crypto';
import { RefreshSession } from '../models/RefreshSession.models.js';
import { CookieOptions } from './constants.js';

export const MAX_SESSIONS = 10;
export const ROTATION_GRACE_MS = 10 * 1000;
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_PATH = '/api/v1/auth';


export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie('accessToken', accessToken, {
    ...CookieOptions,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...CookieOptions,
      path: REFRESH_COOKIE_PATH,
    });
  }
};

export const clearAuthCookies = (res) => {
  const { maxAge, ...opts } = CookieOptions;
  res.clearCookie('accessToken', opts);
  res.clearCookie('refreshToken', { ...opts, path: REFRESH_COOKIE_PATH });
  res.clearCookie('refreshToken', opts);
};

export const createSession = async (user, req) => {
  const session = new RefreshSession({
    user: user._id,
    userAgent: (req.get('user-agent') || '').slice(0, 300),
    expiresAt: new Date(Date.now() + CookieOptions.maxAge),
  });
  const refreshToken = user.generateRefreshToken(session._id);
  session.tokenHash = hashToken(refreshToken);
  await session.save();

  const stale = await RefreshSession.find({ user: user._id })
    .sort({ lastUsedAt: -1 })
    .skip(MAX_SESSIONS)
    .select('_id')
    .lean();
  if (stale.length) {
    await RefreshSession.deleteMany({ _id: { $in: stale.map((s) => s._id) } });
  }

  return { accessToken: user.generateAccessToken(session._id), refreshToken };
};

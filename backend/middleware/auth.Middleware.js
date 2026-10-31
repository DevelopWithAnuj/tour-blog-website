import jwt from 'jsonwebtoken';
import { User } from '../models/User.models.js';
import { RefreshSession } from '../models/RefreshSession.models.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus, UserRolesEnum } from '../utils/constants.js';

const invalid = () =>
  new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid access token');

const authenticate = async (token) => {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  if (!decoded?.sid) throw invalid();

  const [user, session] = await Promise.all([
    User.findById(decoded._id).select('+passwordChangedAt'),
    RefreshSession.exists({ _id: decoded.sid, user: decoded._id }),
  ]);
  if (!user || !session) throw invalid();

  if (
    user.passwordChangedAt &&
    decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
  ) {
    throw invalid();
  }
  return { user, sid: String(decoded.sid) };
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  const token = req.cookies?.accessToken || bearerToken;

  if (!token) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized request');
  }

  try {
    const { user, sid } = await authenticate(token);
    req.user = user;
    req.sid = sid;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Access token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) throw invalid();
    throw error;
  }
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  const token = req.cookies?.accessToken || bearerToken;

  if (token) {
    try {
      const { user, sid } = await authenticate(token);
      req.user = user;
      req.sid = sid;
    } catch {
      // Expired or invalid token: treat as a guest.
    }
  }
  next();
});

export const requireRole = (requiredRole) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized request');
    }

    if (req.user.role !== requiredRole) {
      throw new ApiError(HttpStatus.FORBIDDEN, 'Forbidden: insufficient role');
    }

    next();
  });

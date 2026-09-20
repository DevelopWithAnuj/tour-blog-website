import jwt from 'jsonwebtoken';
import { User } from '../models/User.models.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus, UserRolesEnum } from '../utils/constants.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : null;

  const token = req.cookies?.accessToken || bearerToken;

  if (!token) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid access token');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Access token expired');
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid access token');
    }

    throw error;
  }
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

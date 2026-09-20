import jwt from 'jsonwebtoken';
import { User } from '../models/User.models.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus } from '../utils/constants.js';

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

    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken -emailVerificationToken -emailVerificationExpiry'
    );

    if (!user) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid access token');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid access token');
  }
});
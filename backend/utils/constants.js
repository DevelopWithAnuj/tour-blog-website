import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({
  path: fileURLToPath(new URL('../.env', import.meta.url)),
});

const normalizeAccessTokenExpiry = () => {
  const configured = process.env.ACCESS_TOKEN_EXPIRY?.trim().toLowerCase();

  if (!configured) return '15m';

  if (configured.endsWith('m')) {
    const minutes = Number.parseInt(configured, 10);
    return Number.isNaN(minutes) || minutes > 15 ? '15m' : configured;
  }

  return '15m';
};

export const UserRolesEnum = {
  ADMIN: 'admin',
  USER: 'user',
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const SERVER_URL = process.env.SERVER_URL || `http://${HOST}:${PORT}`;

export const Config = {
  PORT,
  HOST,
  MONGO_URI: process.env.MONGO_URI,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  NODE_ENV,
  SERVER_URL,
  ACCESS_TOKEN_EXPIRY: normalizeAccessTokenExpiry(),
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',
};

export const ApiPath = {
  BASE: '/api/v1',
  HEALTHCHECK: '/healthcheck',
  AUTH: '/auth',
  VERIFY_EMAIL: '/verify-email',
  USERS: '/users',
  TOURS: '/tours',
  BOOKINGS: '/bookings',
  BLOGS: '/blogs',
  ADMIN: '/admin',
};

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

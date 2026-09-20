import dotenv from 'dotenv';

dotenv.config({
  path: './backend/.env',
});

export const UserRolesEnum = {
  ADMIN: 'admin',
  USER: 'user',
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const Config = {
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || '0.0.0.0',
  MONGO_URI: process.env.MONGO_URI,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  // IS_PRODUCTION: process.env.NODE_ENV === 'production',
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
  INTERNAL_SERVER_ERROR: 500,
};

export const CookieOptions = {
  httpOnly: true,
  secure: Config.IS_PRODUCTION,
  sameSite: 'lax',
};
